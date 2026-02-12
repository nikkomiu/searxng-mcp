export type AppConfig = {
  baseUrl: string;
};

export type LoggerConfig = {
  logDir?: string;
  logFile: string;
  logLevel: string;
  logToStderr: boolean;
  logTruncate: boolean;
  logMaxAgeHours: number;
};

const DEFAULT_LOG_FILE = "searxng-mcp.log";
const DEFAULT_LOG_LEVEL = "info";
const DEFAULT_LOG_TO_STDERR = true;
const DEFAULT_LOG_TRUNCATE = true;
const DEFAULT_LOG_MAX_AGE_HOURS = 24;

function parseBooleanValue(value: string | undefined, fallback: boolean): boolean {
  if (!value) {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function parseNumberValue(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function loadConfig(): AppConfig {
  const rawBaseUrl = process.env.SEARXNG_URL;

  if (!rawBaseUrl) {
    throw new Error("SEARXNG_URL is required");
  }

  const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, "");

  return {
    baseUrl: normalizedBaseUrl,
  };
}

export function loadLoggerConfig(): LoggerConfig {
  return {
    logDir: process.env.LOG_DIR,
    logFile: process.env.LOG_FILE ?? DEFAULT_LOG_FILE,
    logLevel: process.env.LOG_LEVEL ?? DEFAULT_LOG_LEVEL,
    logToStderr: parseBooleanValue(
      process.env.LOG_TO_STDERR,
      DEFAULT_LOG_TO_STDERR,
    ),
    logTruncate: parseBooleanValue(
      process.env.LOG_TRUNCATE,
      DEFAULT_LOG_TRUNCATE,
    ),
    logMaxAgeHours: parseNumberValue(
      process.env.LOG_MAX_AGE_HOURS,
      DEFAULT_LOG_MAX_AGE_HOURS,
    ),
  };
}
