import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerConfigTool } from "./tools/config.js";
import { registerSearchTool } from "./tools/search.js";

const baseUrl = process.env.SEARXNG_URL;

if (!baseUrl) {
  console.error("SEARXNG_URL is required");
  process.exit(1);
}

const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");

const server = new McpServer({
  name: "searxng",
  version: "1.0.0",
});

registerSearchTool(server, normalizedBaseUrl);
registerConfigTool(server, normalizedBaseUrl);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("SearXNG MCP server running");
