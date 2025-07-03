"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function UploadMenuPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Veuillez sélectionner un fichier.');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      const filePath = `${user.id}/${Date.now()}_${file.name}`;

      // 1. Upload de l'image dans Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('menu_images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Appel de la Edge Function pour traiter l'image
      const { data, error: functionError } = await supabase.functions.invoke('process-menu', {
        body: { filePath },
      });

      if (functionError) throw functionError;

      setMessage('Menu uploadé et en cours de traitement ! Vous pouvez voir le résultat dans votre dashboard.');
      console.log('Function response:', data);

    } catch (err: any) {
      setMessage(`Erreur : ${err.message}`);
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6">Uploadez votre menu</h2>
        <p className="text-gray-600 mb-6">Prenez une photo claire de votre menu. Notre IA s'occupe du reste.</p>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
        />
        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="mt-6 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
        >
          {uploading ? 'Traitement en cours...' : 'Analyser le menu'}
        </button>
        {message && <p className="mt-4 text-sm">{message}</p>}
      </div>
    </div>
  );
}
