import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AdminUser, { IAdminUser } from "../models/AdminUser";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Initialize the Express router
const router = express.Router(); // <--- THIS LINE WAS MISSING OR OVERLOOKED IN THE PREVIOUS PASTE

// Get JWT Secret from environment variables
// Ensure JWT_SECRET is treated as a string, as process.env values always are.
const JWT_SECRET = process.env.JWT_SECRET as string;
// Fallback for development, though it should ideally always come from .env
if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in .env");
  process.exit(1); // Exit if secret is not set, as it's critical
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

// Utility function to generate a JWT
const generateToken = (id: mongoose.Types.ObjectId) => {
  // jwt.sign expects Secret as the second argument, which can be a string.
  // Explicitly ensuring JWT_SECRET is treated as `jwt.Secret` if `as string` isn't enough for TS.
  // In most cases, `as string` is sufficient, but if not, this is the next step.
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions); // <--- Explicitly cast options to jwt.SignOptions
};

// @route   POST /api/auth/admin/register
// @desc    Register a new admin user (ONLY FOR INITIAL SETUP - SECURE LATER!)
// @access  Public (for initial setup)
router.post(
  "/admin/register",
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;

    try {
      // Check if an admin already exists (optional, depends on your strategy for multi-admin)
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
      // 1. Check if user exists
      const user = await AdminUser.findOne({ username });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // 2. Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // 3. Generate JWT
      const token = generateToken(user._id as mongoose.Types.ObjectId);

      res.status(200).json({
        message: "Login successful",
        token,
        username: user.username,
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }
);

export default router;
