import { streamText } from 'ai'; // Use the main 'ai' package
import { NextResponse } from 'next/server';

// Assuming Grok is the model, configure it here
export async function POST(req: Request) {
  const { messages } = await req.json();

  try {
    const stream = await streamText({
      model: 'grok', // Adjust based on your actual model provider and name
      messages,
    });

    return new NextResponse(stream.toReadableStream(), {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}