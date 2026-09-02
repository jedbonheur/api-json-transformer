import type { RequestHandler } from "express";

export const health: RequestHandler = (_request, response) => {
  response.status(200).json({
    status: "ok",
  });
};
