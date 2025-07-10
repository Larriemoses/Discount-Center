// src/index.ts

import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./config/db"; // Your DB connection

// Import your middleware for error handling and 404s
import { notFound } from "./middleware/notFoundMiddleware"; // <--- NEW: Import notFound middleware
import { errorHandler } from "./middleware/errorHandler"; // <--- NEW: Import errorHandler middleware

// Import your routes
import authRoutes from "./routes/authRoutes";
import storeRoutes from "./routes/storeRoutes";
import productRoutes from "./routes/productRoutes";
import cors from "cors";

// import itemRoutes from './routes/itemRoutes'; // Uncomment if you still need itemRoutes

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173", // <--- This must EXACTLY match your frontend URL
    credentials: true, // This is important if you'll be using cookies, sessions, or sending auth tokens (like bearer tokens)
  })
);

// Middleware for parsing request bodies
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Uncomment if you need CORS for frontend communication
// app.use(cors());

// Connect to MongoDB
connectDB();

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Basic root route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from the backend with MongoDB and Auth!");
});

// Define your API routes
app.use("/api/auth", authRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/products", productRoutes);
// app.use('/api/items', itemRoutes); // Uncomment if you still need itemRoutes

// IMPORTANT: Error Handling Middleware
// 1. Not Found Middleware: Catches any requests that fall through all other routes
app.use(notFound); // <--- Add this middleware here

// 2. Centralized Error Handler: Processes errors caught by notFound or thrown by controllers
app.use(errorHandler); // <--- Add this middleware here, after all routes and notFound

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`JWT_SECRET from .env: ${process.env.JWT_SECRET}`); // Optional: for debugging
});
