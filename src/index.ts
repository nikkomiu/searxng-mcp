import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { loadConfig } from "./config.js";
import { initLogger } from "./logger.js";
import { registerConfigTool } from "./tools/config.js";
import { registerSearchTool } from "./tools/search.js";

const logger = await initLogger();
let baseUrl = "";

try {
  ({ baseUrl } = loadConfig());
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown config error";
  logger.error(message);
  process.exit(1);
}

const server = new McpServer({
  name: "searxng",
  version: "1.0.0",
});

registerSearchTool(server, baseUrl);
registerConfigTool(server, baseUrl);

const transport = new StdioServerTransport();
await server.connect(transport);
logger.info("SearXNG MCP server running");
