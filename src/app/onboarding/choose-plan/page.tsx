"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

export default function ChoosePlanPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login'); // Redirect if not logged in
      }
    };
    checkUser();
  }, [router, supabase]);

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      setError("Veuillez sélectionner un plan d'abonnement.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId: selectedPlan }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec de la création de la session de paiement.');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url; // Redirect to Stripe Checkout
      } else {
        throw new Error('URL de session de paiement non reçue.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur inconnue est survenue.';
      setError(`Erreur d&apos;abonnement : ${errorMessage}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Choisissez votre plan</h2>
        <p className="text-gray-600 mb-8">Sélectionnez le plan qui convient le mieux à votre pizzeria.</p>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="flex flex-col gap-4 mb-8">
          <div
            className={`border-2 p-6 rounded-lg cursor-pointer transition-all duration-200 ${
              selectedPlan === 'plan_monthly' ? 'border-red-600 shadow-lg' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedPlan('plan_monthly')}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Plan Mensuel</h3>
            <p className="text-gray-700 text-2xl font-bold mb-2">29€ / mois</p>
            <ul className="text-gray-600 text-sm list-disc list-inside">
              <li>Accès complet à l'IA de commande</li>
              <li>Numéro de téléphone dédié</li>
              <li>Support standard</li>
            </ul>
          </div>

          <div
            className={`border-2 p-6 rounded-lg cursor-pointer transition-all duration-200 ${
              selectedPlan === 'plan_annual' ? 'border-red-600 shadow-lg' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedPlan('plan_annual')}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Plan Annuel</h3>
            <p className="text-gray-700 text-2xl font-bold mb-2">299€ / an <span className="text-sm text-green-600">(Économisez 49€ !)</span></p>
            <ul className="text-gray-600 text-sm list-disc list-inside">
              <li>Toutes les fonctionnalités du plan mensuel</li>
              <li>Support prioritaire</li>
              <li>Accès anticipé aux nouvelles fonctionnalités</li>
            </ul>
          </div>
        </div>

        <button
          onClick={handleSubscribe}
          disabled={!selectedPlan || isLoading}
          className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Redirection vers le paiement...' : 'Procéder au paiement'}
        </button>
        <Link href="/dashboard" className="block mt-4 text-gray-500 hover:text-gray-700 text-sm">
          Passer pour l'instant (accès limité)
        </Link>
      </div>
    </div>
  );
}
