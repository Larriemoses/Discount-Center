import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import AdminUser from "../models/AdminUser"; // Import your AdminUser model
import ErrorResponse from "../utils/errorResponse"; // Your custom error class
import sendEmail from "../utils/sendEmail"; // Your email utility
import crypto from "crypto";
import jwt from "jsonwebtoken"; // For generating JWT tokens

// @desc    Admin Login
// @route   POST /api/auth/admin/login
// @access  Public
const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;

    // Check for username and password in the request body
    if (!username || !password) {
      console.log("Login attempt: Missing username or password."); // DEBUG LOG
      return next(
        new ErrorResponse("Please enter a username and password", 400)
      );
    }

    // Find the admin user by username and select the password field
    // .select('+password') is crucial here to retrieve the hashed password,
    // as it's typically excluded by default in the model schema (select: false)
    const adminUser = await AdminUser.findOne({ username }).select("+password");

    // If no user is found with the provided username
    if (!adminUser) {
      console.log(`Login attempt for username '${username}': User not found.`); // DEBUG LOG
      return next(new ErrorResponse("Invalid credentials", 401)); // 401 Unauthorized
    }

    // Compare the provided plain-text password with the hashed password in the database
    const isMatch = await adminUser.comparePassword(password);

    // If passwords do not match
    if (!isMatch) {
      console.log(
        `Login attempt for username '${username}': Password mismatch.`
      ); // DEBUG LOG
      return next(new ErrorResponse("Invalid credentials", 401)); // 401 Unauthorized
    }

    // If credentials are valid, generate a JWT token for the authenticated admin user
    const token = jwt.sign(
      { id: adminUser._id, role: adminUser.role },
      process.env.JWT_SECRET!,
      {
        expiresIn: process.env.JWT_EXPIRE, // Token expiration time from environment variables
      }
    );

    console.log(`Login successful for username: ${username}`); // DEBUG LOG
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

    // Find the admin user by email
    const adminUser = await AdminUser.findOne({ email });

    // If no admin user is found with the provided email
    if (!adminUser) {
      console.log(
        `Forgot password attempt for email '${email}': Admin user not found.`
      ); // DEBUG LOG
      return next(
        new ErrorResponse("There is no admin user with that email", 404)
      );
    }

    // Generate a password reset token using the method defined in the AdminUser model
    const resetToken = adminUser.getResetPasswordToken();

    // Save the admin user document with the new token and its expiration.
    // validateBeforeSave: false is used to bypass schema validation for fields
    // that might be required during creation but are not being updated here (e.g., password).
    await adminUser.save({ validateBeforeSave: false });

    // Construct the password reset URL for the email
    // process.env.FRONTEND_URL must be set in your environment variables (e.g., .env file, Render dashboard)
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `
    <h1>You have requested a password reset for your Admin account</h1>
    <p>Please go to this link to reset your password:</p>
    <a href="${resetUrl}" clicktracking="off">${resetUrl}</a>
    <p>This link will expire in 10 minutes.</p>
    <p>If you did not request this, please ignore this email.</p>
  `;

    try {
      // Send the email using the sendEmail utility
      await sendEmail({
        to: adminUser.email,
        subject: "Admin Password Reset Token",
        html: message,
      });

      console.log(`Admin password reset email sent to: ${adminUser.email}`); // DEBUG LOG
      res
        .status(200)
        .json({ success: true, data: "Admin password reset email sent" });
    } catch (err: any) {
      console.error("Error sending admin password reset email:", err); // DEBUG LOG
      // If email sending fails, clear the token and its expiration to prevent a stale token from being used
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
    const resetToken = req.params.resettoken; // Get the token from the URL parameters

    // Hash the URL token to compare it with the hashed token stored in the database
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Find the admin user by the hashed token and ensure the token has not expired
    const adminUser = await AdminUser.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }, // Token must be greater than current time (not expired)
    });

    // If no admin user is found or the token is invalid/expired
    if (!adminUser) {
      console.log(
        `Reset password attempt: Invalid or expired token '${resetToken}'.`
      ); // DEBUG LOG
      return next(new ErrorResponse("Invalid or expired token", 400));
    }

    // Set the new password. The pre-save hook in the AdminUser model will hash this new password.
    adminUser.password = password;
    // Clear the reset token fields after successful password reset
    adminUser.resetPasswordToken = undefined;
    adminUser.resetPasswordExpire = undefined;
    await adminUser.save(); // Save the updated admin user document

    console.log(
      `Admin password for user '${adminUser.username}' reset successfully.`
    ); // DEBUG LOG
    res
      .status(200)
      .json({ success: true, data: "Admin password reset successfully" });
  }
);

// Export the functions to be used in routes
export {
  login,
  forgotPassword,
  resetPassword,
  // Add other authentication-related exports here if you have them (e.g., getMe, updateDetails)
};
