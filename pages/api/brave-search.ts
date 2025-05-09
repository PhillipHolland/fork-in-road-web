import type { NextApiRequest, NextApiResponse } from "next";

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

    const braveData = await braveResponse.json();
    const webResults = braveData.web?.results || [];
    const formattedResults = webResults.map((result: any) => ({
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