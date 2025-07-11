// server/src/middleware/asyncHandler.ts

import { Request, Response, NextFunction } from "express";

/**
 * A higher-order function to wrap asynchronous Express route handlers.
 * It ensures that any errors encountered during the execution of the async handler
 * are caught and passed to the next Express error handling middleware.
 * This prevents you from having to write try/catch blocks in every async controller.
 *
 * @param fn The asynchronous Express route handler function (req, res, next).
 * @returns An Express route handler that catches errors.
 */
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    // Resolve the promise and catch any errors, passing them to the next middleware
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export default asyncHandler;
