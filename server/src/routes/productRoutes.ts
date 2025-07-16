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
  interactProduct, // Correctly named as per controller
  getTopDeals, // Correctly named as per controller
} from "../controllers/productController";
import { protect, authorize } from "../middleware/authMiddleware"; // Assuming these exist
import upload from "../middleware/uploadMiddleware"; // Assuming this exists for image uploads

const router = express.Router();

// --- Public routes ---
// Get top deals (publicly accessible)
router.get("/top-deals", getTopDeals);

// Get products for a specific store (publicly accessible)
// Note: Frontend should use /api/products/stores/:storeId/products
router.get("/stores/:storeId/products", getProductsByStore);

// Product interaction (like, dislike, copy, shop) - often public, but can be protected
router.post("/:id/interact", interactProduct);

// --- Admin routes (require authentication and authorization) ---

// Get all products (for admin list)
router.get("/", protect, authorize(["admin"]), getProducts);

// Routes for creating a product for a store
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
  .delete(protect, authorize(["admin"]), deleteProduct);

export default router;
