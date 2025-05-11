import { streamText } from 'ai';
import { xai } from '@ai-sdk/xai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { messages } = await req.json();

  try {
    const result = await streamText({
      model: xai('grok'), // Use xai provider to create Grok model
      messages,
    });

    return result.toDataStreamResponse(); // Use toDataStreamResponse for Next.js
  } catch (error: unknown) { // Type error as unknown
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}