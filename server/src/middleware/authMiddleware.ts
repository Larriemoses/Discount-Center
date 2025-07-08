// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AdminUser, { IAdminUser } from "../models/AdminUser"; // Assuming you use this
import asyncHandler from "express-async-handler"; // If you use this

interface AuthenticatedRequest extends Request {
  user?: IAdminUser; // Or whatever your user type is
}

// Authentication middleware
const protect = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        token = req.headers.authorization.split(" ")[1];
        const decoded: any = jwt.verify(
          token,
          process.env.JWT_SECRET as string
        );
        req.user = await AdminUser.findById(decoded.id).select("-password");
        next();
      } catch (error) {
        console.error(error);
        res.status(401);
        throw new Error("Not authorized, token failed");
      }
    }
    if (!token) {
      res.status(401);
      throw new Error("Not authorized, no token");
    }
  }
);

// Authorization middleware (THIS IS THE ONE YOU NEED TO EXPORT)
const authorize = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      // Assuming 'role' property on your user model
      res.status(403);
      throw new Error("Not authorized to access this route");
    }
    next();
  };
};

export { protect, authorize }; // <--- Make sure 'authorize' is exported here!
