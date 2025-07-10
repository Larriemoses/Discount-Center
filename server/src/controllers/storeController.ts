// server/src/controllers/storeController.ts

import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Store, { IStore } from "../models/Store"; // Your Store model
import slugify from "slugify"; // You might need to install 'slugify' (npm install slugify)
import path from "path";
import fs from "fs";

// Extend Request type for Multer's file and auth middleware's user
interface CustomRequest extends Request {
  file?: Express.Multer.File; // Multer single file type
  user?: any; // From protect middleware (IAdminUser or similar type from authMiddleware)
}

// Helper function to delete files
const deleteFile = (filePath: string) => {
  if (filePath && filePath !== "no-photo.jpg") {
    const fullPath = path.join(__dirname, "..", "..", filePath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
        console.log(`Deleted file: ${fullPath}`);
      } catch (err) {
        console.error(`Error deleting file ${fullPath}:`, err);
      }
    }
  }
};

/**
 * @desc    Get all stores
 * @route   GET /api/stores
 * @access  Private (Admin only)
 */
export const getStores = asyncHandler(async (req: Request, res: Response) => {
  const stores = await Store.find({});
  res.status(200).json({
    success: true,
    count: stores.length,
    data: stores,
  });
});

/**
 * @desc    Get single store by ID
 * @route   GET /api/stores/:id
 * @access  Private (Admin only) - or Public if accessible by ID
 */
export const getStoreById = asyncHandler(
  async (req: Request, res: Response) => {
    const store = await Store.findById(req.params.id);

    if (store) {
      res.status(200).json(store);
    } else {
      res.status(404);
      throw new Error("Store not found");
    }
  }
);

/**
 * @desc    Create a new store
 * @route   POST /api/stores
 * @access  Private (Admin only)
 */
export const createStore = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { name, description } = req.body;
    let { slug } = req.body; // Allow user to provide, or generate

    // Basic validation
    if (!name || !description) {
      if (req.file) {
        // Delete uploaded file if validation fails
        deleteFile(`/uploads/${req.file.filename}`);
      }
      res.status(400);
      throw new Error("Please include a name and description for the store");
    }

    // Generate slug if not provided or empty
    if (!slug) {
      slug = slugify(name, { lower: true, strict: true });
    } else {
      // Ensure user-provided slug is also slugified
      slug = slugify(slug, { lower: true, strict: true });
    }

    // Check if slug already exists
    const existingStore = await Store.findOne({ slug });
    if (existingStore) {
      if (req.file) {
        deleteFile(`/uploads/${req.file.filename}`);
      }
      res.status(400);
      throw new Error(
        "Store with this slug already exists. Please choose a different name or slug."
      );
    }

    // Handle logo upload
    const logoPath = req.file
      ? `/uploads/${req.file.filename}`
      : "no-photo.jpg";

    const newStore: IStore = new Store({
      name,
      description,
      slug,
      logo: logoPath,
      // Add other default fields if necessary (e.g., createdAt, owner, etc.)
    });

    const createdStore = await newStore.save();
    res.status(201).json(createdStore);
  }
);

/**
 * @desc    Update a store
 * @route   PUT /api/stores/:id
 * @access  Private (Admin only)
 */
export const updateStore = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { name, description } = req.body;
    let { slug } = req.body; // Allow user to provide, or generate
    const storeId = req.params.id;

    let store = await Store.findById(storeId);

    if (!store) {
      if (req.file) {
        // Delete newly uploaded file if store not found
        deleteFile(`/uploads/${req.file.filename}`);
      }
      res.status(404);
      throw new Error("Store not found");
    }

    // Update fields
    store.name = name !== undefined ? name : store.name;
    store.description =
      description !== undefined ? description : store.description;

    // Handle slug update (only if changed and unique)
    if (slug !== undefined) {
      slug = slugify(slug, { lower: true, strict: true });
      if (slug !== store.slug) {
        // Only check if slug has actually changed
        const existingStoreWithSameSlug = await Store.findOne({
          slug,
          _id: { $ne: storeId },
        });
        if (existingStoreWithSameSlug) {
          if (req.file) {
            deleteFile(`/uploads/${req.file.filename}`);
          }
          res.status(400);
          throw new Error(
            "Store with this slug already exists. Please choose a different slug."
          );
        }
      }
      store.slug = slug;
    }

    // Handle logo update
    if (req.file) {
      // New logo uploaded, delete old one if it's not the default
      if (store.logo) {
        deleteFile(store.logo);
      }
      store.logo = `/uploads/${req.file.filename}`;
      if (store.logo) {
        deleteFile(store.logo);
      }
      store.logo = "no-photo.jpg";
      deleteFile(store.logo);
      store.logo = "no-photo.jpg";
    }
    // If no new file and no clearLogo flag, existing logo remains

    const updatedStore = await store.save();
    res.status(200).json(updatedStore);
  }
);

/**
 * @desc    Delete a store
 * @route   DELETE /api/stores/:id
 * @access  Private (Admin only)
 */
export const deleteStore = asyncHandler(async (req: Request, res: Response) => {
  const storeId = req.params.id;
  const store = await Store.findById(storeId);

  if (!store) {
    res.status(404);
    throw new Error("Store not found");
  }

  // Delete associated logo file from the file system
  if (store.logo) {
    deleteFile(store.logo);
  }

  // Consider also deleting products associated with this store,
  // or reassigning them. For simplicity, we'll just delete the store.
  // Example: await Product.deleteMany({ store: storeId }); // Be careful with this!

  await Store.deleteOne({ _id: storeId });
  res.status(200).json({ message: "Store removed successfully" });
});
