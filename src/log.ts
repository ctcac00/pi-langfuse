import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { platform, homedir } from "node:os";

function resolveLogFilePath(): string {
  if (process.env.PI_LANGFUSE_LOG_FILE) {
    return process.env.PI_LANGFUSE_LOG_FILE;
  }
  if (platform() === "darwin") {
    const dir = join(homedir(), "Library", "Logs");
    mkdirSync(dir, { recursive: true });
    return join(dir, "pi-langfuse-debug.log");
  }
  // Linux: use XDG_STATE_HOME, falling back to ~/.local/state
  const xdgState = process.env.XDG_STATE_HOME || join(homedir(), ".local", "state");
  mkdirSync(xdgState, { recursive: true });
  return join(xdgState, "pi-langfuse-debug.log");
}

let logFilePath: string | undefined;

function getLogPath(): string {
  if (!logFilePath) {
    logFilePath = resolveLogFilePath();
  }
  return logFilePath;
}

function fileLog(message: string, data?: unknown): void {
  try {
    const ts = new Date().toISOString();
    const line = data !== undefined
      ? `[${ts}] ${message} ${typeof data === "string" ? data : JSON.stringify(data)}\n`
      : `[${ts}] ${message}\n`;
    appendFileSync(getLogPath(), line);
  } catch {
    // Silently ignore log write failures
  }
}

export function debugLog(message: string): void {
  if (process.env.PI_LANGFUSE_DEBUG === "1" || process.env.PI_LANGFUSE_DEBUG === "true") {
    fileLog(message);
  }
}

export function warnLog(message: string, data?: unknown): void {
  fileLog(message, data);
}
