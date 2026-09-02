import type { RequestHandler } from "express";

import { hasJsonBody } from "../middleware/jsonBody.js";
import { replaceDogValues } from "../services/replaceDogValues.js";
import type { JsonValue } from "../types/json.js";

export function createReplaceHandler(maxReplacements: number): RequestHandler {
  return (request, response) => {
    if (!hasJsonBody(request)) {
      response.status(400).json({
        error: "A JSON body is required",
      });
      return;
    }

    const result = replaceDogValues(request.body as JsonValue, maxReplacements);

    response.set("X-Replacements-Made", String(result.replacements));
    response.status(200).json(result.value);
  };
}
