import Retell from 'retell-sdk';

const retellApiKey = process.env.RETELL_API_KEY;

if (!retellApiKey) {
  throw new Error('Retell API key is not defined in environment variables.');
}

export const retell = new Retell({
  apiKey: retellApiKey,
});
