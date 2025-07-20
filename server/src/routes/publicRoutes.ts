// server/src/routes/publicRoutes.ts
import express from "express";
// Change the import path from "../controllers/productController"
// to "../controllers/publicController"
import { submitStore, contactUs } from "../controllers/publicControler"; // <-- CORRECTED LINE

const router = express.Router();

router.post("/submit-store", submitStore);
router.post("/contact", contactUs);

export default router;
