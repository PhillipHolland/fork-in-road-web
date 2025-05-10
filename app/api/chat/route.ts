import { createXai } from '@ai-sdk/xai'; // Fixed casing: createXai instead of createXAI
import { streamText } from 'ai';

// Initialize the xAI client with the Grok API
const xai = createXai({
  apiKey: process.env.XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1',
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const response = await streamText({
    model: xai('grok-2-1212'),
    messages,
  });

  return response.toAIStreamResponse();
}