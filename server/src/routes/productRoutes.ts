// server/src/routes/productRoutes.ts

import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByStore,
  interactProduct,
  getTopDeals,
  getTopProductsByUses,
  getTopProductsBySuccessRate,
  getLowStockProducts,
  getDailyUsageSummary,
  getOverallProductStats,
} from "../controllers/productController";
import { protect, authorize } from "../middleware/authMiddleware";
import upload from "../middleware/uploadMiddleware";

const router = express.Router();

// --- Public routes ---
router.get("/top-deals", getTopDeals);
router.get("/stores/:storeId/products", getProductsByStore);
router.post("/:id/interact", interactProduct);

// --- Admin Protected routes ---

// **IMPORTANT: Place specific analytics routes BEFORE the general "/:id" route**
router.get(
  "/analytics/top-by-uses",
  protect,
  authorize(["admin"]),
  getTopProductsByUses
);
router.get(
  "/analytics/top-by-success-rate",
  protect,
  authorize(["admin"]),
  getTopProductsBySuccessRate
);
router.get(
  "/analytics/low-stock",
  protect,
  authorize(["admin"]),
  getLowStockProducts
);
router.get(
  "/analytics/daily-summary",
  protect,
  authorize(["admin"]),
  getDailyUsageSummary
);
router.get(
  "/analytics/overall-stats",
  protect,
  authorize(["admin"]),
  getOverallProductStats
);

// Get all products (for admin list) - This should be /api/products, so it's fine here
router.get("/", protect, authorize(["admin"]), getProducts);

// Routes for creating a product for a store
router.post(
  "/stores/:storeId/products",
  protect,
  authorize(["admin"]),
  upload.array("images", 5),
  createProduct
);

// Routes for a single product by its ID (admin operations)
// This must come AFTER all other routes that might have a conflicting path,
// like /analytics/:anything, because ':id' is a wildcard.
router
  .route("/:id")
  .get(getProductById) // Get a single product by its own ID (can be public or protected based on your design)
  .put(protect, authorize(["admin"]), upload.array("images", 5), updateProduct)
  .delete(protect, authorize(["admin"]), deleteProduct);

export default router;
