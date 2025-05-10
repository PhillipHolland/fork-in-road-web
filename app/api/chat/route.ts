import { createChatHandler } from '@vercel/ai-sdk/next';
import { xai } from '@ai-sdk/xai';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const chatHandler = createChatHandler({
      model: xai('grok-2-1212'),
    });

    return chatHandler({ messages });
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}