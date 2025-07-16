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
      store: newStoreId,
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

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      req.body.images = req.files.map(
        (file: Express.Multer.File) => `/uploads/${file.filename}`
      );
    }

    if (name !== undefined && name !== product.name) {
      product.name = name;
      product.slug = slugify(name, { lower: true, strict: true });
    } else if (name !== undefined) {
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

    product.successRate =
      successRate !== undefined ? successRate : product.successRate;
    product.totalUses = totalUses !== undefined ? totalUses : product.totalUses;
    product.todayUses = todayUses !== undefined ? todayUses : product.todayUses;
    product.likes = likes !== undefined ? likes : product.likes;
    product.dislikes = dislikes !== undefined ? dislikes : product.dislikes;

    if (newStoreId) {
      let currentStoreIdString: string;
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

      if (currentStoreIdString !== newStoreId.toString()) {
        const newStore = await Store.findById(newStoreId);
        if (!newStore) {
          res.status(404);
          throw new Error("New store not found.");
        }
        product.store = newStoreId;

        if (!(req.files && Array.isArray(req.files) && req.files.length > 0)) {
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

    // ***************************************************************
    // >>>>>>>>>> THIS IS THE ONLY CHANGE YOU NEED TO MAKE <<<<<<<<<<
    // ***************************************************************
    res.status(200).json({
      success: true,
      message: `${action} successful`,
      data: product, // <--- CHANGED from sending only a subset of fields
    });
    // ***************************************************************
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
