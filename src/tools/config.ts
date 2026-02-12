import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { getConfig } from "../searxng.js";
import type { SearxngConfigResponse } from "../types.js";

// Empty schema for config tool - no input parameters
const emptySchema = z.object({});

function formatLocales(locales: SearxngConfigResponse["locales"]): string {
  if (Array.isArray(locales)) {
    return locales.join(", ");
  }

  return Object.keys(locales).join(", ");
}

function formatConfigResponse(config: SearxngConfigResponse): string {
  const lines: string[] = [];
  const enabledEngines = config.engines.filter((engine) => engine.enabled);
  const grouped = new Map<string, Set<string>>();

  enabledEngines.forEach((engine) => {
    const categories = engine.categories?.length
      ? engine.categories
      : ["uncategorized"];
    categories.forEach((category) => {
      if (!grouped.has(category)) {
        grouped.set(category, new Set());
      }
      grouped.get(category)?.add(engine.name);
    });
  });

  lines.push(`Instance: ${config.instance_name}`);
  lines.push(`Version: ${config.version}`);
  lines.push(`Default locale: ${config.default_locale}`);
  lines.push(`Safe search: ${config.safe_search}`);
  lines.push(`Categories: ${config.categories.join(", ")}`);
  lines.push("");
  lines.push("Enabled engines by category:");

  const sortedCategories = Array.from(grouped.keys()).sort();
  sortedCategories.forEach((category) => {
    const engines = Array.from(grouped.get(category) ?? []).sort();
    lines.push(`- ${category}: ${engines.join(", ")}`);
  });

  lines.push("");
  lines.push(`Locales: ${formatLocales(config.locales)}`);

  return lines.join("\n");
}

export function registerConfigTool(server: McpServer, baseUrl: string): void {
  server.tool("config", {}, async () => {
    try {
      const response = await getConfig(baseUrl);
      const text = formatConfigResponse(response);
      return {
        content: [{ type: "text", text }],
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown config error";
      return {
        isError: true,
        content: [{ type: "text", text: message }],
      };
    }
  });
}
