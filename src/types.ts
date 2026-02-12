export interface SearxngSearchResult {
  url: string;
  title: string;
  content: string;
  engine: string;
  engines: string[];
  score: number;
  category: string;
  publishedDate?: string;
}

export interface SearxngInfobox {
  infobox: string;
  id: string;
  content: string;
  urls: string[];
}

export interface SearxngSearchResponse {
  query: string;
  number_of_results: number;
  results: SearxngSearchResult[];
  answers: string[];
  corrections: string[];
  infoboxes: SearxngInfobox[];
  suggestions: string[];
  unresponsive_engines: string[];
}

export interface SearxngEngine {
  name: string;
  categories: string[];
  shortcut: string;
  enabled: boolean;
  paging: boolean;
  language_support: boolean;
  safesearch: boolean;
  time_range_support: boolean;
}

export interface SearxngConfigResponse {
  categories: string[];
  engines: SearxngEngine[];
  locales: Record<string, string> | string[];
  instance_name: string;
  safe_search: number;
  default_locale: string;
  version: string;
}
