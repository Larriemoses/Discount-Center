// server/src/routes/productRoutes.ts

import express from "express";
import {
  getProducts, // <--- Make sure this is imported
  createProduct,
  getProductsByStore,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";
import { protect, authorize } from "../middleware/authMiddleware";
import upload from "../middleware/uploadMiddleware"; // For image uploads

const router = express.Router();

console.log("Product routes file loaded."); // <--- ADD THIS LOG

// Route to get ALL products (typically for admin overview)
// This is protected as only admins should fetch all products this way
// Add a log directly within the route handler before calling getProducts
router.route("/").get(protect, authorize(["admin"]), (req, res, next) => {
  console.log("GET /api/products route handler entered."); // <--- ADD THIS LOG
  getProducts(req, res, next); // Ensure getProducts is called with req, res, next
});

// Public route for getting a single product by its own ID
router.get("/:id", getProductById);

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
