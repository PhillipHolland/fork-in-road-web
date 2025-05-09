import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string") {
      console.log("Invalid query received:", query);
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }

    console.log("Sending request to Grok API with query:", query);

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROK_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant.",
          },
          {
            role: "user",
            content: query,
          },
        ],
        model: "grok-3-latest",
        stream: false,
        temperature: 0,
      }),
    });

    console.log("Grok API response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.log("Grok API error response:", errorData);
      return NextResponse.json(
        { error: errorData.error || "Failed to fetch response from Grok API" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Grok API successful response:", data);

    const result = data.choices[0]?.message?.content || "No response received.";
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error in /api/grok:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}