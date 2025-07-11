// server/src/middleware/errorHandler.ts

import { Request, Response, NextFunction } from "express";
import ErrorResponse from "../utils/errorResponse"; // <--- Import your custom ErrorResponse

// This function will catch any errors passed to next() or thrown by async handlers
const errorHandler = (
  err: any, // Change type to 'any' to handle both Error and ErrorResponse instances
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode: number = res.statusCode === 200 ? 500 : res.statusCode; // Default to 500 or existing status
  let message: string = err.message; // Default message

  // Log the error stack in development for debugging
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  // Check if the error is an instance of our custom ErrorResponse
  if (err instanceof ErrorResponse) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === "CastError") {
    // Handle Mongoose bad ObjectId
    statusCode = 404;
    message = `Resource not found`; // Or a more specific message like `Resource not found with ID of ${err.value}`
  } else if (err.code === 11000) {
    // Handle Mongoose duplicate key error
    statusCode = 400;
    message = `Duplicate field value entered`;
  } else if (err.name === "ValidationError") {
    // Handle Mongoose validation errors
    statusCode = 400;
    // Map validation error messages
    const errors = Object.values(err.errors).map((val: any) => val.message);
    message = `Validation failed: ${errors.join(", ")}`;
  } else if (
    err.name === "JsonWebTokenError" ||
    err.name === "TokenExpiredError"
  ) {
    // Handle JWT errors (if you have auth setup)
    statusCode = 401;
    message = "Not authorized, token failed or expired";
  }
  // Add other specific error handling here if needed

  // Set the status code on the response
  res.status(statusCode);

  // Send a JSON response with the error message
  res.json({
    success: false, // Indicate that the request was not successful
    error: message, // The error message
    // In development, include the stack trace for debugging.
    // In production, suppress the stack trace for security reasons.
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export { errorHandler };
