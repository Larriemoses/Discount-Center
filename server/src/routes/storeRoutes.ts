// server/src/routes/storeRoutes.ts

import express from "express";
import {
  createStore,
  getStores,
  getStoreById,
  updateStore,
  deleteStore,
} from "../controllers/storeController";
import { protect, authorize } from "../middleware/authMiddleware";
import upload from "../middleware/uploadMiddleware"; // Assuming this is your Multer setup

const router = express.Router();

// Admin-only routes for fetching stores
// These routes are now protected to ensure only authenticated admins can access them.
router.get("/", protect, authorize(["admin"]), getStores); // <--- EDITED: Added protect and authorize
router.get("/:id", protect, authorize(["admin"]), getStoreById); // <--- EDITED: Added protect and authorize

// Admin-only routes for managing stores (create, update, delete)
// These routes already correctly use `protect` and `authorize`.
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
