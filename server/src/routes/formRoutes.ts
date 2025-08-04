// server/src/routes/formRoutes.ts

import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import sendEmail from "../utils/sendEmail";

const router = Router();

// @desc    Submit a "Contact Us" form
// @route   POST /api/forms/contact
// @access  Public
router.post(
  "/contact",
  asyncHandler(async (req: Request, res: Response) => {
    const { name, email, subject, message } = req.body;

    // Validate the input
    if (!name || !email || !subject || !message) {
      res.status(400);
      throw new Error("Please fill in all fields.");
    }

    // Compose the email message
    const emailMessage = `
      <h1>New Contact Us Submission</h1>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    try {
      // The 'from' address is handled internally by your sendEmail utility.
      await sendEmail({
        to: process.env.ADMIN_EMAIL as string,
        subject: `New Contact Form Submission: ${subject}`,
        html: emailMessage,
        replyTo: email,
      });

      res
        .status(200)
        .json({ success: true, message: "Message sent successfully!" });
    } catch (error: any) {
      console.error("Error sending contact email:", error);
      res.status(500);
      throw new Error("Failed to send message. Please try again later.");
    }
  })
);

// @desc    Submit a "Submit Store" form
// @route   POST /api/forms/submit-store
// @access  Public
router.post(
  "/submit-store",
  asyncHandler(async (req: Request, res: Response) => {
    const {
      storeName,
      storeOwnerName,
      storeOwnerEmail,
      storeUrl,
      message,
      category,
    } = req.body;

    // Validate the input
    if (!storeName || !storeOwnerEmail || !storeUrl) {
      res.status(400);
      throw new Error(
        "Please provide store name, your email, and the store URL."
      );
    }

    // Compose the email message
    const emailMessage = `
      <h1>New Store Submission</h1>
      <p><strong>Store Name:</strong> ${storeName}</p>
      <p><strong>Store URL:</strong> <a href="${storeUrl}">${storeUrl}</a></p>
      <p><strong>Category:</strong> ${category}</p>
      <p><strong>Store Owner's Name:</strong> ${
        storeOwnerName || "Not provided"
      }</p>
      <p><strong>Store Owner's Email:</strong> ${storeOwnerEmail}</p>
      ${message ? `<p><strong>Message:</strong></p><p>${message}</p>` : ""}
    `;

    try {
      // The 'from' address is handled internally by your sendEmail utility.
      await sendEmail({
        to: process.env.ADMIN_EMAIL as string,
        subject: `New Store Submission: ${storeName}`,
        html: emailMessage,
        replyTo: storeOwnerEmail,
      });

      res.status(200).json({
        success: true,
        message: "Store submission received successfully!",
      });
    } catch (error: any) {
      console.error("Error sending store submission email:", error);
      res.status(500);
      throw new Error(
        "Failed to send store submission. Please try again later."
      );
    }
  })
);

export default router;
