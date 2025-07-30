// server/src/index.ts

import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./config/db";
import cors from "cors";
import cron from "node-cron";
import Product from "./models/Product";

// Import your custom middleware for error handling
import { notFound } from "./middleware/notFoundMiddleware";
import { errorHandler } from "./middleware/errorHandler";

// Import your routes
import authRoutes from "./routes/authRoutes";
import storeRoutes from "./routes/storeRoutes";
import productRoutes from "./routes/productRoutes";
import publicRoutes from "./routes/publicRoutes";
import sitemapRoutes from "./routes/sitemapRoutes"; // Import the sitemap routes

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// --- START: CORS Configuration ---
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  "http://localhost:5173,https://discount-center-p2vm.vercel.app,https://discountcenterstores.com"
) // Removed trailing slash from vercel URL for consistency
  .split(",")
  .map((url) => url.trim())
  .filter((url) => url !== ""); // Filter out any empty strings from splitting

// Add default origins if ALLOWED_ORIGINS environment variable is empty or not set
if (allowedOrigins.length === 0) {
  allowedOrigins.push("http://localhost:5173");
  allowedOrigins.push("https://www.discountcenterstores.com");
  allowedOrigins.push("https://discountcenterstores.com");
  // You might want to uncomment and add your Vercel app URL here if it's a source for your frontend
  // allowedOrigins.push('https://discount-center-p2vm.vercel.app');
}

app.use(
  cors({
    origin: allowedOrigins, // <-- SIMPLIFIED: Pass the array directly
    credentials: true, // Important for sending cookies/tokens (like your adminToken)
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Explicitly allow common HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Explicitly allow common headers
    optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);
// --- END: CORS Configuration ---

// Middleware for parsing request bodies
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Connect to MongoDB
connectDB();

// --- START: Global Daily Reset Cron Job ---
cron.schedule(
  "0 0 * * *",
  async () => {
    console.log("Running daily todayUses reset cron job...");
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    try {
      const result = await Product.updateMany(
        { lastDailyReset: { $ne: todayMidnight } },
        {
          $set: {
            todayUses: 0,
            lastDailyReset: todayMidnight,
          },
        }
      );
      console.log(
        `Daily reset complete. Matched ${result.matchedCount} products, modified ${result.modifiedCount}.`
      );
    } catch (error) {
      console.error("Error during daily todayUses reset cron job:", error);
    }
  },
  {
    timezone: "Africa/Lagos", // IMPORTANT: Set your server's timezone here
  }
);
// --- END: Global Daily Reset Cron Job ---

// --- START: STATIC FILE SERVING CONFIGURATION ---
const PROJECT_ROOT_DIR = path.resolve(__dirname, "../../");
app.use(
  "/uploads",
  express.static(path.join(PROJECT_ROOT_DIR, "server", "uploads"))
);
// --- END: STATIC FILE SERVING CONFIGURATION ---

// Basic root route for API status check
app.get("/", (req: Request, res: Response) => {
  res.send("API is running...");
});

// Define your API routes
app.use("/api/auth", authRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/public", publicRoutes);

// Mount the sitemap routes
// It's common to serve sitemap.xml directly from the root of your API.
// Make sure this path matches what you put in your robots.txt
app.use("/", sitemapRoutes); // This will make sitemap.xml accessible at /sitemap.xml

// IMPORTANT: Error Handling Middleware (These must be placed AFTER all your specific routes)
// 1. Not Found Middleware: Catches any requests that don't match any defined routes
app.use(notFound);

// 2. Centralized Error Handler: Processes errors caught by notFound or thrown by controllers
app.use(errorHandler);

// Start the server
app.listen(port, () => {
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on http://localhost:${port}`
  );
});
