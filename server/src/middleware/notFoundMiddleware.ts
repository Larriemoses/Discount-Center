// src/middleware/notFoundMiddleware.ts

import { Request, Response, NextFunction } from "express";

const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404); // Set the status to 404
  next(error); // Pass the error to the next error handling middleware
};

export { notFound };
