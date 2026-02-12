export type SafeSearchLevel = 0 | 1 | 2;

export type AppConfig = {
  baseUrl: string;
  defaultResultCount: number;
  defaultSafeSearch: SafeSearchLevel;
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
const DEFAULT_RESULT_COUNT = 10;
const DEFAULT_SAFESEARCH: SafeSearchLevel = 1;

const SAFESEARCH_MAP: Record<string, SafeSearchLevel> = {
  none: 0,
  moderate: 1,
  strict: 2,
};

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

function parsePositiveIntegerValue(
  value: string | undefined,
  fallback: number,
  envName: string,
): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(
      `${envName} must be a positive integer, received: ${value}`,
    );
  }

  return Math.floor(parsed);
}

export function normalizeSafeSearchValue(
  value: string | number | undefined,
  fallback: SafeSearchLevel,
  source = "Safe search level",
): SafeSearchLevel {
  if (!value) {
    return fallback;
  }

  if (typeof value === "number") {
    if (Number.isInteger(value) && value >= 0 && value <= 2) {
      return value as SafeSearchLevel;
    }

    throw new Error(`${source} must be 0, 1, or 2 (received: ${value})`);
  }

  const trimmed = value.trim();
  const normalized = trimmed.toLowerCase();
  if (SAFESEARCH_MAP[normalized] !== undefined) {
    return SAFESEARCH_MAP[normalized];
  }

  const parsed = Number(trimmed);
  if (Number.isInteger(parsed) && parsed >= 0 && parsed <= 2) {
    return parsed as SafeSearchLevel;
  }

  throw new Error(
    `${source} must be 0, 1, 2 or one of: none, moderate, strict (received: ${value})`,
  );
}

export function loadConfig(): AppConfig {
  const rawBaseUrl = process.env.SEARXNG_URL;

  if (!rawBaseUrl) {
    throw new Error("SEARXNG_URL is required");
  }

  const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, "");

  return {
    baseUrl: normalizedBaseUrl,
    defaultResultCount: parsePositiveIntegerValue(
      process.env.SEARXNG_DEFAULT_RESULT_COUNT,
      DEFAULT_RESULT_COUNT,
      "SEARXNG_DEFAULT_RESULT_COUNT",
    ),
    defaultSafeSearch: normalizeSafeSearchValue(
      process.env.SEARXNG_DEFAULT_SAFESEARCH,
      DEFAULT_SAFESEARCH,
      "SEARXNG_DEFAULT_SAFESEARCH",
    ),
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
