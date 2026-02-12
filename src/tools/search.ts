import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { search } from "../searxng.js";
import type { SearxngInfobox, SearxngSearchResponse } from "../types.js";

const searchSchema = {
  query: z.string(),
  categories: z.string().optional(),
  engines: z.string().optional(),
  language: z.string().optional(),
  time_range: z.enum(["day", "month", "year"]).optional(),
  pageno: z.number().int().min(1).default(1),
  safesearch: z.enum(["0", "1", "2"]).optional(),
};

function formatInfobox(infobox: SearxngInfobox): string[] {
  const lines: string[] = [];
  lines.push(`- ${infobox.infobox}: ${infobox.content}`);
  if (infobox.urls?.length) {
    lines.push(`  URLs: ${infobox.urls.join(", ")}`);
  }
  return lines;
}

function formatSearchResponse(response: SearxngSearchResponse): string {
  const lines: string[] = [];

  lines.push(`Query: ${response.query}`);
  lines.push(`Total results: ${response.number_of_results}`);
  lines.push("");

  if (response.answers?.length) {
    lines.push("Answers:");
    response.answers.forEach((answer) => lines.push(`- ${answer}`));
    lines.push("");
  }

  if (response.infoboxes?.length) {
    lines.push("Infoboxes:");
    response.infoboxes.forEach((infobox) => {
      lines.push(...formatInfobox(infobox));
    });
    lines.push("");
  }

  if (response.corrections?.length) {
    lines.push(`Corrections: ${response.corrections.join(", ")}`);
    lines.push("");
  }

  if (response.suggestions?.length) {
    lines.push(`Suggestions: ${response.suggestions.join(", ")}`);
    lines.push("");
  }

  if (response.results?.length) {
    lines.push("Results:");
    response.results.forEach((result, index) => {
      lines.push(`${index + 1}. ${result.title}`);
      lines.push(`   URL: ${result.url}`);
      if (result.content) {
        lines.push(`   Snippet: ${result.content}`);
      }
      if (result.publishedDate) {
        lines.push(`   Published: ${result.publishedDate}`);
      }
      const engines =
        result.engines?.length ? result.engines.join(", ") : result.engine;
      if (engines) {
        lines.push(`   Engines: ${engines}`);
      }
    });
  } else {
    lines.push("No results.");
  }

  if (response.unresponsive_engines?.length) {
    lines.push("");
    lines.push(
      `Unresponsive engines: ${response.unresponsive_engines.join(", ")}`,
    );
  }

  return lines.join("\n");
}

export function registerSearchTool(server: McpServer, baseUrl: string): void {
  server.tool("search", searchSchema, async (input) => {
    try {
      const response = await search(baseUrl, input);
      const text = formatSearchResponse(response);
      return {
        content: [{ type: "text", text }],
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown search error";
      return {
        isError: true,
        content: [{ type: "text", text: message }],
      };
    }
  });
}
