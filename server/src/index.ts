import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./config/db";
import cors from "cors";

// Import your custom middleware for error handling
import { notFound } from "./middleware/notFoundMiddleware";
import { errorHandler } from "./middleware/errorHandler";

// Import your routes
import authRoutes from "./routes/authRoutes";
import storeRoutes from "./routes/storeRoutes";
import productRoutes from "./routes/productRoutes";
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

// --- START: STATIC FILE SERVING CONFIGURATION ---

// Define the absolute path to your project root (DISCOUNT-CENTER/)
// This assumes your server directory (which contains src and uploads) is directly under the project root.
// If index.ts is in server/src, then path.resolve(__dirname, '../../') goes up two levels
// to reach the 'DISCOUNT-CENTER' directory.
const PROJECT_ROOT_DIR = path.resolve(__dirname, "../../");

// Serve static files from the 'uploads' directory
// This constructs the path: <PROJECT_ROOT_DIR>/server/uploads
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
// app.use('/api/items', itemRoutes); // Uncomment if you still need itemRoutes

// IMPORTANT: Error Handling Middleware
// These must be placed AFTER all your specific routes.

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
