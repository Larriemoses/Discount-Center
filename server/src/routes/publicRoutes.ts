// server/src/routes/publicRoutes.ts
import express from "express";
import {
  submitStore,
  contactUs,
  getAllPublicProducts, // <-- Re-import the function
} from "../controllers/publicController"; // Corrected spelling

const router = express.Router();

router.post("/submit-store", submitStore);
router.post("/contact", contactUs);

// New public route to get all products (for prerendering and general product listing)
router.get("/products", getAllPublicProducts); // <-- Re-added this route

export default router;
