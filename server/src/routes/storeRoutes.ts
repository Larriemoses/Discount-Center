// server/src/routes/storeRoutes.ts

import express from "express";
import {
  createStore,
  getStores,
  getStoreById,
  updateStore,
  deleteStore,
  getPublicStores, // <--- Import new public functions
  getStoreBySlug, // <--- Import new public functions
} from "../controllers/storeController";
import { protect, authorize } from "../middleware/authMiddleware";
import upload from "../middleware/uploadMiddleware";

const router = express.Router();

// Public routes for getting stores
router.get("/public", getPublicStores); // <--- NEW PUBLIC ROUTE for Navbar dropdown
router.get("/by-slug/:slug", getStoreBySlug); // <--- NEW PUBLIC ROUTE for individual store page

// Admin-only routes for managing stores
// All these routes will use `protect` to ensure a valid token,
// and `authorize(['admin'])` to ensure the user has the 'admin' role.
router.get("/", protect, authorize(["admin"]), getStores); // Admin list (already protected)
router.get("/:id", protect, authorize(["admin"]), getStoreById); // Admin edit (already protected)

router.post(
  "/",
  protect,
  authorize(["admin"]),
  upload.single("logo"),
  createStore
);

router.put(
  "/:id",
  protect,
  authorize(["admin"]),
  upload.single("logo"),
  updateStore
);

router.delete("/:id", protect, authorize(["admin"]), deleteStore);

export default router;
