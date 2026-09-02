import type { ErrorRequestHandler } from "express";

interface ParserError {
  status?: number;
  type?: string;
}

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  _next,
) => {
  const parserError = error as ParserError;

  if (parserError.type === "entity.too.large") {
    response.status(413).json({
      error: "JSON body is too large",
    });
    return;
  }

  if (
    parserError.type === "entity.parse.failed" ||
    (error instanceof SyntaxError && parserError.status === 400)
  ) {
    response.status(400).json({
      error: "Request body is not valid JSON",
    });
    return;
  }

  console.error("Unexpected request error", error);

  response.status(500).json({
    error: "Internal server error",
  });
};
