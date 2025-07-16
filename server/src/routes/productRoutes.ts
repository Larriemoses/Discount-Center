// server/src/routes/productRoutes.ts

import express from "express";
// Import necessary controllers and middleware
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByStore,
} from "../controllers/productController";
import { protect, authorize } from "../middleware/authMiddleware"; // Assuming these exist
import upload from "../middleware/uploadMiddleware"; // Assuming this exists for image uploads

const router = express.Router();

// --- Public routes ---
// Get top deals (publicly accessible)
router.get("/top-deals", getProducts); // Note: This route should ideally call a specific 'getTopDeals' controller if it's different from 'getProducts'

// Get products for a specific store (publicly accessible)
router.get("/stores/:storeId/products", getProductsByStore);

// --- Admin routes (require authentication and authorization) ---

// Get all products (for admin list)
// This route is now protected for admin users
router.get("/", protect, authorize(["admin"]), getProducts);

// Product interaction (like, dislike, copy, shop) - often public, but can be protected
router.post("/:id/interact", getProductById); // Assuming getProductById is meant to be interact, or create a new interact controller

// Routes for creating, updating, and deleting products
// Note: The POST for creating a product for a store is often nested under stores
router.post(
  "/stores/:storeId/products",
  protect,
  authorize(["admin"]),
  upload.array("images", 5), // 'images' is the field name, allow up to 5 images
  createProduct
);

// Routes for a single product by its ID (admin operations)
router
  .route("/:id")
  .get(getProductById) // Get a single product by its own ID (can be public or protected based on your design)
  .put(
    protect,
    authorize(["admin"]),
    upload.array("images", 5), // Allow updating product images
    updateProduct
  )
  .delete(protect, authorize(["admin"]), deleteProduct); // <--- THIS IS THE MISSING DELETE ROUTE

export default router;
