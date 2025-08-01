// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"; // Import JwtPayload
import AdminUser, { IAdminUser } from "../models/AdminUser";
import asyncHandler from "express-async-handler";

// Extend the Request interface to include the 'user' property for type safety
// This is a crucial step for TypeScript to know that 'req.user' exists
interface CustomRequest extends Request {
  user?: IAdminUser;
}

// Ensure JWT_SECRET is available and has the correct type
const JWT_SECRET_FROM_ENV = process.env.JWT_SECRET;
if (!JWT_SECRET_FROM_ENV) {
  // This is a critical error, so we should fail fast
  console.error(
    "FATAL ERROR: JWT_SECRET is not defined in environment variables."
  );
  process.exit(1);
}
const JWT_SECRET: string = JWT_SECRET_FROM_ENV;

// Authentication middleware - Ensures a valid token is present and a user is attached to the request
const protect = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        // Get token from header
        token = req.headers.authorization.split(" ")[1];

        // Verify token and cast to JwtPayload for better type checking
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        // Find user by ID and attach it to the request object, without the password
        req.user = await AdminUser.findById(decoded.id).select("-password");

        if (!req.user) {
          res.status(401);
          throw new Error("Not authorized, user not found.");
        }

        next();
      } catch (error) {
        console.error("Token verification failed:", error);
        res.status(401);
        throw new Error("Not authorized, token failed.");
      }
    } else {
      res.status(401);
      throw new Error("Not authorized, no token.");
    }
  }
);

// Authorization middleware - Ensures the user has one of the required roles
const authorize = (roles: string[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    // Check if req.user exists and has the required role
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error("Not authorized to access this route.");
    }
    next();
  };
};

export { protect, authorize };
