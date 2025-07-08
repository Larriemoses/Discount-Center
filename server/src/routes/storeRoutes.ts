// src/routes/storeRoutes.ts

import express from "express";
import {
  createStore,
  getStores,
  getStoreById,
  updateStore, // Import new functions
  deleteStore, // Import new functions
} from "../controllers/storeController";
import { protect, authorize } from "../middleware/authMiddleware";
import upload from "../middleware/uploadMiddleware"; // Assuming this is your Multer setup

const router = express.Router();

// Public routes for getting stores
router.get("/", getStores);
router.get("/:id", getStoreById);

// Admin-only routes for managing stores
// All these routes will use `protect` to ensure a valid token,
// and `authorize(['admin'])` to ensure the user has the 'admin' role.
router.post(
  "/",
  protect,
  authorize(["admin"]),
  upload.single("logo"), // 'logo' is the field name for the file
  createStore
);

router.put(
  "/:id",
  protect,
  authorize(["admin"]),
  upload.single("logo"), // Allow logo update for PUT request
  updateStore
);

router.delete("/:id", protect, authorize(["admin"]), deleteStore);

export default router;
