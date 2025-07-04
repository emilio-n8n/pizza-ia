"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Inscription réussie. Un e-mail de confirmation a été envoyé.
      // On redirige vers la page de connexion avec un message.
      router.push('/auth/login?message=signup_success');

    } catch (err) {
      const error = err as Error;
      setError("Erreur lors de l'inscription : " + error.message);
      console.error("Error during sign up:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Créer votre compte</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {message && <p className="text-green-500 text-center mb-4">{message}</p>}
        <form onSubmit={handleSignUp}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
              disabled={isLoading}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? 'Création en cours...' : 'Créer mon compte'}
          </button>
        </form>
      </div>
    </div>
  );
}
