"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function PizzeriaDetailsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [nomPizzeria, setNomPizzeria] = useState('');
  const [adressePizzeria, setAdressePizzeria] = useState('');
  const [telephonePizzeria, setTelephonePizzeria] = useState('');
  const [horairesOuverture, setHorairesOuverture] = useState('');
  const [zonesLivraison, setZonesLivraison] = useState('');
  const [menuPizzeria, setMenuPizzeria] = useState('');
  const [listePizzas, setListePizzas] = useState('');
  const [taillesPizza, setTaillesPizza] = useState('');
  const [typesPate, setTypesPate] = useState('');
  const [garnituresDisponibles, setGarnituresDisponibles] = useState('');
  const [boissons, setBoissons] = useState('');
  const [desserts, setDesserts] = useState('');
  const [optionsPersonnalisation, setOptionsPersonnalisation] = useState('');
  const [paiementsAcceptes, setPaiementsAcceptes] = useState('');
  const [promos, setPromos] = useState('');
  const [instructionsAutorisees, setInstructionsAutorisees] = useState('');
  const [languesSupportees, setLanguesSupportees] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        router.push('/auth/login'); // Redirect if not logged in
      }
    };
    getUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    if (!userId) {
      setError('User not logged in.');
      setIsLoading(false);
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from('pizzerias')
        .insert([
          {
            user_id: userId,
            nom_pizzeria: nomPizzeria,
            adresse_pizzeria: adressePizzeria,
            telephone_pizzeria: telephonePizzeria,
            horaires_ouverture: horairesOuverture,
            zones_livraison: zonesLivraison,
            menu_pizzeria: menuPizzeria,
            liste_pizzas: listePizzas,
            tailles_pizza: taillesPizza,
            types_pate: typesPate,
            garnitures_disponibles: garnituresDisponibles,
            boissons: boissons,
            desserts: desserts,
            options_personnalisation: optionsPersonnalisation,
            paiements_acceptes: paiementsAcceptes,
            promos: promos,
            instructions_autorisees: instructionsAutorisees,
            langues_supportees: languesSupportees,
          },
        ]);

      if (insertError) throw insertError;

      // Call the API to update Retell agent prompt
      const response = await fetch('/api/update-agent-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          nom_pizzeria: nomPizzeria,
          adresse_pizzeria: adressePizzeria,
          telephone_pizzeria: telephonePizzeria,
          horaires_ouverture: horairesOuverture,
          zones_livraison: zonesLivraison,
          menu_pizzeria: menuPizzeria,
          liste_pizzas: listePizzas,
          tailles_pizza: taillesPizza,
          types_pate: typesPate,
          garnitures_disponibles: garnituresDisponibles,
          boissons: boissons,
          desserts: desserts,
          options_personnalisation: optionsPersonnalisation,
          paiements_acceptes: paiementsAcceptes,
          promos: promos,
          instructions_autorisees: instructionsAutorisees,
          langues_supportees: languesSupportees,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update agent prompt');
      }

      setMessage('Informations de la pizzeria sauvegardées avec succès et agent mis à jour !');
      // Optionally, redirect to a dashboard or home page
      router.push('/dashboard'); 

    } catch (err) {
      const error = err as Error;
      setError('Erreur lors de la sauvegarde des informations : ' + error.message);
      console.error('Error saving pizzeria details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Détails de votre Pizzeria</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {message && <p className="text-green-500 text-center mb-4">{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="nomPizzeria">Nom de la pizzeria</label>
              <input
                id="nomPizzeria"
                type="text"
                value={nomPizzeria}
                onChange={(e) => setNomPizzeria(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                required
                disabled={isLoading}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="adressePizzeria">Adresse complète</label>
              <input
                id="adressePizzeria"
                type="text"
                value={adressePizzeria}
                onChange={(e) => setAdressePizzeria(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                required
                disabled={isLoading}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="telephonePizzeria">Numéro de téléphone</label>
              <input
                id="telephonePizzeria"
                type="tel"
                value={telephonePizzeria}
                onChange={(e) => setTelephonePizzeria(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                required
                disabled={isLoading}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="horairesOuverture">Jours et horaires d'ouverture</label>
              <textarea
                id="horairesOuverture"
                value={horairesOuverture}
                onChange={(e) => setHorairesOuverture(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                required
                disabled={isLoading}
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="zonesLivraison">Zones de livraison desservies</label>
              <textarea
                id="zonesLivraison"
                value={zonesLivraison}
                onChange={(e) => setZonesLivraison(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                disabled={isLoading}
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="menuPizzeria">Menu détaillé (description générale)</label>
              <textarea
                id="menuPizzeria"
                value={menuPizzeria}
                onChange={(e) => setMenuPizzeria(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                disabled={isLoading}
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="listePizzas">Liste des pizzas disponibles (ex: Margherita, Pepperoni, Végétarienne)</label>
              <textarea
                id="listePizzas"
                value={listePizzas}
                onChange={(e) => setListePizzas(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                disabled={isLoading}
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="taillesPizza">Tailles proposées (ex: Petite, Moyenne, Grande)</label>
              <input
                id="taillesPizza"
                type="text"
                value={taillesPizza}
                onChange={(e) => setTaillesPizza(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                disabled={isLoading}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="typesPate">Types de pâte (ex: Fine, Épaisse, Sans gluten)</label>
              <input
                id="typesPate"
                type="text"
                value={typesPate}
                onChange={(e) => setTypesPate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                disabled={isLoading}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="garnituresDisponibles">Garnitures disponibles (ex: Olives, Champignons, Fromage)</label>
              <textarea
                id="garnituresDisponibles"
                value={garnituresDisponibles}
                onChange={(e) => setGarnituresDisponibles(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                disabled={isLoading}
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="boissons">Boissons (ex: Coca-Cola, Eau, Jus d'orange)</label>
              <textarea
                id="boissons"
                value={boissons}
                onChange={(e) => setBoissons(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                disabled={isLoading}
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="desserts">Desserts (ex: Tiramisu, Mousse au chocolat)</label>
              <textarea
                id="desserts"
                value={desserts}
                onChange={(e) => setDesserts(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                disabled={isLoading}
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="optionsPersonnalisation">Options de personnalisation autorisées (ex: supplément fromage, pâte sans gluten)</label>
              <textarea
                id="optionsPersonnalisation"
                value={optionsPersonnalisation}
                onChange={(e) => setOptionsPersonnalisation(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                disabled={isLoading}
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="paiementsAcceptes">Méthodes de paiement acceptées (ex: Carte bancaire, Espèces, Titres restaurant)</label>
              <input
                id="paiementsAcceptes"
                type="text"
                value={paiementsAcceptes}
                onChange={(e) => setPaiementsAcceptes(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                disabled={isLoading}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="promos">Offres/promo en cours</label>
              <textarea
                id="promos"
                value={promos}
                onChange={(e) => setPromos(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                disabled={isLoading}
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="instructionsAutorisees">Instructions spéciales autorisées (ex: sans oignon, bien cuit)</label>
              <textarea
                id="instructionsAutorisees"
                value={instructionsAutorisees}
                onChange={(e) => setInstructionsAutorisees(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                disabled={isLoading}
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="languesSupportees">Langues supportées (ex: Français, Anglais)</label>
              <input
                id="languesSupportees"
                type="text"
                value={languesSupportees}
                onChange={(e) => setLanguesSupportees(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                disabled={isLoading}
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 mt-6"
            disabled={isLoading}
          >
            {isLoading ? 'Sauvegarde en cours...' : 'Sauvegarder les informations de la pizzeria'}
          </button>
        </form>
      </div>
    </div>
  );
}