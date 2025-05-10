import { streamText } from '@ai-sdk/core';
import { xai } from '@ai-sdk/xai';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // Stream the response from the xAI model
    const stream = await streamText({
      model: xai('grok'),
      messages,
    });

    // Return the streamed response
    return new Response(stream.toReadableStream(), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}