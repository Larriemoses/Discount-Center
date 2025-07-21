// server/src/controllers/storeController.ts

import { Request, Response, NextFunction } from "express";
import asyncHandler from "../middleware/asyncHandler";
import Store, { IStoreDocument } from "../models/Store"; // <--- CHANGE HERE: Import IStoreDocument
import slugify from "slugify";
import path from "path";
import fs from "fs";
import ErrorResponse from "../utils/errorResponse";

// Extend Request type for Multer's file and auth middleware's user
interface CustomRequest extends Request {
  file?: Express.Multer.File; // Multer single file type
  user?: any; // From protect middleware (IAdminUser or similar type from authMiddleware)
}

// Helper function to delete files

const deleteFile = (filePath: string) => {
  const normalizedFilePath = filePath.startsWith("/uploads/")
    ? filePath.substring("/uploads/".length)
    : filePath;

  const fullPath = path.join(
    __dirname,
    "..",
    "..",
    "uploads",
    normalizedFilePath
  );

  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
      console.log(`Deleted file: ${fullPath}`);
    } catch (err) {
      console.error(`Error deleting file ${fullPath}:`, err);
    }
  } else {
    console.warn(
      `File not found for deletion (might be already deleted or path incorrect): ${fullPath}`
    );
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
    const stores = await Store.find({
      /* isActive: true */
    }).select("_id name slug logo");
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
    // Destructure all fields, including the new 'mainUrl'
    const { name, description, topDealHeadline, tagline, mainUrl } = req.body;
    let { slug } = req.body;

    if (!name || !description) {
      if (req.file) {
        deleteFile(req.file.filename);
      }
      return next(
        new ErrorResponse(
          "Please include a name and description for the store",
          400
        )
      );
    }

    if (!slug) {
      slug = slugify(name, { lower: true, strict: true });
    } else {
      slug = slugify(slug, { lower: true, strict: true });
    }

    const existingStore = await Store.findOne({ slug });
    if (existingStore) {
      if (req.file) {
        deleteFile(req.file.filename);
      }
      return next(
        new ErrorResponse(
          "Store with this slug already exists. Please choose a different name or slug.",
          400
        )
      );
    }

    const logoFilename = req.file ? req.file.filename : "no-photo.jpg";

    const newStore: IStoreDocument = new Store({
      // <--- CHANGE HERE: Use IStoreDocument
      name,
      description,
      slug,
      logo: logoFilename,
      topDealHeadline: topDealHeadline || undefined,
      tagline: tagline || undefined,
      mainUrl: mainUrl || undefined, // Assign new field
      user: (req as any).user?._id, // Assuming user ID is set by auth middleware
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
    // Destructure all fields, including the new 'mainUrl'
    const { name, description, topDealHeadline, tagline, mainUrl } = req.body;
    let { slug } = req.body;
    const storeId = req.params.id;

    let store = (await Store.findById(storeId)) as IStoreDocument | null; // <--- CHANGE HERE: Use IStoreDocument

    if (!store) {
      if (req.file) {
        deleteFile(req.file.filename);
      }
      return next(new ErrorResponse("Store not found", 404));
    }

    // Update fields conditionally
    store.name = name !== undefined ? name : store.name;
    store.description =
      description !== undefined ? description : store.description;

    store.topDealHeadline =
      topDealHeadline !== undefined ? topDealHeadline : store.topDealHeadline;
    store.tagline = tagline !== undefined ? tagline : store.tagline;
    store.mainUrl = mainUrl !== undefined ? mainUrl : store.mainUrl; // Update new field

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
            deleteFile(req.file.filename);
          }
          return next(
            new ErrorResponse(
              "Store with this slug already exists. Please choose a different slug.",
              400
            )
          );
        }
      }
      store.slug = newSlug;
    }

    // Handle logo update
    if (req.file) {
      if (store.logo && store.logo !== "no-photo.jpg") {
        deleteFile(store.logo);
      }
      store.logo = req.file.filename;
    }

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
    const store = (await Store.findById(storeId)) as IStoreDocument | null; // <--- CHANGE HERE: Use IStoreDocument

    if (!store) {
      return next(new ErrorResponse("Store not found", 404));
    }

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
