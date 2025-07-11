// server/src/controllers/storeController.ts

import { Request, Response, NextFunction } from "express"; // Import NextFunction
import asyncHandler from "../middleware/asyncHandler"; // Assuming this path and structure
import Store, { IStore } from "../models/Store";
import slugify from "slugify";
import path from "path";
import fs from "fs";
import ErrorResponse from "../utils/errorResponse"; // Import ErrorResponse

// Extend Request type for Multer's file and auth middleware's user
interface CustomRequest extends Request {
  file?: Express.Multer.File; // Multer single file type
  user?: any; // From protect middleware (IAdminUser or similar type from authMiddleware)
}

// Helper function to delete files
const deleteFile = (filePath: string) => {
  // Ensure filePath is a relative path like /uploads/filename.jpg
  // Construct the full absolute path from the project root
  if (filePath && filePath !== "no-photo.jpg") {
    // path.join(__dirname, '..', '..', '..', filePath); // Adjust based on your folder structure
    // If your uploads folder is at the root level (server/uploads), it would be:
    // path.join(process.cwd(), filePath)
    // Given previous context, it's likely __dirname, "..", "..", filePath (from controllers to root)
    const fullPath = path.join(__dirname, "..", "..", filePath); // This path assumes /server/src/controllers to /uploads
    // Example: D:\project\server\src\controllers -> D:\project\server\uploads
    // It should be relative to where your 'uploads' folder actually sits.
    // If 'uploads' is directly under 'server' folder, then `path.join(__dirname, '..', '..', filePath)` is correct from controller perspective.

    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
        console.log(`Deleted file: ${fullPath}`);
      } catch (err) {
        console.error(`Error deleting file ${fullPath}:`, err);
      }
    } else {
      console.warn(`File not found for deletion: ${fullPath}`);
    }
  }
};

/**
 * @desc    Get all stores (for admin list)
 * @route   GET /api/stores
 * @access  Private (Admin only)
 */
export const getStores = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const stores = await Store.find({});
    res.status(200).json({
      success: true,
      count: stores.length,
      data: stores,
    });
  }
);

/**
 * @desc    Get single store by ID (for admin edit)
 * @route   GET /api/stores/:id
 * @access  Private (Admin only)
 */
export const getStoreById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const store = await Store.findById(req.params.id);

    if (!store) {
      return next(new ErrorResponse("Store not found", 404));
    }
    res.status(200).json({ success: true, data: store });
  }
);

/**
 * @desc    Get single store by slug (for public store details page)
 * @route   GET /api/stores/by-slug/:slug
 * @access  Public
 */
export const getStoreBySlug = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const store = await Store.findOne({ slug: req.params.slug });

    if (!store) {
      return next(
        new ErrorResponse(`Store not found with slug: ${req.params.slug}`, 404)
      );
    }

    res.status(200).json({ success: true, data: store });
  }
);

/**
 * @desc    Get all public stores (for public facing pages like navbar dropdown)
 * @route   GET /api/stores/public
 * @access  Public
 */
export const getPublicStores = asyncHandler(
  async (req: Request, res: Response) => {
    // Only fetch active stores and select necessary fields for public display
    // Assuming 'isActive' field exists in IStore or you want all stores by default
    const stores = await Store.find({
      /* isActive: true */
    }).select("_id name slug logo"); // Removed isActive:true for now, add if you have that field
    res.status(200).json({ success: true, count: stores.length, data: stores });
  }
);

/**
 * @desc    Create a new store
 * @route   POST /api/stores
 * @access  Private (Admin only)
 */
export const createStore = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { name, description } = req.body;
    let { slug } = req.body;

    // Basic validation
    if (!name || !description) {
      if (req.file) {
        deleteFile(`/uploads/${req.file.filename}`);
      }
      return next(
        new ErrorResponse(
          "Please include a name and description for the store",
          400
        )
      );
    }

    // Generate slug if not provided or empty
    if (!slug) {
      slug = slugify(name, { lower: true, strict: true });
    } else {
      slug = slugify(slug, { lower: true, strict: true });
    }

    // Check if slug already exists
    const existingStore = await Store.findOne({ slug });
    if (existingStore) {
      if (req.file) {
        deleteFile(`/uploads/${req.file.filename}`);
      }
      return next(
        new ErrorResponse(
          "Store with this slug already exists. Please choose a different name or slug.",
          400
        )
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
      user: (req as any).user?._id, // Assuming user ID is available from auth middleware
      // Add other default fields like isActive: true, etc., if they exist in your model
    });

    const createdStore = await newStore.save();
    res.status(201).json({ success: true, data: createdStore });
  }
);

/**
 * @desc    Update a store
 * @route   PUT /api/stores/:id
 * @access  Private (Admin only)
 */
export const updateStore = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { name, description } = req.body;
    let { slug } = req.body;
    const storeId = req.params.id;

    let store = await Store.findById(storeId);

    if (!store) {
      if (req.file) {
        deleteFile(`/uploads/${req.file.filename}`);
      }
      return next(new ErrorResponse("Store not found", 404));
    }

    // Update fields
    store.name = name !== undefined ? name : store.name;
    store.description =
      description !== undefined ? description : store.description;

    // Handle slug update (only if changed and unique)
    if (slug !== undefined) {
      const newSlug = slugify(slug, { lower: true, strict: true });
      if (newSlug !== store.slug) {
        const existingStoreWithSameSlug = await Store.findOne({
          slug: newSlug,
          _id: { $ne: storeId },
        });
        if (existingStoreWithSameSlug) {
          if (req.file) {
            deleteFile(`/uploads/${req.file.filename}`);
          }
          return next(
            new ErrorResponse(
              "Store with this slug already exists. Please choose a different slug.",
              400
            )
          );
        }
      }
      store.slug = newSlug; // Assign the potentially updated slug
    }

    // Handle logo update
    if (req.file) {
      // New logo uploaded, delete old one if it's not 'no-photo.jpg'
      if (store.logo && store.logo !== "no-photo.jpg") {
        deleteFile(store.logo);
      }
      store.logo = `/uploads/${req.file.filename}`; // Assign the new logo path
    }
    // If no new file, and no explicit 'clearLogo' flag (which you don't have yet),
    // the existing 'store.logo' remains untouched.

    // Optional: If you want to allow clearing the logo explicitly
    // if (req.body.clearLogo === true && store.logo && store.logo !== 'no-photo.jpg') {
    //   deleteFile(store.logo);
    //   store.logo = 'no-photo.jpg';
    // }

    const updatedStore = await store.save();
    res.status(200).json({ success: true, data: updatedStore });
  }
);

/**
 * @desc    Delete a store
 * @route   DELETE /api/stores/:id
 * @access  Private (Admin only)
 */
export const deleteStore = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const storeId = req.params.id;
    const store = await Store.findById(storeId);

    if (!store) {
      return next(new ErrorResponse("Store not found", 404));
    }

    // Delete associated logo file from the file system if it's not the default
    if (store.logo && store.logo !== "no-photo.jpg") {
      deleteFile(store.logo);
    }

    // IMPORTANT: Consider deleting products associated with this store,
    // or reassigning them, depending on your application's logic.
    // Example: await Product.deleteMany({ store: storeId }); // Uncomment and ensure Product model is imported if needed!

    await Store.deleteOne({ _id: storeId });
    res
      .status(200)
      .json({ success: true, message: "Store removed successfully" });
  }
);
