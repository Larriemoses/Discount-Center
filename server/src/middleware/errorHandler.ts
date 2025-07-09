// src/middleware/errorHandler.ts

import { Request, Response, NextFunction } from "express";

// This function will catch any errors passed to next() or thrown by async handlers
const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Determine the appropriate status code.
  // If a status code was already set on the response (e.g., by res.status(404)), use that.
  // Otherwise, default to 500 (Internal Server Error).
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Set the status code on the response
  res.status(statusCode);

  // Send a JSON response with the error message
  res.json({
    message: err.message, // The error message
    // In development, include the stack trace for debugging.
    // In production, suppress the stack trace for security reasons.
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export { errorHandler };
