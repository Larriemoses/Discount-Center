// server/src/routes/authRoutes.ts
import express, { Request, Response, NextFunction } from "express"; // Import Request, Response, NextFunction
import jwt from "jsonwebtoken";
import AdminUser, { IAdminUser } from "../models/AdminUser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { protect, authorize } from "../middleware/authMiddleware"; // Import protect and authorize

dotenv.config();

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in .env");
  process.exit(1);
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

const generateToken = (id: mongoose.Types.ObjectId) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

// Extend the Request interface to include the 'user' property for middleware usage
interface CustomRequest extends Request {
  user?: IAdminUser; // Aligns with your authMiddleware.ts
}

// @route   POST /api/auth/admin/register
// @desc    Register a new admin user (ONLY FOR INITIAL SETUP - SECURE LATER!)
// @access  Public (for initial setup)
router.post(
  "/admin/register",
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;

    try {
      const existingUser = await AdminUser.findOne({ username });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Admin username already exists" });
      }

      const newUser: IAdminUser = new AdminUser({ username, password });
      await newUser.save();

      const token = generateToken(newUser._id as mongoose.Types.ObjectId);

      res.status(201).json({
        message: "Admin registered successfully",
        token,
        username: newUser.username,
        role: newUser.role,
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }
);

// @route   POST /api/auth/admin/login
// @desc    Authenticate admin & get token
// @access  Public
router.post(
  "/admin/login",
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;

    try {
      const user = await AdminUser.findOne({ username }).select("+password");
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user._id as mongoose.Types.ObjectId);

      res.status(200).json({
        message: "Login successful",
        token,
        username: user.username,
        role: user.role,
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }
);

// @route   GET /api/auth/admin/me
// @desc    Get current logged-in admin user
// @access  Private (Admin only)
router.get(
  "/admin/me",
  protect,
  authorize(["admin"]), // Ensure the role matches your AdminUser model's enum
  async (req: CustomRequest, res: Response) => {
    // <--- Changed from req: Request to req: CustomRequest
    try {
      // req.user is populated by the 'protect' middleware
      if (!req.user) {
        // <--- Using req.user here
        return res.status(404).json({ message: "Admin user not found" });
      }
      res.status(200).json({
        message: "Admin details fetched successfully",
        data: {
          _id: req.user._id, // <--- Using req.user here
          username: req.user.username, // <--- Using req.user here
          role: req.user.role, // <--- Using req.user here
        },
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }
);

export default router;
