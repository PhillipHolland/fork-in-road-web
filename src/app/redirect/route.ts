import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const grokUrl = `https://grok.com/?q=${encodeURIComponent(query)}`;
  return NextResponse.redirect(grokUrl, 302);
}