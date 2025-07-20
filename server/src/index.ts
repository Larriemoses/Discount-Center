// server/src/index.ts

import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./config/db";
import cors from "cors";
import cron from "node-cron"; // <--- NEW: For scheduled tasks
import Product from "./models/Product"; // <--- NEW: Import Product model for cron job

// Import your custom middleware for error handling
import { notFound } from "./middleware/notFoundMiddleware";
import { errorHandler } from "./middleware/errorHandler";

// Import your routes
import authRoutes from "./routes/authRoutes";
import storeRoutes from "./routes/storeRoutes";
import productRoutes from "./routes/productRoutes";
import publicRoutes from "./routes/publicRoutes"; // Import public routes (ALREADY THERE)
// import itemRoutes from './routes/itemRoutes'; // Uncomment if you still need itemRoutes

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Configure CORS for frontend communication
app.use(
  cors({
    origin: "http://localhost:5173", // <--- Ensure this EXACTLY matches your frontend URL (e.g., Vite dev server)
    credentials: true,
  })
);

// Middleware for parsing request bodies
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Connect to MongoDB
connectDB();

// --- START: Global Daily Reset Cron Job (Optional but Recommended) ---
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
    timezone: "Africa/Lagos", // <--- IMPORTANT: Set your server's timezone here
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
app.use("/api/public", publicRoutes); // <--- ADD THIS LINE! This is the missing piece.
// app.use('/api/items', itemRoutes); // Uncomment if you still need itemRoutes

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
