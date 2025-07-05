import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Retell } from 'retell-sdk';

// Initialize Retell SDK
const retell = new Retell({
  apiKey: process.env.RETELL_API_KEY!,
});

// Type for menu items, consistent with other files
type MenuItem = {
  category: string;
  name: string;
  description: string | null;
  price: number | null;
  size: string | null;
};

// Function to format the menu into a readable string for the AI
function formatMenuForPrompt(menuItems: MenuItem[]): string {
  if (!menuItems || menuItems.length === 0) {
    return "Le menu n'est pas disponible pour le moment.";
  }

  // Group items by category
  const menuByCategory = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  let menuString = "";
  for (const category in menuByCategory) {
    menuString += `\n### ${category}\n`;
    menuByCategory[category].forEach(item => {
      menuString += `- ${item.name}`;
      if (item.size) menuString += ` (${item.size})`;
      if (item.price) menuString += `: ${item.price}€`;
      if (item.description) menuString += `\n  *${item.description}*`;
      menuString += "\n";
    });
  }
  return menuString;
}

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  try {
    // 1. Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 2. Fetch pizzeria details and its menu items
    const { data: pizzeria, error: pizzeriaError } = await supabase
      .from('pizzerias')
      .select('*, menu_items(*)')
      .eq('user_id', user.id)
      .single();

    if (pizzeriaError || !pizzeria) {
      return NextResponse.json({ error: 'Pizzeria profile not found.' }, { status: 404 });
    }

    // TODO: The Retell LLM ID should be stored in the 'pizzerias' table
    // For now, we use the hardcoded one.
    const llmId = "llm_ca82b222ab062c357d6e5b706d15"; 
    if (!llmId) {
        return NextResponse.json({ error: "Retell LLM ID is not configured for this pizzeria." }, { status: 500 });
    }

    // 3. Construct the new, detailed prompt
    const menuString = formatMenuForPrompt(pizzeria.menu_items);

    const newPrompt = `
      Tu es un assistant IA pour la pizzeria nommée "{{pizzeria_name}}". Ton objectif est de prendre les commandes par téléphone de manière amicale et efficace.

      Voici les informations sur la pizzeria :
      - Nom : {{pizzeria_name}}
      - Adresse : {{pizzeria_address}}
      - Téléphone de contact (pour information) : {{pizzeria_contact_phone}}

      Voici le menu que tu dois utiliser :
      {{menu_string}}

      Instructions pour la prise de commande :
      1.  Salue le client chaleureusement.
      2.  Présente-toi comme l'assistant de "{{pizzeria_name}}".
      3.  Prends la commande du client en te basant STRICTEMENT sur le menu ci-dessus.
      4.  Si un client demande quelque chose qui n'est pas au menu, informe-le poliment que ce n'est pas disponible.
      5.  Une fois la commande terminée, récapitule-la clairement (articles, quantités et prix total).
      6.  Demande confirmation au client avant de finaliser.
      7.  Termine l'appel poliment.
    `;

    // 4. Update the Retell LLM with the new prompt
    await retell.llm.update(llmId, {
      general_prompt: newPrompt,
      default_dynamic_variables: {
        pizzeria_name: pizzeria.name,
        pizzeria_address: pizzeria.address || 'Non spécifiée',
        pizzeria_contact_phone: pizzeria.contact_phone || 'Non spécifié',
        menu_string: menuString,
      },
    });

    return NextResponse.json({ message: "Agent conversationnel mis à jour avec succès !" });

  } catch (error) {
    console.error("Error updating agent prompt:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: `Failed to update agent prompt: ${errorMessage}` }, { status: 500 });
  }
}