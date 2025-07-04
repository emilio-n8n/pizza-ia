"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

// Define the type for the pizzeria profile
type PizzeriaProfile = {
  id: string;
  owner_id: string;
  name: string;
  address: string | null;
  contact_phone: string | null;
  created_at: string;
};

export default function PizzeriaProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [pizzeria, setPizzeria] = useState<PizzeriaProfile | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data, error } = await supabase
          .from('pizzerias')
          .select('*')
          .eq('owner_id', user.id)
          .single<PizzeriaProfile>();
        
        if (data) {
          setPizzeria(data);
          setName(data.name);
          setAddress(data.address || '');
          setPhone(data.contact_phone || '');
        } else if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
          setError(error.message);
        }
      }
      setIsLoading(false);
    };
    fetchUserData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setError(null);
    setMessage(null);

    const profileData = {
      owner_id: user.id,
      name,
      address,
      contact_phone: phone,
    };

    try {
      let error;
      if (pizzeria) {
        // Update existing pizzeria
        const { error: updateError } = await supabase
          .from('pizzerias')
          .update(profileData)
          .eq('id', pizzeria.id);
        error = updateError;
      } else {
        // Insert new pizzeria
        const { error: insertError } = await supabase
          .from('pizzerias')
          .insert(profileData);
        error = insertError;
      }

      if (error) throw error;

      setMessage('Profil de la pizzeria sauvegardé avec succès !');
      // Optional: redirect or refresh data
      router.refresh();

    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">Chargement du profil...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-2 text-gray-800">Profil de la Pizzeria</h2>
        <p className="text-gray-500 mb-6">Gérez les informations de votre établissement.</p>
        
        {error && <p className="text-red-500 text-center mb-4 p-3 bg-red-50 rounded-lg">{error}</p>}
        {message && <p className="text-green-600 text-center mb-4 p-3 bg-green-50 rounded-lg">{message}</p>}

        <form onSubmit={handleSave}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="pizzeriaName">
                Nom de la Pizzeria
              </label>
              <input
                id="pizzeriaName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                required
                disabled={isSaving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address">
                Adresse
              </label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                rows={3}
                disabled={isSaving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
                Téléphone de contact
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                disabled={isSaving}
              />
            </div>
          </div>
          <div className="mt-6">
            <button 
              type="submit" 
              className="w-full bg-red-600 text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 transition duration-200 disabled:bg-gray-400"
              disabled={isSaving}
            >
              {isSaving ? 'Sauvegarde en cours...' : 'Sauvegarder le profil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}