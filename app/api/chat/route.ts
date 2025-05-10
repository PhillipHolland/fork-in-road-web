import { xai } from "@ai-sdk/xai";
import { streamText } from "ai";

// POST /api/chat
export async function POST(req) {
  const { messages } = await req.json();

  // Extract the latest user message as the prompt
  const prompt = messages[messages.length - 1].content;

  // Stream the response from xAI's Grok model
  const result = await streamText({
    model: xai("grok-2-1212"),
    prompt,
  });

  // Return the streamed response to the client
  return result.toDataStreamResponse();
}