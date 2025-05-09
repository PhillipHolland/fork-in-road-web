import type { NextApiRequest, NextApiResponse } from "next";

// Define the shape of a single Brave Search result
interface BraveSearchResult {
  title: string;
  url: string;
  description: string;
  [key: string]: unknown; // Allow for additional properties
}

// Define the shape of the Brave Search API response
interface BraveSearchResponse {
  web?: {
    results: BraveSearchResult[];
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req.query;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    const braveResponse = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`,
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

    res.status(200).json(formattedResults);
  } catch (error) {
    console.error("Error fetching Brave Search results:", error);
    res.status(500).json({ error: "Failed to fetch Brave Search results" });
  }
}