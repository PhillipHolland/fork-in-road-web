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
  } catch (error: Error) { // Type error as Error
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}