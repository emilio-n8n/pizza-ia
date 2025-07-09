"use client";

import { useState, useEffect, FormEvent } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PlusCircle, Trash2, UploadCloud, Save, Bot } from 'lucide-react';

// Type definition for a menu item, matching our database schema
type MenuItem = {
  id: string;
  pizzeria_id: string;
  category: string;
  name: string;
  description: string | null;
  price: number | null;
  size: string | null;
  is_available: boolean;
};

export default function ManageMenuPage() {
  const supabase = createClientComponentClient();
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [pizzeriaId, setPizzeriaId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdatingAgent, setIsUpdatingAgent] = useState(false);

  // Fetch pizzeria and menu data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Vous n'êtes pas connecté.");
        setIsLoading(false);
        return;
      }

      const { data: pizzeria, error: pizzeriaError } = await supabase
        .from('pizzerias')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (pizzeriaError || !pizzeria) {
        setError("Profil de pizzeria non trouvé. Veuillez d'abord en créer un.");
        setIsLoading(false);
        return;
      }
      setPizzeriaId(pizzeria.id);

      const { data: items, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('pizzeria_id', pizzeria.id)
        .order('category, name');

      if (menuError) {
        setError(menuError.message);
      } else {
        setMenuItems(items || []);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [supabase]);

  // --- Handlers for manual menu editing ---

  const handleItemChange = (index: number, field: keyof MenuItem, value: any) => {
    const updatedItems = [...menuItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setMenuItems(updatedItems);
  };

  const addNewItem = () => {
    if (!pizzeriaId) return;
    const newItem: MenuItem = {
      id: `new-${Date.now()}`, // Temporary ID
      pizzeria_id: pizzeriaId,
      category: 'Pizzas',
      name: '',
      description: '',
      price: 0,
      size: null,
      is_available: true,
    };
    setMenuItems([...menuItems, newItem]);
  };

  const removeItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    if (!pizzeriaId) {
        setError("ID de la pizzeria non trouvé.");
        setIsLoading(false);
        return;
    }

    // Separate new items from existing ones
    const itemsToUpdate = menuItems.filter(item => !item.id.startsWith('new-'));
    const itemsToInsert = menuItems
        .filter(item => item.id.startsWith('new-'))
        .map(({ id, ...rest }) => rest); // Remove temporary ID

    // First, delete items that are no longer in the list
    const currentIds = menuItems.map(item => item.id);
    const { data: existingItems } = await supabase.from('menu_items').select('id').eq('pizzeria_id', pizzeriaId);
    if (existingItems) {
        const idsToDelete = existingItems.filter(item => !currentIds.includes(item.id)).map(item => item.id);
        if (idsToDelete.length > 0) {
            await supabase.from('menu_items').delete().in('id', idsToDelete);
        }
    }

    // Then, upsert all current items
    const { error: upsertError } = await supabase.from('menu_items').upsert(itemsToUpdate.concat(itemsToInsert));

    if (upsertError) {
        setError(`Erreur lors de la sauvegarde : ${upsertError.message}`);
    } else {
        setMessage("Menu sauvegardé avec succès !");
        // Refetch data to get new IDs
        const { data: items } = await supabase.from('menu_items').select('*').eq('pizzeria_id', pizzeriaId).order('category, name');
        setMenuItems(items || []);
    }
    setIsLoading(false);
  };


  // --- Handlers for AI-powered upload ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setMessage(null);
    }
  };

  const handleAnalyzeMenu = async () => {
    if (!file) {
      setError('Veuillez sélectionner un fichier.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setMessage(null);

    const formData = new FormData();
    formData.append('menuImage', file);

    try {
      const response = await fetch('/api/analyze-menu', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Une erreur est survenue lors de l\'analyse.');
      }

      setMessage('Menu analysé avec succès ! La liste a été mise à jour.');
      // The API now clears and inserts, so we just need to refetch
      const { data: items } = await supabase.from('menu_items').select('*').eq('pizzeria_id', pizzeriaId!).order('category, name');
      setMenuItems(items || []);

    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setIsUploading(false);
      setFile(null);
    }
  };

  // --- Handler for updating the AI agent ---

  const handleUpdateAgent = async () => {
    setIsUpdatingAgent(true);
    setError(null);
    setMessage(null);
    try {
        const response = await fetch('/api/update-agent-prompt', {
            method: 'POST',
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || "Erreur lors de la mise à jour de l'agent.");
        }
        setMessage("L'agent conversationnel a été mis à jour avec le nouveau menu !");
    } catch (err) {
        const error = err as Error;
        setError(error.message);
    } finally {
        setIsUpdatingAgent(false);
    }
  };


  if (isLoading && menuItems.length === 0) {
    return <div className="flex justify-center items-center min-h-screen">Chargement du menu...</div>;
  }

  if (error && !pizzeriaId) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Gestion du Menu</h1>
        <p className="text-gray-600 mb-8">Modifiez votre menu manuellement ou téléversez une nouvelle image pour que notre IA l'analyse.</p>

        {/* --- Section 1: AI Upload --- */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
            <h2 className="text-2xl font-bold text-red-600 mb-3 flex items-center"><UploadCloud className="mr-3" /> Analyser un nouveau menu</h2>
            <div className="flex items-center gap-4">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                />
                <button
                    onClick={handleAnalyzeMenu}
                    disabled={isUploading || !file}
                    className="bg-red-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors flex-shrink-0"
                >
                    {isUploading ? 'Analyse...' : 'Lancer l\'analyse'}
                </button>
            </div>
        </div>

        {/* --- Section 2: Manual Menu Editor --- */}
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-700 mb-6">Éditeur de menu</h2>
            
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {message && <p className="text-green-500 mb-4">{message}</p>}

            <div className="space-y-4">
                {menuItems.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-3 items-center p-3 bg-gray-50 rounded-lg">
                        <input type="text" placeholder="Catégorie" value={item.category} onChange={e => handleItemChange(index, 'category', e.target.value)} className="col-span-2 p-2 border rounded" />
                        <input type="text" placeholder="Nom" value={item.name} onChange={e => handleItemChange(index, 'name', e.target.value)} className="col-span-3 p-2 border rounded" />
                        <input type="text" placeholder="Description" value={item.description || ''} onChange={e => handleItemChange(index, 'description', e.target.value)} className="col-span-4 p-2 border rounded" />
                        <input type="number" placeholder="Prix" value={item.price || ''} onChange={e => handleItemChange(index, 'price', parseFloat(e.target.value))} className="col-span-1 p-2 border rounded" />
                        <input type="text" placeholder="Taille" value={item.size || ''} onChange={e => handleItemChange(index, 'size', e.target.value)} className="col-span-1 p-2 border rounded" />
                        <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700"><Trash2 /></button>
                    </div>
                ))}
            </div>

            <button onClick={addNewItem} className="mt-6 text-red-600 font-semibold flex items-center"><PlusCircle className="mr-2" /> Ajouter un plat</button>
        </div>

        {/* --- Section 3: Save and Update Agent --- */}
        <div className="mt-8 flex justify-end gap-4">
            <button 
                onClick={handleSaveChanges} 
                disabled={isLoading}
                className="bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors flex items-center"
            >
                <Save className="mr-2" /> {isLoading ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
            </button>
            <button 
                onClick={handleUpdateAgent}
                disabled={isUpdatingAgent || menuItems.length === 0}
                className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center"
            >
                <Bot className="mr-2" /> {isUpdatingAgent ? 'Mise à jour...' : 'Mettre à jour l\'agent'}
            </button>
        </div>
      </div>
    </div>
  );
}