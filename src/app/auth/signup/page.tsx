use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pizzeriaName, setPizzeriaName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!user) throw new Error("User not created");

      const { error: pizzeriaError } = await supabase
        .from('pizzerias')
        .insert({
          owner_id: user.id,
          name: pizzeriaName,
          address: address,
          contact_phone: phone,
        });

      if (pizzeriaError) throw pizzeriaError;

      alert('Inscription réussie ! Vous allez être redirigé vers le dashboard.');
      router.push('/dashboard');

    } catch (err) {
      const error = err as Error;
      setError(error.message);
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
        <form onSubmit={handleSignUp}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="pizzeriaName">Nom de la Pizzeria</label>
            <input
              id="pizzeriaName"
              type="text"
              value={pizzeriaName}
              onChange={(e) => setPizzeriaName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
              disabled={isLoading}
            />
          </div>
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
          <div className="mb-4">
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
           <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="address">Adresse</label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              disabled={isLoading}
            />
          </div>
           <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="phone">Téléphone</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? 'Création en cours...' : 'S\'inscrire'}
          </button>
        </form>
      </div>
    </div>
  );
}
