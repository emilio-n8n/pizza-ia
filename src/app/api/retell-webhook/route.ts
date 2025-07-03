import { RetellClient } from 'retell-sdk';
import { type Response } from 'express';
import {
  AudioEncoding,
  LlmRequest,
  LlmResponse,
} from 'retell-sdk/models/components';

export const dynamic = 'force-dynamic';

const retellClient = new RetellClient({
  apiKey: process.env.RETELL_API_KEY,
});

export async function POST(req: Request) {
  try {
    const llmRequest: LlmRequest = await req.json();

    // The 'begin' interaction type is sent when the call first starts.
    if (llmRequest.interaction_type === 'begin') {
      const llmResponse: LlmResponse = {
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

    // For now, for any other interaction, just say goodbye.
    // We will implement the full order logic later.
    const llmResponse: LlmResponse = {
      response_id: llmRequest.response_id,
      content: "Merci, au revoir !",
      content_complete: true,
      no_interruption_allowed: false,
      end_call: true,
    };
    return new Response(JSON.stringify(llmResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in Retell webhook:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
