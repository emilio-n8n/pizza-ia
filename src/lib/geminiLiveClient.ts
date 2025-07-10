import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('Gemini API key is not defined in environment variables.');
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function createGeminiLiveSession() {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-preview-native-audio-dialog',
  });

  const session = model.startChat();
  return session;
}
