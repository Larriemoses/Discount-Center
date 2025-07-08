import express, { Request, Response } from "express";
import { connectDB } from "./config/db";
import dotenv from "dotenv";
import itemRoutes from "./routes/itemRoutes";
import authRoutes from "./routes/authRoutes";
import storeRoutes from "./routes/storeRoutes"; // <--- Add this import!
import path from "path"; // <--- Add this for serving static files (images)

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json()); // For parsing application/json bodies
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded bodies (important for form data)

// Connect to MongoDB
connectDB();

// Serve static files from the 'uploads' directory
// This allows access to uploaded images via http://localhost:5000/uploads/image.png
app.use("/uploads", express.static(path.join(__dirname, "../uploads"))); // <--- Add this

// Basic root route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from the backend with MongoDB and Auth!");
});

// Use item routes for /api/items endpoint
app.use("/api/items", itemRoutes);

// Use authentication routes for /api/auth endpoint
app.use("/api/auth", authRoutes);

// Use store routes for /api/stores endpoint // <--- Add this!
app.use("/api/stores", storeRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
