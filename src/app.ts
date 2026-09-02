import express, { type Express } from "express";

import type { AppConfig } from "./config.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { parseJson, requireJson } from "./middleware/jsonBody.js";
import { notFound } from "./middleware/notFound.js";
import { health } from "./routes/health.js";
import { createReplaceHandler } from "./routes/replace.js";

export function createApp(config: AppConfig): Express {
  const app = express();

  app.disable("x-powered-by");

  app.get("/health", health);

  app.post(
    "/replace",
    requireJson,
    parseJson(config.maxBodyBytes),
    createReplaceHandler(config.maxReplacements),
  );

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
