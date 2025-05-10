import { streamText } from 'ai';
import { xai } from '@ai-sdk/xai'; // Corrected import: xai (lowercase) instead of xAI
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { messages } = await req.json();

  try {
    const stream = await streamText({
      model: xai('grok'), // Use xai provider to create Grok model
      messages,
    });

    return new NextResponse(stream.toReadableStream(), {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}