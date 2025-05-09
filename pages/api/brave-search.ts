import type { NextApiRequest, NextApiResponse } from "next";

// Define the shape of a single Brave Search result
interface BraveSearchResult {
  title: string;
  url: string;
  description: string;
  [key: string]: unknown;
}

// Define the shape of the Brave Search API response
interface BraveSearchResponse {
  web?: {
    results: BraveSearchResult[];
    total: number; // Total number of results (for pagination)
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query, count = "5", offset = "0" } = req.query;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  const countNum = parseInt(count as string, 10);
  const offsetNum = parseInt(offset as string, 10);

  if (isNaN(countNum) || isNaN(offsetNum)) {
    return res.status(400).json({ error: "Count and offset must be valid numbers" });
  }

  try {
    const braveResponse = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${countNum}&offset=${offsetNum}`,
      {
        headers: {
          Accept: "application/json",
          "X-Subscription-Token": process.env.BRAVE_API_KEY || "",
        },
      }
    );

    if (!braveResponse.ok) {
      throw new Error("Failed to fetch Brave Search results");
    }

    const braveData: BraveSearchResponse = await braveResponse.json();
    const webResults = braveData.web?.results || [];
    const formattedResults = webResults.map((result) => ({
      title: result.title,
      url: result.url,
      description: result.description,
    }));

    res.status(200).json({
      results: formattedResults,
      total: braveData.web?.total || 0, // Return total results for pagination
    });
  } catch (error) {
    console.error("Error fetching Brave Search results:", error);
    res.status(500).json({ error: "Failed to fetch Brave Search results" });
  }
}