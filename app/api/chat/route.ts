import { xai } from '@ai-sdk/xai';
import { streamText } from 'ai';

// Ensure the API key is set in environment variables
export const runtime = 'edge';

export async function POST(req) {
  try {
    const { messages } = await req.json();

    // Extract the latest user message as the prompt
    const prompt = messages[messages.length - 1].content;

    // Stream the response from xAI's Grok model
    const result = await streamText({
      model: xai('grok-2-1212'),
      prompt,
    });

    // Return the streamed response to the client
    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error in /api/chat:', error);
    return new Response(JSON.stringify({ error: 'Failed to process chat request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}