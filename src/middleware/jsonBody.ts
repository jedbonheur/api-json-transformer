import express, {
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from "express";

const requestsWithBodies = new WeakSet<object>();

export function requireJson(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  if (!request.is(["application/json", "application/*+json"])) {
    response.status(415).json({
      error: "Content-Type must be application/json",
    });
    return;
  }

  next();
}

export function parseJson(maxBodyBytes: number): RequestHandler {
  return express.json({
    limit: maxBodyBytes,
    strict: false,
    type: ["application/json", "application/*+json"],
    verify: (request, _response, buffer) => {
      if (buffer.length > 0) {
        requestsWithBodies.add(request);
      }
    },
  });
}

export function hasJsonBody(request: Request): boolean {
  return requestsWithBodies.has(request);
}
