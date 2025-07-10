import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { GoogleGenerativeAI, FunctionDeclarationSchemaType, types } from 'npm:@google/generative-ai';
import { Twilio, twiml } from 'npm:twilio';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// --- Types Definition ---
type OrderItem = {
  name: string;
  quantity: number;
  price: number;
};

// --- Clients Initialization ---
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const genAI = new GoogleGenerativeAI(Deno.env.get('GOOGLE_API_KEY')!);

console.log('Edge Function "handle-call" initialized.');

// --- Main Server Logic ---
serve(async (req) => {
  const url = new URL(req.url);

  // Route 1: Handle WebSocket connections for the audio stream
  if (req.headers.get('upgrade')?.toLowerCase() === 'websocket') {
    console.log('WebSocket upgrade request received.');
    return handleWebSocket(req);
  }

  // Route 2: Handle the initial incoming call from Twilio
  if (req.method === 'POST' && req.headers.get('upgrade')?.toLowerCase() !== 'websocket') {
    console.log('Initial POST request from Twilio received.');
    return handleIncomingCall(req);
  }

  // Default response for other requests
  return new Response('Not Found', { status: 404 });
});


// --- WebSocket Handler ---
// Manages the real-time, bidirectional audio stream.
async function handleWebSocket(req: Request) {
  const { socket, response } = Deno.upgradeWebSocket(req);

  socket.onopen = () => console.log('WebSocket connection established.');
  socket.onclose = () => console.log('WebSocket connection closed.');
  socket.onerror = (err) => console.error('WebSocket error:', err);

  let geminiSession: any; // To hold the Gemini Live session
  let callSid: string | null = null; // To store callSid from initial Twilio message
  let pizzeriaId: string | null = null; // To store pizzeriaId from initial Twilio message

  socket.onmessage = async (event) => {
    const data = JSON.parse(event.data);

    // The first message from the client should contain initial parameters (like pizzeriaId, callSid)
    // and signal the start of the conversation.
    if (data.event === 'start') {
      console.log('Client stream started. Initializing Gemini Live session.');
      const startParams = data.start;
      pizzeriaId = startParams.pizzeriaId;
      callSid = startParams.callSid;

      if (!pizzeriaId || !callSid) {
        console.error('Missing pizzeriaId or callSid in start event.');
        socket.close(1011, 'Missing initial parameters');
        return;
      }

      // Fetch the full, up-to-date menu from Supabase
      const { data: menuItems, error } = await supabase
        .from('menu_items')
        .select('name, description, price, size')
        .eq('pizzeria_id', pizzeriaId)
        .eq('is_available', true);

      if (error) {
        console.error('Failed to fetch menu:', error);
        socket.close(1011, 'Database error');
        return;
      }
      
      const menuString = menuItems.map(item => 
        `- ${item.name} ${item.size ? `(${item.size})` : ''}: ${item.price}€`
      ).join('\n');

      // Define the tool Gemini can use to save the order
      const saveOrderTool = {
        functionDeclarations: [
          {
            name: 'save_order',
            description: 'Saves the final customer order to the database.',
            parameters: {
              type: FunctionDeclarationSchemaType.OBJECT,
              properties: {
                items: {
                  type: FunctionDeclarationSchemaType.ARRAY,
                  description: 'List of items in the order.',
                  items: {
                    type: FunctionDeclarationSchemaType.OBJECT,
                    properties: {
                      name: { type: FunctionDeclarationSchemaType.STRING, description: 'Name of the item.' },
                      quantity: { type: FunctionDeclarationSchemaType.NUMBER, description: 'Quantity of the item.' },
                      price: { type: FunctionDeclarationSchemaType.NUMBER, description: 'Unit price of the item.' },
                    },
                    required: ['name', 'quantity', 'price'],
                  },
                },
                totalPrice: {
                  type: FunctionDeclarationSchemaType.NUMBER,
                  description: 'The total price of the order.',
                },
              },
              required: ['items', 'totalPrice'],
            },
          },
        ],
      };

      // Start the Gemini Live session with the dynamic prompt and the tool
      try {
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash', // Using a powerful model for tool use (cascade model)
          tools: saveOrderTool,
        });

        geminiSession = await model.startChat({
            history: [{
                role: "user",
                parts: [{
                    text: `
                    Vous êtes un assistant vocal amical et efficace pour une pizzeria.
                    Votre objectif est de prendre la commande du client par téléphone.
                    Voici le menu actuel de la pizzeria, avec les noms, tailles et prix :
                    ${menuString}

                    Directives :
                    1.  Saluez le client avec "Bonjour et bienvenue chez Pizza AI, que puis-je pour vous ?".
                    2.  Guidez le client à travers le menu, en répondant à ses questions sur les articles, les tailles et les prix.
                    3.  Prenez la commande en notant les noms des articles, les quantités et les tailles si applicable.
                    4.  Si un article ou une quantité n'est pas clair, demandez des précisions.
                    5.  Une fois que le client a terminé de commander, récapitulez l'intégralité de la commande et le prix total pour confirmation.
                    6.  ATTENTION : Une fois que le client a EXPLICITEMENT confirmé la commande finale, vous DEVEZ appeler la fonction "save_order" avec les détails exacts des articles et le prix total. Ne pas appeler la fonction avant la confirmation explicite.
                    7.  Si le client change d'avis avant la confirmation finale, mettez à jour la commande en conséquence.
                    8.  Soyez concis et clair dans vos réponses.
                    `
                }]
            }],
            // Configure Gemini to respond with audio
            response_modalities: [types.ResponseModality.AUDIO],
            // Configure input audio transcription if needed for debugging/logging
            input_audio_transcription: {},
        });

        // Start listening for Gemini's responses and stream them back to the client
        (async () => {
          try {
            for await (const response of geminiSession.receive()) {
              if (response.server_content) {
                // Handle text transcription from Gemini (for display on client)
                if (response.server_content.input_transcription && response.server_content.input_transcription.text) {
                  socket.send(JSON.stringify({ text: response.server_content.input_transcription.text }));
                }
                // Handle audio data from Gemini
                if (response.server_content.model_turn && response.server_content.model_turn.parts) {
                  for (const part of response.server_content.model_turn.parts) {
                    if (part.inline_data && part.inline_data.mime_type.startsWith('audio/')) {
                      // Send audio data (base64 encoded) back to the client
                      socket.send(JSON.stringify({ audio: part.inline_data.data }));
                    }
                  }
                }

                // Handle function calls from Gemini
                if (response.server_content.tool_call && response.server_content.tool_call.function_calls) {
                  for (const fc of response.server_content.tool_call.function_calls) {
                    if (fc.name === 'save_order') {
                      console.log('Gemini requested to save the order:', fc.args);
                      const { items, totalPrice } = fc.args;

                      try {
                        const { error: saveError } = await supabase.from('orders').insert({
                          pizzeria_id: pizzeriaId,
                          customer_phone_number: 'N/A', // Placeholder, ideally from Twilio CallSid
                          order_details: { items },
                          total_price: totalPrice,
                          status: 'confirmed',
                        });

                        if (saveError) {
                          console.error('Failed to save order to Supabase:', saveError);
                          // Send error response to Gemini
                          await geminiSession.send_tool_response([
                            types.FunctionResponse.fromObject({
                              id: fc.id,
                              name: fc.name,
                              response: { result: `Error saving order: ${saveError.message}` },
                            }),
                          ]);
                          socket.send(JSON.stringify({ text: 'Désolé, une erreur est survenue lors de l\'enregistrement de votre commande.' }));
                        } else {
                          console.log('Order saved successfully!');
                          // Send success response to Gemini
                          await geminiSession.send_tool_response([
                            types.FunctionResponse.fromObject({
                              id: fc.id,
                              name: fc.name,
                              response: { result: 'Order saved successfully.' },
                            }),
                          ]);
                          socket.send(JSON.stringify({ text: 'Votre commande a été enregistrée avec succès.' }));
                        }
                      } catch (dbError: any) { // Explicitly type dbError as any for now
                        console.error('Unexpected error during Supabase order save:', dbError);
                        await geminiSession.send_tool_response([
                          types.FunctionResponse.fromObject({
                            id: fc.id,
                            name: fc.name,
                            response: { result: `Unexpected error: ${dbError.message}` },
                          }),
                        ]);
                        socket.send(JSON.stringify({ text: 'Désolé, une erreur inattendue est survenue.' }));
                      }
                    }
                  }
                }
              }
            }
          } catch (geminiReceiveError) {
            console.error('Error receiving from Gemini Live session:', geminiReceiveError);
            socket.close(1011, 'Erreur de communication avec l\'assistant vocal.');
          }
        })();

      } catch (geminiInitError) {
        console.error('Error initializing Gemini session:', geminiInitError);
        socket.close(1011, 'Erreur lors de l\'initialisation de l\'assistant vocal.');
        return;
      }

    } else if (data.audio) {
      // B. Client sends audio data in "audio" messages.
      if (geminiSession) {
        try {
          // Forward the audio chunk from client to Gemini
          const audioChunk = data.audio; // This is a base64 string from client
          const audioBytes = Uint8Array.from(atob(audioChunk), c => c.charCodeAt(0));
          
          await geminiSession.send_realtime_input({
            audio: types.Blob.fromObject({
              data: audioBytes,
              mime_type: 'audio/pcm;rate=16000', // Assuming client sends 16kHz PCM
            }),
          });
        } catch (sendAudioError) {
          console.error('Error sending audio to Gemini:', sendAudioError);
          socket.close(1011, 'Erreur lors de l\'envoi de l\'audio à l\'assistant vocal.');
        }
      } else {
        console.warn('Received audio before Gemini session was initialized.');
      }
    } else if (data.event === 'stop') {
      // C. Client sends a "stop" message when the conversation ends.
      console.log('Client stream stopped.');
      // Clean up resources if necessary
      if (geminiSession) {
        // Close Gemini session if it has a close method
        // geminiSession.close(); // Not all SDKs have a close method for chat sessions
      }
      socket.close();
    }
  };
}


// --- Initial Call Handler ---
// Handles the very first HTTP POST from Twilio when a call connects.
async function handleIncomingCall(req: Request) {
  try {
    const form = await req.formData();
    const to = form.get('To') as string;
    const callSid = form.get('CallSid') as string;
    console.log(`Incoming call for number: ${to}. Call SID: ${callSid}`);

    // Find the pizzeria associated with the number called
    const { data: pizzeria, error } = await supabase
      .from('pizzerias')
      .select('id')
      .eq('telephone_pizzeria', to)
      .single();

    if (error || !pizzeria) {
      console.error('Could not find pizzeria for number:', to, error);
      const response = new twiml.VoiceResponse();
      response.say({ voice: 'alice', language: 'fr-FR' }, 'Désolé, le service que vous essayez de joindre n\'est pas disponible ou n\'est pas configuré. Au revoir.');
      response.hangup();
      return new Response(response.toString(), { headers: { 'Content-Type': 'text/xml' } });
    }

    // Respond with TwiML to connect the call to our WebSocket stream
    const response = new twiml.VoiceResponse();
    const connect = response.connect();
    const stream = connect.stream({
      url: `wss://${new URL(req.url).host}/handle-call`, // Connect to the same function URL
    });
    // Pass parameters to the WebSocket handler
    stream.parameter({ name: 'pizzeriaId', value: pizzeria.id });
    stream.parameter({ name: 'callSid', value: callSid });

    console.log('Responding with TwiML to connect to WebSocket.');
    return new Response(response.toString(), { headers: { 'Content-Type': 'text/xml' } });

  } catch (err: unknown) {
    console.error('Error in handleIncomingCall:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    const response = new twiml.VoiceResponse();
    response.say({ voice: 'alice', language: 'fr-FR' }, `Désolé, une erreur technique est survenue: ${errorMessage}. Veuillez réessayer plus tard. Au revoir.`);
    response.hangup();
    return new Response(response.toString(), { headers: { 'Content-Type': 'text/xml' } });
  }
}