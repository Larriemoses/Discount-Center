// server/src/controllers/publicController.ts
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Store from "../models/Store"; // Assuming you might want to save submitted stores to a 'pending' state or similar
import Product from "../models/Product"; // Re-import Product model
import sendEmail from "../utils/sendEmail"; // We'll create this utility

// @desc    Submit a new store suggestion
// @route   POST /api/public/submit-store
// @access  Public
const submitStore = asyncHandler(async (req: Request, res: Response) => {
  const { name, mainUrl, description, contactEmail, contactName } = req.body;

  if (!name || !mainUrl) {
    res.status(400);
    throw new Error("Please provide store name and website URL.");
  }

  // OPTION 1: Just send an email notification to the admin
  const adminEmail = process.env.ADMIN_EMAIL || "your_admin_email@example.com"; // Set this in your .env
  const emailSubject = `New Store Suggestion: ${name}`;
  const emailMessage = `
    A new store has been suggested:
    Name: ${name}
    URL: ${mainUrl}
    Description: ${description || "N/A"}
    Suggested by: ${contactName || "Anonymous"}
    Contact Email: ${contactEmail || "N/A"}
  `;

  try {
    await sendEmail({
      to: adminEmail,
      subject: emailSubject,
      html: emailMessage, // Or use a proper HTML template
    });
    res
      .status(200)
      .json({ success: true, message: "Store suggestion received." });
  } catch (error: any) {
    console.error("Error sending store suggestion email:", error);
    res.status(500);
    throw new Error(
      "Store suggestion received, but failed to send admin notification email."
    );
  }

  // OPTION 2 (More advanced): Save to a 'pending' collection in MongoDB
  // This would require a new Mongoose model, e.g., `SuggestedStore.ts`
  /*
  const newSuggestion = await SuggestedStore.create({
    name,
    mainUrl,
    description,
    contactEmail,
    contactName,
    status: 'pending', // e.g., 'pending', 'reviewed', 'approved', 'rejected'
    submittedAt: new Date(),
  });
  res.status(201).json({ success: true, data: newSuggestion, message: 'Store suggestion received. We will review it soon.' });
  */
});

// @desc    Handle contact us form submission
// @route   POST /api/public/contact
// @access  Public
const contactUs = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    res.status(400);
    throw new Error("Please fill in all fields.");
  }

  const adminEmail = process.env.ADMIN_EMAIL || "your_admin_email@example.com"; // Set this in your .env
  const emailSubject = `Contact Form Inquiry: ${subject} from ${name}`;
  const emailMessage = `
    You have a new message from the contact form:
    Name: ${name}
    Email: ${email}
    Subject: ${subject}
    Message:
    ${message}
  `;

  try {
    await sendEmail({
      to: adminEmail,
      subject: emailSubject,
      html: emailMessage, // Or use a proper HTML template
      replyTo: email, // Set reply-to to the user's email
    });
    res.status(200).json({
      success: true,
      message: "Your message has been sent successfully!",
    });
  } catch (error: any) {
    console.error("Error sending contact form email:", error);
    res.status(500);
    throw new Error("Failed to send your message. Please try again later.");
  }
});

// @desc    Get all products for public display (for prerendering and general listing)
// @route   GET /api/public/products
// @access  Public
const getAllPublicProducts = asyncHandler(
  async (req: Request, res: Response) => {
    // Fetch all products. You might want to select specific fields
    // to reduce payload size if you don't need everything for prerendering.
    const products = await Product.find({})
      .select(
        "name slug images description price oldPrice discountPercentage store category brand isFeatured isBestSeller todayUses"
      )
      .populate("store", "name slug logo"); // Populate store details if needed for product pages

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  }
);

export { submitStore, contactUs, getAllPublicProducts }; // <-- Export the new function
