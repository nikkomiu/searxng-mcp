import pino, { multistream, type DestinationStream } from "pino";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { basename, dirname, isAbsolute, resolve } from "node:path";

import { loadLoggerConfig } from "./config.js";

function resolveDefaultLogDir(): string {
  const execName = basename(process.execPath);
  const isBun = execName === "bun" || execName === "bun.exe";

  if (!isBun) {
    return dirname(process.execPath);
  }

  const scriptPath = process.argv[1];
  if (scriptPath) {
    return dirname(scriptPath);
  }

  return process.cwd();
}

function resolveLogFilePath(logDir: string | undefined, logFile: string): string {
  const logDirOverride = logDir;
  const defaultDir = logDirOverride
    ? resolve(logDirOverride)
    : resolveDefaultLogDir();

  if (isAbsolute(logFile)) {
    return logFile;
  }

  return resolve(logDirOverride ?? defaultDir, logFile);
}

async function truncateLogFile(
  filePath: string,
  maxAgeMs: number,
): Promise<void> {
  try {
    const raw = await readFile(filePath, "utf8");
    const cutoff = Date.now() - maxAgeMs;
    const kept: string[] = [];

    for (const line of raw.split(/\r?\n/)) {
      if (!line) {
        continue;
      }

      let keep = true;
      try {
        const parsed = JSON.parse(line) as { time?: string | number };
        const timeValue = parsed.time;
        if (timeValue !== undefined) {
          let timestamp: number | null = null;
          if (typeof timeValue === "number") {
            timestamp = timeValue;
          } else if (typeof timeValue === "string") {
            const parsedDate = Date.parse(timeValue);
            if (!Number.isNaN(parsedDate)) {
              timestamp = parsedDate;
            }
          }
          if (timestamp !== null) {
            keep = timestamp >= cutoff;
          }
        }
      } catch {
        keep = true;
      }

      if (keep) {
        kept.push(line);
      }
    }

    const tempPath = `${filePath}.${Date.now()}.tmp`;
    const payload = kept.length ? `${kept.join("\n")}\n` : "";
    await writeFile(tempPath, payload, "utf8");
    await rename(tempPath, filePath);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code !== "ENOENT") {
      console.error("Failed to truncate log file", error);
    }
  }
}

export async function initLogger(): Promise<pino.Logger> {
  const loggerConfig = loadLoggerConfig();
  const logFilePath = resolveLogFilePath(loggerConfig.logDir, loggerConfig.logFile);
  await mkdir(dirname(logFilePath), { recursive: true });

  const truncateEnabled = loggerConfig.logTruncate;
  const maxAgeHours = loggerConfig.logMaxAgeHours;

  if (truncateEnabled && maxAgeHours > 0) {
    await truncateLogFile(logFilePath, maxAgeHours * 60 * 60 * 1000);
  }

  const level = loggerConfig.logLevel;
  const fileStream = pino.destination({ dest: logFilePath, sync: false });
  const streams: Array<{ stream: DestinationStream }> = [{ stream: fileStream }];

  if (loggerConfig.logToStderr) {
    streams.push({ stream: pino.destination({ dest: 2, sync: false }) });
  }

  if (streams.length > 1) {
    return pino({ level, timestamp: pino.stdTimeFunctions.isoTime }, multistream(streams));
  }

  return pino({ level, timestamp: pino.stdTimeFunctions.isoTime }, fileStream);
}
