import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai';

// Remplacez par votre clé d'API Gemini
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Le prompt pour guider Gemini
const prompt = `
  Analyse l'image de ce menu de pizzeria. Extrais les informations et structure-les dans un format JSON valide.
  Le JSON doit contenir une liste d'objets, où chaque objet représente un plat (une pizza, une boisson, etc.).
  Chaque objet doit avoir les clés suivantes : "category", "name", "description", "price", "size".
  - "category": Le type de plat (ex: "Pizzas Classiques", "Boissons", "Desserts").
  - "name": Le nom du plat (ex: "Margherita", "Coca-Cola").
  - "description": La liste des ingrédients.
  - "price": Le prix en nombre. S'il y a plusieurs prix pour différentes tailles, crée un objet par taille.
  - "size": La taille (ex: "M", "L", ou null si non applicable).

  Ne renvoie que le JSON, sans texte explicatif avant ou après.
`;

async function getMenuJsonFromImage(imageUrl: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
  
  const imageResponse = await fetch(imageUrl);
  const imageBuffer = await imageResponse.arrayBuffer();
  const imageBase64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));

  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType: imageResponse.headers.get('content-type') || 'image/jpeg',
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const response = await result.response;
  const text = response.text();
  
  // Nettoyage pour extraire uniquement le JSON
  const jsonText = text.match(/```json\n([\s\S]*?)\n```/)?.[1] || text;
  return JSON.parse(jsonText);
}


Deno.serve(async (req) => {
  try {
    const { filePath } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Créer une URL signée pour que Gemini puisse accéder à l'image
    const { data: { signedUrl }, error: urlError } = await supabaseAdmin
      .storage
      .from('menu_images')
      .createSignedUrl(filePath, 60); // Valide 1 minute

    if (urlError) throw urlError;

    // Analyser l'image avec Gemini
    const menuItems = await getMenuJsonFromImage(signedUrl);

    // Récupérer l'ID de la pizzeria à partir du chemin du fichier
    const { data: { user } } = await supabaseAdmin.auth.getUser();
     if (!user) throw new Error("User not found");

    const { data: pizzeria, error: p_error } = await supabaseAdmin
        .from('pizzerias')
        .select('id')
        .eq('owner_id', user.id)
        .single();
    
    if(p_error || !pizzeria) throw p_error || new Error("Pizzeria not found");


    // Insérer les éléments du menu dans la base de données
    const itemsToInsert = menuItems.map(item => ({
      ...item,
      pizzeria_id: pizzeria.id,
    }));

    const { error: insertError } = await supabaseAdmin
      .from('menu_items')
      .insert(itemsToInsert);

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ success: true, menu: itemsToInsert }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
