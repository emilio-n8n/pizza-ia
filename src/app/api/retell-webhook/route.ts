
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

export const dynamic = 'force-dynamic';

// Initialize Google AI client for Gemini
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

// Custom type for message history
type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export async function POST(req: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const llmRequest: any = await req.json();

    // The 'begin' interaction type is sent when the call first starts.
    if (llmRequest.interaction_type === 'begin') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const llmResponse: any = {
        response_id: 0,
        content: "Bonjour, bienvenue chez PizzaAI. Comment puis-je vous aider ?",
        content_complete: true,
        no_interruption_allowed: false,
      };
      return new Response(JSON.stringify(llmResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // For all other interactions, use the LLM to generate a response
    const history: Message[] = llmRequest.transcript.map((turn: { role: string; content: string }) => ({
      role: turn.role === 'agent' ? 'assistant' : 'user',
      content: turn.content,
    }));

    const result = await streamText({
      // Use the Gemini 1.5 Flash model
      model: google('models/gemini-1.5-flash-latest'),
      system: llmRequest.agent_prompt, // Use the prompt from Retell's agent config
      messages: history,
    });

    // Stream the response back to Retell
    return result.toDataStreamResponse();

  } catch (error) {
    console.error('Error in Retell webhook:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
