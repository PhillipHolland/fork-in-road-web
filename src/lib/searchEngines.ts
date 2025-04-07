// src/lib/searchEngines.ts
export const searchEngines = {
  google: { baseUrl: "https://www.google.com/search", queryParam: "q" },
  bing: { baseUrl: "https://www.bing.com/search", queryParam: "q" },
  duckduckgo: { baseUrl: "https://duckduckgo.com/", queryParam: "q" },
  yahoo: { baseUrl: "https://search.yahoo.com/search", queryParam: "p" },
  ecosia: { baseUrl: "https://www.ecosia.org/search", queryParam: "q" },
} as const;

export type SearchEngine = keyof typeof searchEngines;