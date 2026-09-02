import { readWholeNumber } from "./helpers/readWholeNumber.js";

export interface AppConfig {
  maxReplacements: number;
  maxBodyBytes: number;
}

export interface ServerConfig extends AppConfig {
  port: number;
}

export function loadConfig(
  environment: NodeJS.ProcessEnv = process.env,
): ServerConfig {
  return {
    maxReplacements: readWholeNumber(environment, "MAX_REPLACEMENTS", 100, 0),
    maxBodyBytes: readWholeNumber(environment, "MAX_BODY_BYTES", 1_000_000, 1),
    port: readWholeNumber(environment, "PORT", 3000, 1, 65_535),
  };
}
