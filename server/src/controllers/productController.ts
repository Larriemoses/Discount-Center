// server/src/controllers/productController.ts

import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import Product, { IProduct } from "../models/Product";
import Store from "../models/Store";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import slugify from "slugify";

// Helper function to delete files from the 'uploads' directory
const deleteFiles = (filePaths: string[]) => {
  filePaths.forEach((filePath) => {
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

    // Using fs.promises.unlink for async deletion, better for non-blocking operations
    // Or keep fs.unlinkSync if you prefer synchronous for simple cases, but ensure error handling.
    // The current fs.existsSync + fs.unlinkSync is fine for preventing the 'not found' error.
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
        console.log(`Deleted file: ${fullPath}`);
      } catch (err: any) {
        // Type 'any' for err in catch block for broader error handling
        // Specifically catch ENOENT (file not found) to log as warning, others as error
        if (err.code === "ENOENT") {
          console.warn(
            `File not found for deletion during unlink (might be already deleted or path incorrect): ${fullPath}`
          );
        } else {
          console.error(`Error deleting file ${fullPath}:`, err);
        }
      }
    } else {
      console.warn(
        `File not found for deletion (already deleted or path incorrect in record): ${fullPath}`
      );
    }
  });
};

// Helper to get today's date at midnight for comparison
const getTodayMidnight = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Set to midnight of current day
  return now;
};

// Function to apply the daily reset logic to a product
const applyDailyReset = async (product: IProduct) => {
  const today = getTodayMidnight();
  // Use .toDateString() for date-only comparison, ignoring time
  if (
    !product.lastDailyReset ||
    product.lastDailyReset.toDateString() !== today.toDateString()
  ) {
    console.log(
      `Resetting todayUses for product: ${product.name} (ID: ${product._id})`
    );
    product.todayUses = 0;
    product.lastDailyReset = today; // Update the reset date
    await product.save(); // Save the changes to the database
  }
};

// @desc    Get all products (for Admin List Page)
// @route   GET /api/products
// @access  Public / Admin
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const products = await Product.find({}).populate("store", "name logo");

  const updatedProducts = [];
  for (let product of products) {
    await applyDailyReset(product); // Use the helper
    updatedProducts.push(product);
  }

  res.status(200).json({
    success: true,
    count: updatedProducts.length,
    data: updatedProducts,
  });
});

// @desc    Get all products for a specific store
// @route   GET /api/products/stores/:storeId/products
// @access  Public
export const getProductsByStore = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params;
    const storeExists = await Store.findById(storeId);
    if (!storeExists) {
      res.status(404);
      throw new Error("Store not found.");
    }
    const products = await Product.find({ store: storeId }).populate(
      "store",
      "name logo"
    );

    const updatedProducts = [];
    for (let product of products) {
      await applyDailyReset(product); // Use the helper
      updatedProducts.push(product);
    }

    res.status(200).json(updatedProducts);
  }
);

// @desc    Get a single product by its ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const product = (await Product.findById(req.params.id).populate(
      "store",
      "name logo"
    )) as IProduct | null;

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    await applyDailyReset(product); // Use the helper

    res.status(200).json(product);
  }
);

// @desc    Create new product for a store
// @route   POST /api/stores/:storeId/products
// @access  Private (Admin)
export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params;
    const {
      name,
      description,
      price,
      discountedPrice,
      category,
      stock,
      isActive,
      discountCode,
      shopNowUrl,
    } = req.body;

    if (
      !name ||
      !description ||
      !price ||
      !stock ||
      !discountCode ||
      !shopNowUrl
    ) {
      res.status(400);
      throw new Error(
        "Please provide name, description, price, stock, discountCode, and shopNowUrl for the product."
      );
    }

    const store = await Store.findById(storeId);
    if (!store) {
      res.status(404);
      throw new Error("Store not found.");
    }

    let productImages: string[] = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      productImages = req.files.map(
        (file: Express.Multer.File) => `/uploads/${file.filename}`
      );
    } else if (store.logo) {
      productImages = [store.logo];
    } else if (store.images && store.images.length > 0) {
      productImages = store.images;
    }

    const newProduct: IProduct = new Product({
      name,
      slug: slugify(name, { lower: true, strict: true }),
      description,
      price,
      discountedPrice: discountedPrice || undefined,
      category: category || undefined,
      images: productImages,
      store: storeId,
      stock,
      isActive: isActive !== undefined ? isActive : true,
      discountCode,
      shopNowUrl,
    });

    const createdProduct = await newProduct.save();
    res.status(201).json(createdProduct);
  }
);

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Admin)
export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      name,
      description,
      price,
      discountedPrice,
      category,
      stock,
      isActive,
      discountCode,
      shopNowUrl,
      store: newStoreId, // Renamed to newStoreId to avoid conflict with product.store
      successRate,
      totalUses,
      todayUses,
      likes,
      dislikes,
    } = req.body;
    const productId = req.params.id;

    let product = (await Product.findById(productId).exec()) as IProduct | null;

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    // Store old images for deletion if new ones are uploaded or store changes
    const oldImages = product.images ? [...product.images] : [];
    let newImages: string[] | undefined; // To hold paths of new images if uploaded

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      // New images were uploaded: prepare new paths
      newImages = req.files.map(
        (file: Express.Multer.File) => `/uploads/${file.filename}`
      );
      // Delete old images immediately after new ones are confirmed
      if (oldImages.length > 0) {
        deleteFiles(oldImages);
      }
    }

    // Update basic product fields
    if (name !== undefined && name !== product.name) {
      product.name = name;
      product.slug = slugify(name, { lower: true, strict: true });
    } else if (name !== undefined) {
      // If name is provided but unchanged, still set it to ensure consistency
      product.name = name;
    }

    product.description =
      description !== undefined ? description : product.description;
    product.price = price !== undefined ? price : product.price;
    product.discountedPrice =
      discountedPrice !== undefined ? discountedPrice : product.discountedPrice;
    product.category = category !== undefined ? category : product.category;
    product.stock = stock !== undefined ? stock : product.stock;
    product.isActive = isActive !== undefined ? isActive : product.isActive;
    product.discountCode =
      discountCode !== undefined ? discountCode : product.discountCode;
    product.shopNowUrl =
      shopNowUrl !== undefined ? shopNowUrl : product.shopNowUrl;

    // Update usage/feedback stats directly if provided (typically from admin edits)
    product.successRate =
      successRate !== undefined ? successRate : product.successRate;
    product.totalUses = totalUses !== undefined ? totalUses : product.totalUses;
    product.todayUses = todayUses !== undefined ? todayUses : product.todayUses;
    product.likes = likes !== undefined ? likes : product.likes;
    product.dislikes = dislikes !== undefined ? dislikes : product.dislikes;

    // Handle store change and associated image updates
    if (newStoreId) {
      let currentStoreIdString: string;
      // Handle different ways product.store might be populated
      if (product.store instanceof mongoose.Types.ObjectId) {
        currentStoreIdString = product.store.toString();
      } else if (
        product.store &&
        typeof product.store === "object" &&
        "_id" in product.store
      ) {
        currentStoreIdString = (product.store as any)._id.toString();
      } else {
        currentStoreIdString = String(product.store);
      }

      // Check if the store is actually changing
      if (currentStoreIdString !== newStoreId.toString()) {
        const newStore = await Store.findById(newStoreId);
        if (!newStore) {
          res.status(404);
          throw new Error("New store not found.");
        }
        product.store = newStoreId; // Update the store reference

        // If no new files were uploaded with THIS request, then update product images based on new store
        if (!newImages) {
          // Check if newImages was set by req.files
          // Also, ensure old images associated with the *previous* store are deleted,
          // but only if they are not the *same* as the new store's logo/images.
          // For simplicity, if store changes and no new product image is uploaded,
          // we assume the old product images might need to be cleaned up
          // if they were specifically product-level images not inherited from store.
          // This logic can get complex; assuming for now that oldImages were product-specific.

          // Delete old product images if they are NOT store logos
          // This is a simplified deletion. A more robust solution might track image origin.
          if (oldImages.length > 0) {
            // Filter out any old images that are actually the new store's logo or images
            // to avoid deleting them if they were previously associated with this product
            // but are now changing to be the new store's.
            const imagesToPossiblyKeep = [
              newStore.logo,
              ...(newStore.images || []),
            ].filter(Boolean);
            const imagesToDelete = oldImages.filter(
              (oldImg) => !imagesToPossiblyKeep.includes(oldImg)
            );
            if (imagesToDelete.length > 0) {
              deleteFiles(imagesToDelete);
            }
          }

          if (newStore.logo) {
            product.images = [newStore.logo];
          } else if (newStore.images && newStore.images.length > 0) {
            product.images = newStore.images;
          } else {
            product.images = [];
          }
        }
      }
    }

    // Finally, assign new images if they were uploaded
    if (newImages) {
      product.images = newImages;
    }

    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  }
);

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const productId = req.params.id;
    const product = (await Product.findById(productId)) as IProduct | null;

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    if (product.images && product.images.length > 0) {
      // IMPORTANT: Only delete product-specific images.
      // If product images are derived from the store's logo/images,
      // you *must not* delete the store's original files here,
      // as other products or the store itself might still use them.
      // For now, assuming product.images are standalone for this product.
      deleteFiles(product.images);
    }

    await Product.deleteOne({ _id: productId });
    res.status(200).json({ message: "Product removed successfully" });
  }
);

// @desc    Handle product interaction (copy, shop, like, dislike)
// @route   POST /api/products/:id/interact
// @access  Public
export const interactProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { action } = req.body; // 'copy', 'shop', 'like', 'dislike'

    console.log(
      `Backend: Received interaction for product ID: ${id}, action: ${action}`
    );

    const product = (await Product.findById(id)) as IProduct | null;

    if (!product) {
      console.log(`Backend: Product with ID ${id} not found.`);
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    console.log(
      `Backend: Product before update: Total Uses=${product.totalUses}, Today Uses=${product.todayUses}, Likes=${product.likes}, Dislikes=${product.dislikes}, Success Rate=${product.successRate}, Last Reset=${product.lastDailyReset}`
    );

    await applyDailyReset(product);

    switch (action) {
      case "copy":
      case "shop":
        product.totalUses = (product.totalUses || 0) + 1;
        product.todayUses = (product.todayUses || 0) + 1;
        break;
      case "like":
        product.likes = (product.likes || 0) + 1;
        break;
      case "dislike":
        product.dislikes = (product.dislikes || 0) + 1;
        break;
      default:
        res
          .status(400)
          .json({ success: false, message: "Invalid interaction action" });
        return;
    }

    const totalFeedback = (product.likes || 0) + (product.dislikes || 0);
    if (totalFeedback > 0) {
      product.successRate = Math.round(
        ((product.likes || 0) / totalFeedback) * 100
      );
    } else {
      product.successRate = 100;
    }

    // Save the updated product
    await product.save();

    console.log(
      `Backend: Product after update and save: Total Uses=${product.totalUses}, Today Uses=${product.todayUses}, Likes=${product.likes}, Dislikes=${product.dislikes}, Success Rate=${product.successRate}, Last Reset=${product.lastDailyReset}`
    );

    res.status(200).json({
      success: true,
      message: `${action} successful`,
      data: product,
    });
  }
);

// @desc    Get top deals controller
// @route   GET /api/products/top-deals
// @access  Public
export const getTopDeals = asyncHandler(async (req: Request, res: Response) => {
  try {
    const topDeals = await Product.find({ isActive: true })
      .sort({ totalUses: -1, createdAt: -1 })
      .limit(10)
      .populate("store", "name logo slug topDealHeadline");

    const updatedTopDeals = [];
    for (let product of topDeals) {
      await applyDailyReset(product);
      updatedTopDeals.push(product);
    }

    res.status(200).json({
      success: true,
      data: updatedTopDeals,
      message: "Top deals fetched successfully",
    });
  } catch (error: any) {
    console.error("Error fetching top deals:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});
