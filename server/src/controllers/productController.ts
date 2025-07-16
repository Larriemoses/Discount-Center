// server/src/controllers/productController.ts

import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import Product, { IProduct } from "../models/Product";
import Store from "../models/Store";
import path from "path";
import fs from "fs";
import mongoose from "mongoose"; // Import mongoose for ObjectId checks

// Helper function to delete files from the 'uploads' directory
const deleteFiles = (filePaths: string[]) => {
  filePaths.forEach((filePath) => {
    // Normalize the filePath: remove any leading '/uploads/' if present
    const normalizedFilePath = filePath.startsWith("/uploads/")
      ? filePath.substring("/uploads/".length)
      : filePath;

    // Construct the full absolute path to the actual uploads directory
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

// GET all products (for Admin List Page)
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  // Populate store details including name and logo
  const products = await Product.find({}).populate("store", "name logo");
  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// GET all products for a specific store
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
    res.status(200).json(products);
  }
);

// GET a single product by its ID
export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const product = (await Product.findById(req.params.id).populate(
      "store",
      "name logo"
    )) as IProduct | null;

    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  }
);

// CREATE a new product for a store
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
    if (store.logo) {
      productImages = [store.logo];
    } else if (store.images && store.images.length > 0) {
      productImages = store.images;
    } else {
      productImages = [];
    }

    const newProduct: IProduct = new Product({
      name,
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

// UPDATE a product
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

    product.name = name !== undefined ? name : product.name;
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

    // Handle store change and update product images accordingly
    if (newStoreId) {
      let currentStoreIdString: string;
      // Determine the string representation of the current store ID
      if (product.store instanceof mongoose.Types.ObjectId) {
        currentStoreIdString = product.store.toString();
      } else if (
        product.store &&
        typeof product.store === "object" &&
        "_id" in product.store
      ) {
        // If it's a populated document
        currentStoreIdString = (product.store as any)._id.toString();
      } else {
        // Fallback for unexpected cases, or if product.store is already a string
        currentStoreIdString = String(product.store);
      }

      if (currentStoreIdString !== newStoreId.toString()) {
        const newStore = await Store.findById(newStoreId);
        if (!newStore) {
          res.status(404);
          throw new Error("New store not found.");
        }
        product.store = newStoreId; // Update the store reference

        if (newStore.logo) {
          product.images = [newStore.logo];
        } else if (newStore.images && newStore.images.length > 0) {
          product.images = newStore.images;
        } else {
          product.images = [];
        }
      }
    }

    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  }
);

// DELETE a product
export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const productId = req.params.id;
    const product = (await Product.findById(productId)) as IProduct | null;

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    await Product.deleteOne({ _id: productId });
    res.status(200).json({ message: "Product removed successfully" });
  }
);

// Interact with a product (like, dislike, copy, shop)
export const interactProduct = asyncHandler(
  async (req: Request, res: Response) => {
    // Removed any type annotation here
    const { id } = req.params;
    const { action } = req.body;

    console.log(
      `Backend: Received interaction for product ID: ${id}, action: ${action}`
    );

    const product = (await Product.findById(id)) as IProduct | null;

    if (!product) {
      console.log(`Backend: Product with ID ${id} not found.`);
      res.status(404).json({ success: false, message: "Product not found" }); // Changed line
      return; // Added line to explicitly return void after sending response
    }

    console.log(
      `Backend: Product before update: Total Uses=${product.totalUses}, Today Uses=${product.todayUses}, Likes=${product.likes}, Dislikes=${product.dislikes}, Success Rate=${product.successRate}`
    );

    product.totalUses = (product.totalUses || 0) + 1;
    product.todayUses = (product.todayUses || 0) + 1;

    if (action === "like") {
      product.likes = (product.likes || 0) + 1;
    } else if (action === "dislike") {
      product.dislikes = (product.dislikes || 0) + 1;
    }

    const totalFeedback = (product.likes || 0) + (product.dislikes || 0);
    if (totalFeedback > 0) {
      product.successRate = Math.round(
        ((product.likes || 0) / totalFeedback) * 100
      );
    } else {
      product.successRate = 100;
    }

    await product.save();

    console.log(
      `Backend: Product after update and save: Total Uses=${product.totalUses}, Today Uses=${product.todayUses}, Likes=${product.likes}, Dislikes=${product.dislikes}, Success Rate=${product.successRate}`
    );

    res.status(200).json({
      success: true,
      message: `${action} successful`,
      data: {
        _id: product._id,
        totalUses: product.totalUses,
        todayUses: product.todayUses,
        successRate: product.successRate,
        likes: product.likes,
        dislikes: product.dislikes,
      },
    });
  }
);

// Get top deals controller
export const getTopDeals = asyncHandler(async (req: Request, res: Response) => {
  try {
    const topDeals = await Product.find({ isActive: true })
      .sort({ totalUses: -1, createdAt: -1 })
      .limit(10)
      .populate("store", "name logo slug topDealHeadline");

    res.status(200).json({
      success: true,
      data: topDeals,
      message: "Top deals fetched successfully",
    });
    // Do not return anything
  } catch (error: any) {
    console.error("Error fetching top deals:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
    // Do not return anything
  }
});
