import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { GoogleGenerativeAI, FunctionDeclarationSchemaType } from 'npm:@google/generative-ai';
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

  socket.onmessage = async (event) => {
    const data = JSON.parse(event.data);

    switch (data.event) {
      // A. Twilio sends a "start" message when the stream begins.
      // We receive parameters here like callSid and the prompt.
      case 'start':
        console.log('Twilio stream started. Initializing Gemini Live session.');
        const startParams = data.start;
        const pizzeriaId = startParams.pizzeriaId;
        const callSid = startParams.callSid;

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
            model: 'gemini-1.5-flash', // Using a powerful model for tool use
            tools: saveOrderTool,
          });

          geminiSession = model.startChat({
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
              }]
          });
        } catch (geminiInitError) {
          console.error('Error initializing Gemini session:', geminiInitError);
          socket.close(1011, 'Erreur lors de l\'initialisation de l\'assistant vocal.');
          return;
        }

        // Start listening for Gemini's responses
        listenForGeminiResponse(geminiSession, socket, callSid, pizzeriaId, twilioClient);
        break;

      // B. Twilio sends audio data in "media" messages.
      case 'media':
        if (geminiSession) {
          // Forward the audio chunk from Twilio to Gemini
          const audioChunk = data.media.payload; // This is a base64 string
          // Note: Gemini Live expects raw bytes, but here we send text for simplicity with startChat.
          // For a true voice implementation, we'd use a native audio model and send buffer.
          // This is a conceptual adaptation. We'll simulate the voice interaction via text chat.
          // A real implementation would require `gemini-1.5-pro-native-audio` and different handling.
          
          // This part is a placeholder for true audio processing.
          // In a real scenario, we would not be able to decode Twilio's mulaw format in Deno easily.
          // We will proceed with a text-based simulation driven by the logic.
        }
        break;

      // C. Twilio sends a "stop" message when the call ends.
      case 'stop':
        console.log('Twilio stream stopped.');
        // Clean up resources if necessary
        break;
    }
  };
}

// --- Gemini Response Handler ---
// Listens for responses from Gemini and acts on them.
async function listenForGeminiResponse(session: any, socket: WebSocket, callSid: string, pizzeriaId: string, twilioClient: Twilio) {
    console.log("Listening for Gemini's response...");
    try {
        const result = await session.sendMessage("start"); // Trigger the initial response
        const response = result.response;

        // 1. Check for a function call to save the order
        const functionCalls = response.functionCalls();
        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0];
            if (call.name === 'save_order') {
                console.log('Gemini requested to save the order:', call.args);
                const { items, totalPrice } = call.args;

                try {
                    // Save to Supabase
                    const { error } = await supabase.from('orders').insert({
                        pizzeria_id: pizzeriaId,
                        customer_phone_number: 'N/A', // We can get this from the start event if needed
                        order_details: { items },
                        total_price: totalPrice,
                        status: 'confirmed',
                    });

                    if (error) {
                        console.error('Failed to save order to Supabase:', error);
                        const twimlResponse = new twiml.VoiceResponse();
                        twimlResponse.say({ voice: 'alice', language: 'fr-FR' }, 'Désolé, une erreur technique nous empêche d'enregistrer votre commande. Veuillez réessayer plus tard. Au revoir.');
                        twimlResponse.hangup();
                        await twilioClient.calls(callSid).update({ twiml: twimlResponse.toString() });
                    } else {
                        console.log('Order saved successfully!');
                        const twimlResponse = new twiml.VoiceResponse();
                        twimlResponse.say({ voice: 'alice', language: 'fr-FR' }, 'Merci, votre commande a été enregistrée. Elle sera prête bientôt. Au revoir !');
                        twimlResponse.hangup();
                        await twilioClient.calls(callSid).update({ twiml: twimlResponse.toString() });
                    }
                } catch (dbError) {
                    console.error('Unexpected error during Supabase order save:', dbError);
                    const twimlResponse = new twiml.VoiceResponse();
                    twimlResponse.say({ voice: 'alice', language: 'fr-FR' }, 'Désolé, une erreur inattendue est survenue lors de l'enregistrement de votre commande. Veuillez réessayer plus tard. Au revoir.');
                    twimlResponse.hangup();
                    await twilioClient.calls(callSid).update({ twiml: twimlResponse.toString() });
                }
            }
        } else {
            // 2. If it's a text response, send it as speech to Twilio
            const text = response.text();
            console.log('Gemini says:', text);

            const twimlResponse = new twiml.VoiceResponse();
            twimlResponse.say({ voice: 'alice', language: 'fr-FR' }, text);
            try {
                await twilioClient.calls(callSid).update({ twiml: twimlResponse.toString() });
            } catch (twilioUpdateError) {
                console.error('Failed to update Twilio call with Gemini response:', twilioUpdateError);
                // At this point, we can't speak to the user, so just log.
            }
        }
    } catch (geminiError) {
        console.error('Error interacting with Gemini API:', geminiError);
        const twimlResponse = new twiml.VoiceResponse();
        twimlResponse.say({ voice: 'alice', language: 'fr-FR' }, 'Désolé, une erreur technique avec notre assistant vocal nous empêche de prendre votre commande. Veuillez réessayer plus tard. Au revoir.');
        twimlResponse.hangup();
        try {
            await twilioClient.calls(callSid).update({ twiml: twimlResponse.toString() });
        } catch (twilioError) {
            console.error('Failed to send error message to Twilio:', twilioError);
        }
    }
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
