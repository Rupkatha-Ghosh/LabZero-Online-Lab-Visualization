import { Response } from "express";

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = "Request completed successfully.",
  statusCode = 200
) => res.status(statusCode).json({ success: true, message, data });

export const sendError = (
  res: Response,
  error: unknown,
  fallbackMessage = "Something went wrong.",
  statusCode = 500
) => {
  const message = error instanceof Error ? error.message : fallbackMessage;
  return res.status(statusCode).json({ success: false, message });
};
