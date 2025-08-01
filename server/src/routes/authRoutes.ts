// server/src/routes/authRoutes.ts

import express from "express";
import {
  login,
  forgotPassword,
  resetPassword,
} from "../controllers/authController";
import { protect, authorize } from "../middleware/authMiddleware";
import AdminUser, { IAdminUser } from "../models/AdminUser"; // Needed for register route and type casting
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

const router = express.Router();

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

      // This logic is simple enough to be kept in the route for a one-time setup
      const token = newUser.getSignedJwtToken();

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
router.post("/admin/login", login);

// @route   POST /api/auth/forgot-password
// @desc    Forgot Password
// @access  Public
router.post("/forgot-password", forgotPassword);

// @route   PUT /api/auth/reset-password/:resettoken
// @desc    Reset Password
// @access  Public
router.put("/reset-password/:resettoken", resetPassword);

// @route   GET /api/auth/admin/me
// @desc    Get current logged-in admin user
// @access  Private (Admin only)
router.get(
  "/admin/me",
  protect,
  authorize(["admin"]),
  async (req: Request, res: Response) => {
    try {
      // The `protect` middleware already handles setting `req.user`
      const user = (req as any).user; // Cast to 'any' to access user property

      if (!user) {
        return res.status(404).json({ message: "Admin user not found" });
      }
      res.status(200).json({
        message: "Admin details fetched successfully",
        data: {
          _id: user._id,
          username: user.username,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }
);

export default router;
