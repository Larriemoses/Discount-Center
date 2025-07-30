import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import AdminUser from "../models/AdminUser";
import ErrorResponse from "../utils/errorResponse";
import sendEmail from "../utils/sendEmail";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET_FROM_ENV = process.env.JWT_SECRET;
if (!JWT_SECRET_FROM_ENV) {
  throw new Error(
    "FATAL ERROR: JWT_SECRET is not defined in environment variables. Please set it."
  );
}
const JWT_SECRET: string = JWT_SECRET_FROM_ENV;

// @ts-ignore: Temporarily ignore type error for JWT_EXPIRE_DURATION type
const JWT_EXPIRE_DURATION: jwt.SignOptions["expiresIn"] =
  process.env.JWT_EXPIRE || "1h";

// @desc    Admin Login
// @route   POST /api/auth/admin/login
// @access  Public
const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;

    if (!username || !password) {
      console.log("Login attempt: Missing username or password.");
      return next(
        new ErrorResponse("Please enter a username and password", 400)
      );
    }

    const adminUser = await AdminUser.findOne({ username }).select("+password");

    if (!adminUser) {
      console.log(`Login attempt for username '${username}': User not found.`);
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    const isMatch = await adminUser.comparePassword(password);

    if (!isMatch) {
      console.log(
        `Login attempt for username '${username}': Password mismatch.`
      );
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    // @ts-ignore: Temporarily ignore type error for expiresIn
    const token = jwt.sign(
      { id: adminUser._id, role: adminUser.role },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRE_DURATION,
      }
    );

    console.log(`Login successful for username: ${username}`);
    res.status(200).json({
      success: true,
      token,
      username: adminUser.username,
      role: adminUser.role,
    });
  }
);

// @desc    Forgot Password for Admin
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    const adminUser = await AdminUser.findOne({ email });

    if (!adminUser) {
      console.log(
        `Forgot password attempt for email '${email}': Admin user not found.`
      );
      return next(
        new ErrorResponse("There is no admin user with that email", 404)
      );
    }

    if (!adminUser.email) {
      console.log(
        `Forgot password attempt for username '${adminUser.username}': Admin user found but has no email configured for password reset.`
      );
      return next(
        new ErrorResponse(
          "Admin user has no email configured for password reset.",
          400
        )
      );
    }

    const resetToken = adminUser.getResetPasswordToken();
    await adminUser.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `
    <h1>You have requested a password reset for your Admin account</h1>
    <p>Please go to this link to reset your password:</p>
    <a href="${resetUrl}" clicktracking="off">${resetUrl}</a>
    <p>This link will expire in 10 minutes.</p>
    <p>If you did not request this, please ignore this email.</p>
  `;

    try {
      await sendEmail({
        to: adminUser.email,
        subject: "Admin Password Reset Token",
        html: message,
      });

      console.log(`Admin password reset email sent to: ${adminUser.email}`);
      res
        .status(200)
        .json({ success: true, data: "Admin password reset email sent" });
    } catch (err: any) {
      console.error("Error sending admin password reset email:", err);
      adminUser.resetPasswordToken = undefined;
      adminUser.resetPasswordExpire = undefined;
      await adminUser.save({ validateBeforeSave: false });
      return next(new ErrorResponse("Email could not be sent", 500));
    }
  }
);

// @desc    Reset Password for Admin
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { password } = req.body;
    const resetToken = req.params.resettoken;

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const adminUser = await AdminUser.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!adminUser) {
      console.log(
        `Reset password attempt: Invalid or expired token '${resetToken}'.`
      );
      return next(new ErrorResponse("Invalid or expired token", 400));
    }

    adminUser.password = password;
    adminUser.resetPasswordToken = undefined;
    adminUser.resetPasswordExpire = undefined;
    await adminUser.save();

    console.log(
      `Admin password for user '${adminUser.username}' reset successfully.`
    );
    res
      .status(200)
      .json({ success: true, data: "Admin password reset successfully" });
  }
);

export { login, forgotPassword, resetPassword };
