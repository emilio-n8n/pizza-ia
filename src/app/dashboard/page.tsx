"use client";

import { useState, useEffect } from 'react';
import { createGeminiLiveSession } from '@/lib/geminiLiveClient';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  order_details: { items: OrderItem[] }; // Adjust this type based on your JSONB structure
  total_price: number;
  status: string;
  created_at: string;
}

export default function DashboardPage() {
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [twilioPhoneNumber, setTwilioPhoneNumber] = useState<string | null>(null);
  const [pizzeriaLoading, setPizzeriaLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]); // State to store orders
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setPizzeriaLoading(true);
      setOrdersLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch pizzeria data
        const { data: pizzeria, error: fetchPizzeriaError } = await supabase
          .from('pizzerias')
          .select('id, twilio_phone_number')
          .eq('user_id', user.id)
          .single();

        if (fetchPizzeriaError && fetchPizzeriaError.code !== 'PGRST116') {
          console.error('Error fetching pizzeria data:', fetchPizzeriaError);
          setError('Erreur lors du chargement des informations de la pizzeria.');
        } else if (pizzeria) {
          setTwilioPhoneNumber(pizzeria.twilio_phone_number);

          // Fetch orders for the pizzeria
          const { data: fetchedOrders, error: fetchOrdersError } = await supabase
            .from('orders')
            .select('*')
            .eq('pizzeria_id', pizzeria.id)
            .order('created_at', { ascending: false }); // Order by most recent

          if (fetchOrdersError) {
            console.error('Error fetching orders:', fetchOrdersError);
            setError('Erreur lors du chargement des commandes.');
          } else {
            setOrders(fetchedOrders || []);
            // Calculate statistics
            const calculatedTotalOrders = fetchedOrders ? fetchedOrders.length : 0;
            const calculatedTotalRevenue = fetchedOrders ? fetchedOrders.reduce((sum, order) => sum + order.total_price, 0) : 0;
            setTotalOrders(calculatedTotalOrders);
            setTotalRevenue(calculatedTotalRevenue);
          }
        }
      }
      setPizzeriaLoading(false);
      setOrdersLoading(false);
    };

    fetchDashboardData();
  }, []);

  const handleStartConversation = async () => {
    setError(null);
    setIsListening(true);

    try {
      const socket = await createGeminiLiveSession();

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.audio) {
          // Play audio received from the server
          const audioBlob = new Blob([Buffer.from(data.audio, 'base64')], { type: 'audio/ogg' });
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audio.play();
        }
        if (data.text) {
          // Update transcription with text received from the server
          setTranscription((prev) => prev + data.text);
        }
      };

      socket.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsListening(false);
        setError('Conversation terminée.');
      };

      socket.onerror = (event) => {
        console.error('WebSocket error:', event);
        setIsListening(false);
        setError('Erreur de connexion. Veuillez réessayer.');
      };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(16384, 1, 1);

      source.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = inputData[i] * 32767;
        }
        // Send raw PCM data to the server via WebSocket
        socket.send(JSON.stringify({ audio: Buffer.from(pcmData.buffer).toString('base64') }));
      };

    } catch (err) {
      console.error('Failed to start conversation:', err);
      setError('Impossible de démarrer la conversation. Vérifiez les autorisations du microphone.');
      setIsListening(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Tableau de bord</h1>
        <p className="text-gray-600 mb-10">Bienvenue sur votre espace de gestion. Commencez par configurer votre pizzeria, puis ajoutez votre menu.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card for Pizzeria Profile */}
          <Link href="/dashboard/pizzeria-profile" className="block p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Étape 1: Profil de la Pizzeria</h2>
            <p className="text-gray-700">
              Ajoutez ou modifiez les informations de votre établissement, comme le nom, l&apos;adresse et le numéro de téléphone.
            </p>
          </Link>

          {/* Card for Uploading Menu */}
          <Link href="/dashboard/upload-menu" className="block p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Étape 2: Analyser votre Menu</h2>
            <p className="text-gray-700">
              Téléversez une image de votre menu et laissez notre IA l&apos;analyser pour l&apos;intégrer à votre agent conversationnel.
            </p>
          </Link>

          {/* Card for Twilio Phone Number */}
          <div className="p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Votre Numéro de Téléphone IA</h2>
            {pizzeriaLoading ? (
              <p className="text-gray-600">Chargement du numéro...</p>
            ) : twilioPhoneNumber ? (
              <p className="text-gray-700 text-xl font-semibold">{twilioPhoneNumber}</p>
            ) : (
              <p className="text-gray-700">Aucun numéro attribué. Veuillez vous abonner.</p>
            )}
          </div>

          {/* Card for Starting Conversation */}
          <div className="p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Étape 3: Démarrer la conversation</h2>
            <p className="text-gray-700 mb-4">
              Cliquez sur le bouton ci-dessous pour commencer à parler avec votre assistant vocal Gemini Live.
            </p>
            <button
              onClick={handleStartConversation}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
              disabled={isListening}
            >
              {isListening ? 'Écoute en cours...' : 'Démarrer la conversation'}
            </button>
            {error && <p className="text-red-500 mt-2">Erreur: {error}</p>}
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Transcription:</h3>
              <p className="text-gray-600">{transcription}</p>
            </div>
          </div>

          {/* Card for Recent Orders */}
          <div className="p-6 bg-white rounded-xl shadow-md col-span-full">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Commandes Récentes</h2>
            {ordersLoading ? (
              <p className="text-gray-600">Chargement des commandes...</p>
            ) : orders.length === 0 ? (
              <p className="text-gray-700">Aucune commande passée via votre assistant vocal pour le moment.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border-b pb-4 last:pb-0 last:border-b-0">
                    <p className="text-lg font-semibold">Commande #{order.id.substring(0, 8)}</p>
                    <p className="text-gray-700">Client: {order.customer_name || 'N/A'} ({order.customer_phone || 'N/A'})</p>
                    <p className="text-gray-700">Adresse: {order.delivery_address || 'N/A'}</p>
                    <p className="text-gray-700">Statut: <span className="font-medium text-blue-600">{order.status}</span></p>
                    <p className="text-gray-700">Total: <span className="font-bold">{order.total_price}€</span></p>
                    <p className="text-gray-700">Date: {new Date(order.created_at).toLocaleString()}</p>
                    <div className="mt-2 text-sm text-gray-600">
                      <p className="font-semibold">Détails des articles:</p>
                      {order.order_details?.items && order.order_details.items.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {order.order_details.items.map((item: OrderItem, idx: number) => (
                            <li key={idx}>{item.quantity} x {item.name} ({item.price}€/unité)</li>
                          ))}
                        </ul>
                      ) : (
                        <p>Aucun détail d'article disponible.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card for Statistics */}
          <div className="p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Statistiques d'Utilisation</h2>
            {ordersLoading ? (
              <p className="text-gray-600">Chargement des statistiques...</p>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-700">Total des commandes: <span className="font-semibold">{totalOrders}</span></p>
                <p className="text-gray-700">Revenu total: <span className="font-semibold">{totalRevenue.toFixed(2)}€</span></p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}