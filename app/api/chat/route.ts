import { streamText, xAI } from 'ai'; // Import xAI provider from ai package
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { messages } = await req.json();

  try {
    const stream = await streamText({
      model: xAI('grok'), // Use xAI provider to create Grok model
      messages,
    });

    return new NextResponse(stream.toReadableStream(), {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}