import type {
  SearxngConfigResponse,
  SearxngSearchResponse,
} from "./types.js";

export type SearchParams = {
  query: string;
  categories?: string;
  engines?: string;
  language?: string;
  time_range?: "day" | "month" | "year";
  pageno?: number;
  safesearch?: "0" | "1" | "2";
};

export async function search(
  baseUrl: string,
  params: SearchParams,
): Promise<SearxngSearchResponse> {
  const url = new URL("/search", baseUrl);
  const searchParams = new URLSearchParams({
    q: params.query,
    format: "json",
  });

  if (params.categories) {
    searchParams.set("categories", params.categories);
  }
  if (params.engines) {
    searchParams.set("engines", params.engines);
  }
  if (params.language) {
    searchParams.set("language", params.language);
  }
  if (params.time_range) {
    searchParams.set("time_range", params.time_range);
  }
  if (params.pageno) {
    searchParams.set("pageno", params.pageno.toString());
  }
  if (params.safesearch) {
    searchParams.set("safesearch", params.safesearch);
  }
  url.search = searchParams.toString();

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`SearXNG search failed with status ${response.status}`);
  }

  return (await response.json()) as SearxngSearchResponse;
}

export async function getConfig(
  baseUrl: string,
): Promise<SearxngConfigResponse> {
  const url = new URL("/config", baseUrl);
  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`SearXNG config failed with status ${response.status}`);
  }

  return (await response.json()) as SearxngConfigResponse;
}
