import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Define the type for a single menu item
type MenuItem = {
  category: string;
  name: string;
  description: string;
  price: number;
  size: string | null;
};

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// Helper function to convert a stream to a buffer
async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookieStore).get(name)?.value
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            (await cookieStore).set({ name, value, ...options })
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            (await cookieStore).set({ name, value: '', ...options })
          } catch {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  try {
    // 1. Check for authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 2. Get the image from the form data
    const formData = await req.formData();
    const file = formData.get('menuImage') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // 3. Convert image to a buffer and then to base64
    const imageBuffer = await streamToBuffer(file.stream());
    const imageBase64 = imageBuffer.toString('base64');

    // 4. Prepare the request for Gemini with the detailed prompt
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const prompt = `
      Analyse l'image de ce menu de restaurant. Extrais chaque plat et organise-les par catégorie (par exemple: "Pizzas", "Boissons", "Desserts").
      Pour chaque plat, extrais son nom, sa description (si disponible), son prix, et sa taille (si spécifiée, comme "Moyenne", "Grande").
      Retourne le résultat sous forme d'un objet JSON valide. Le JSON doit avoir une seule clé "menu" qui est un tableau d'objets.
      Chaque objet doit avoir les clés "category" (string), "name" (string), "description" (string, ou une chaîne vide si absente), "price" (number), et "size" (string, ou null si non applicable).
      Ne retourne RIEN d'autre que le JSON.
      Exemple de format attendu :
      {
        "menu": [
          { "category": "Pizzas", "name": "Pizza Margherita", "description": "Sauce tomate, mozzarella, basilic", "price": 12.50, "size": null },
          { "category": "Pizzas", "name": "Pizza Regina", "description": "Sauce tomate, jambon, champignons", "price": 14.00, "size": "Moyenne" },
          { "category": "Boissons", "name": "Coca-Cola", "description": "", "price": 3.50, "size": "33cl" }
        ]
      }
    `;

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: file.type,
      },
    };

    // 5. Call Gemini API
    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    
    // Clean up the response to ensure it's valid JSON
    const jsonString = responseText.replace(/```json|```/g, '').trim();
    const menuData: { menu: MenuItem[] } = JSON.parse(jsonString);

    // 6. Find the user's pizzeria
    const { data: pizzeria, error: pizzeriaError } = await supabase
      .from('pizzerias')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (pizzeriaError || !pizzeria) {
      return NextResponse.json({ error: 'Pizzeria not found for this user. Please create your pizzeria profile first.' }, { status: 404 });
    }

    // 7. Clear old menu items for this pizzeria before inserting new ones
    const { error: deleteError } = await supabase
      .from('menu_items')
      .delete()
      .eq('pizzeria_id', pizzeria.id);

    if (deleteError) {
      console.error('Supabase delete error:', deleteError);
      throw new Error('Failed to clear the old menu from the database.');
    }

    // 8. Save the extracted menu to the database
    const menuItemsToInsert = menuData.menu.map((item: MenuItem) => ({
      pizzeria_id: pizzeria.id,
      category: item.category,
      name: item.name,
      description: item.description,
      price: item.price,
      size: item.size,
      is_available: true, // Default to available
    }));

    const { error: insertError } = await supabase
      .from('menu_items')
      .insert(menuItemsToInsert);

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      throw new Error('Failed to save the new menu to the database.');
    }

    return NextResponse.json({ message: 'Menu analyzed and saved successfully!', menu: menuData.menu });

  } catch (error) {
    console.error('Error in analyze-menu API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}