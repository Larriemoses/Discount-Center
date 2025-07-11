// src/index.ts

import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./config/db"; // Your DB connection
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
    origin: "http://localhost:5173", // <--- This must EXACTLY match your frontend URL (e.g., Vite dev server)
    credentials: true, // This is important for cookies, sessions, or sending auth tokens (like bearer tokens)
  })
);

// Middleware for parsing request bodies
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Connect to MongoDB
connectDB();

// Serve static files from the 'uploads' directory
// Assumes 'uploads' folder is a sibling to 'src' within the 'server' directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

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
  // console.log(`JWT_SECRET from .env: ${process.env.JWT_SECRET}`); // Optional: for debugging, remove in production
});
