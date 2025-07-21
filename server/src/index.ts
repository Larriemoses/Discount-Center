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
import publicRoutes from "./routes/publicRoutes"; // Import public routes

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// --- START: CORS Configuration ---
// Get allowed origins from environment variables, split by comma, and trim whitespace.
// This allows you to set ALLOWED_ORIGINS="http://localhost:5173,https://your-vercel-app.vercel.app"
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS || "https://discount-center-p2vm.vercel.app/"
)
  .split(",")
  .map((url) => url.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      // Check if the requesting origin is in our allowed list
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}.`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // Important for sending cookies/tokens (like your adminToken)
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Explicitly allow common HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Explicitly allow common headers
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
app.use("/api/public", publicRoutes); // This was missing in your previous version, now explicitly added.

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
