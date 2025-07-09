// src/routes/productRoutes.ts

import express from "express";
import {
  createProduct,
  getProductsByStore,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";
import { protect, authorize } from "../middleware/authMiddleware";
import upload from "../middleware/uploadMiddleware"; // For image uploads

const router = express.Router();

// Public routes for getting products (might become filtered later)
router.get("/:id", getProductById); // Get a single product by its own ID

// Routes for products associated with a specific store
router
  .route("/stores/:storeId/products")
  .post(
    protect,
    authorize(["admin"]),
    upload.array("images", 5), // 'images' is the field name, allow up to 5 images
    createProduct
  )
  .get(getProductsByStore); // Public route to get all products for a specific store

// Admin-only routes for updating and deleting products by their ID
router
  .route("/:id")
  .put(
    protect,
    authorize(["admin"]),
    upload.array("images", 5), // Allow updating product images
    updateProduct
  )
  .delete(protect, authorize(["admin"]), deleteProduct);

export default router;
