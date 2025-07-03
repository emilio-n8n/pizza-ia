import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Ce webhook est appelé par Retell AI au début de chaque appel.
// Il doit renvoyer les "llm_context" qui contiennent toutes les informations
// personnalisées pour la pizzeria concernée.

export async function POST(request: Request) {
  try {
    // L'ID de l'agent Retell est envoyé dans le corps de la requête
    const { agent_id } = await request.json();

    if (!agent_id) {
      return NextResponse.json({ error: 'Agent ID manquant' }, { status: 400 });
    }

    // 1. Trouver la pizzeria associée à cet agent Retell
    // (Note: Vous devrez stocker l'agent_id dans votre table 'pizzerias' lors de sa création)
    const { data: pizzeria, error: pizzeriaError } = await supabase
      .from('pizzerias')
      .select('*')
      .eq('retell_agent_id', agent_id) // Vous devrez ajouter ce champ à votre table
      .single();

    if (pizzeriaError || !pizzeria) {
      throw new Error(`Pizzeria non trouvée pour l'agent ${agent_id}`);
    }

    // 2. Récupérer le menu structuré de cette pizzeria
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('*')
      .eq('pizzeria_id', pizzeria.id)
      .eq('is_available', true);

    if (menuError) {
      throw new Error(`Erreur lors de la récupération du menu pour ${pizzeria.name}`);
    }

    // 3. Formater les données pour Retell AI
    // C'est ici que vous construisez le contexte que l'IA utilisera.
    // Soyez très descriptif pour que l'IA comprenne bien.
    const llmContext = {
      pizzeria_name: pizzeria.name,
      pizzeria_address: pizzeria.address,
      pizzeria_phone: pizzeria.contact_phone,
      // Exemple de variable personnalisée
      special_offer: "Offre du jour : une boisson offerte pour toute pizza achetée.",
      delivery_rules: `Nous livrons dans un rayon de ${pizzeria.delivery_radius_km} km.`,
      
      // Le menu doit être dans un format simple à lire pour l'IA
      menu: `
        Voici le menu disponible aujourd'hui chez ${pizzeria.name}:
        ${menuItems.map(item => 
          `- ${item.category} - ${item.name} (${item.description || ''}) : ${item.price}€ ${item.size ? `(taille ${item.size})` : ''}`
        ).join('\n')}
      `,
    };

    // 4. Renvoyer ce contexte à Retell AI
    return NextResponse.json(llmContext);

  } catch (error: unknown) {
    console.error("Erreur dans le webhook Retell:", error);
    const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}