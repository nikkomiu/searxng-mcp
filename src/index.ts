import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import type { AppConfig } from "./config.js";
import { loadConfig } from "./config.js";
import { initLogger } from "./logger.js";
import { registerConfigTool } from "./tools/config.js";
import { registerSearchTool } from "./tools/search.js";

const logger = await initLogger();
let baseUrl = "";
let appConfig: AppConfig | undefined;

try {
  appConfig = loadConfig();
  baseUrl = appConfig.baseUrl;
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown config error";
  logger.error(message);
  process.exit(1);
}

const server = new McpServer({
  name: "searxng",
  version: "1.0.0",
});

registerSearchTool(server, appConfig!);
registerConfigTool(server, baseUrl);

const transport = new StdioServerTransport();
await server.connect(transport);
logger.info("SearXNG MCP server running");
