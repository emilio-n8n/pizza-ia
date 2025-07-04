import { Retell } from "retell-sdk";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const retell = new Retell({
  apiKey: process.env.RETELL_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { userId, ...pizzeriaDetails } = await req.json();

    // Construct a detailed prompt using all pizzeria details
    const newPrompt = `You are a friendly AI assistant for a pizza restaurant. Your main goal is to take pizza orders from customers. Be polite, efficient, and confirm the order before finalizing. Here are the details of the pizzeria you are representing:\n\n` +
      `Nom de la pizzeria: ${pizzeriaDetails.nom_pizzeria || 'Non spécifié'}\n` +
      `Adresse complète: ${pizzeriaDetails.adresse_pizzeria || 'Non spécifiée'}\n` +
      `Numéro de téléphone: ${pizzeriaDetails.telephone_pizzeria || 'Non spécifié'}\n` +
      `Jours et horaires d'ouverture: ${pizzeriaDetails.horaires_ouverture || 'Non spécifiés'}\n` +
      `Zones de livraison desservies: ${pizzeriaDetails.zones_livraison || 'Non spécifiées'}\n` +
      `Menu détaillé: ${pizzeriaDetails.menu_pizzeria || 'Non spécifié'}\n` +
      `Liste des pizzas disponibles: ${pizzeriaDetails.liste_pizzas || 'Non spécifiée'}\n` +
      `Tailles proposées: ${pizzeriaDetails.tailles_pizza || 'Non spécifiées'}\n` +
      `Types de pâte: ${pizzeriaDetails.types_pate || 'Non spécifiés'}\n` +
      `Garnitures disponibles: ${pizzeriaDetails.garnitures_disponibles || 'Non spécifiées'}\n` +
      `Boissons: ${pizzeriaDetails.boissons || 'Non spécifiées'}\n` +
      `Desserts: ${pizzeriaDetails.desserts || 'Non spécifiés'}\n` +
      `Options de personnalisation autorisées: ${pizzeriaDetails.options_personnalisation || 'Non spécifiées'}\n` +
      `Méthodes de paiement acceptées: ${pizzeriaDetails.paiements_acceptes || 'Non spécifiées'}\n` +
      `Offres/promo en cours: ${pizzeriaDetails.promos || 'Non spécifiées'}\n` +
      `Instructions spéciales autorisées: ${pizzeriaDetails.instructions_autorisees || 'Non spécifiées'}\n` +
      `Langues supportées: ${pizzeriaDetails.langues_supportees || 'Non spécifiées'}\n\n` +
      `Based on this information, assist the customer with their pizza order.`;

    // Update the Retell LLM with the new prompt
    // Make sure to use the correct LLM ID for your agent
    const llmId = "llm_ca82b222ab062c357d6e5b706d15"; // Replace with your actual LLM ID
    await retell.llm.update(llmId, {
      general_prompt: newPrompt,
    });

    return NextResponse.json({ message: "Agent prompt updated successfully" });
  } catch (error) {
    console.error("Error updating agent prompt:", error);
    return NextResponse.json({ error: "Failed to update agent prompt" }, { status: 500 });
  }
}