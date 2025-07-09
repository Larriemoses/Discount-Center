// src/controllers/productController.ts

import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Product, { IProduct } from "../models/Product";
import Store from "../models/Store"; // To check if store exists
import path from "path";
import fs from "fs";

// Extend Request type for Multer's files and auth middleware's user
interface CustomRequest extends Request {
  files?:
    | { [fieldname: string]: Express.Multer.File[] }
    | Express.Multer.File[]; // Multer array files type
  user?: any; // From protect middleware
}

// Helper function to delete files from the 'uploads' directory
const deleteFiles = (filePaths: string[]) => {
  filePaths.forEach((filePath) => {
    const fullPath = path.join(__dirname, "..", filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  });
};

// @desc    Create a new product for a store
// @route   POST /api/products/stores/:storeId/products
// @access  Private/Admin
export const createProduct = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { storeId } = req.params;
    const {
      name,
      description,
      price,
      discountedPrice,
      category,
      stock,
      isActive,
      // NEW FIELDS
      discountCode,
      shopNowUrl,
      successRate,
      totalUses,
      todayUses,
    } = req.body;

    // Validate required fields (including new ones)
    if (
      !name ||
      !description ||
      !price ||
      !stock ||
      !discountCode ||
      !shopNowUrl
    ) {
      if (req.files) {
        const uploadedFilePaths = (req.files as Express.Multer.File[]).map(
          (file) => `/uploads/${file.filename}`
        );
        deleteFiles(uploadedFilePaths); // Delete uploaded files if validation fails
      }
      res.status(400);
      throw new Error(
        "Please provide name, description, price, stock, discountCode, and shopNowUrl for the product."
      );
    }

    // Check if the store exists
    const storeExists = await Store.findById(storeId);
    if (!storeExists) {
      if (req.files) {
        const uploadedFilePaths = (req.files as Express.Multer.File[]).map(
          (file) => `/uploads/${file.filename}`
        );
        deleteFiles(uploadedFilePaths);
      }
      res.status(404);
      throw new Error("Store not found.");
    }

    // Handle product images
    const productImages: string[] = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      req.files.forEach((file) => {
        productImages.push(`/uploads/${file.filename}`);
      });
    }

    const newProduct: IProduct = new Product({
      name,
      description,
      price,
      discountedPrice: discountedPrice || undefined,
      category: category || undefined,
      images: productImages,
      store: storeId, // Link product to the store
      stock,
      isActive: isActive !== undefined ? isActive : true,
      // NEW FIELDS
      discountCode,
      shopNowUrl,
      successRate: successRate !== undefined ? successRate : 0, // Use provided or default
      totalUses: totalUses !== undefined ? totalUses : 0, // Use provided or default
      todayUses: todayUses !== undefined ? todayUses : 0, // Use provided or default
    });

    const createdProduct = await newProduct.save();
    res.status(201).json(createdProduct);
  }
);

// @desc    Get all products for a specific store
// @route   GET /api/products/stores/:storeId/products
// @access  Public
export const getProductsByStore = asyncHandler(
  async (req: Request, res: Response) => {
    const { storeId } = req.params;

    // Populate the 'store' field to get store details like logo, name, etc.
    // This is crucial for your UI to display the store logo and name next to the product
    const products = await Product.find({ store: storeId }).populate("store");

    if (!products || products.length === 0) {
      // Optionally check if store exists before returning empty
      const storeExists = await Store.findById(storeId);
      if (!storeExists) {
        res.status(404);
        throw new Error("Store not found.");
      }
      res.status(200).json([]); // Return empty array if no products found but store exists
    } else {
      res.status(200).json(products);
    }
  }
);

// @desc    Get a single product by its ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    // Populate the 'store' field when getting a single product too
    const product = await Product.findById(req.params.id).populate("store");

    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  }
);

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const {
      name,
      description,
      price,
      discountedPrice,
      category,
      stock,
      isActive,
      // NEW FIELDS
      discountCode,
      shopNowUrl,
      successRate,
      totalUses,
      todayUses,
    } = req.body;
    const productId = req.params.id;

    let product = await Product.findById(productId);

    if (!product) {
      if (req.files) {
        // Delete newly uploaded files if product doesn't exist
        const uploadedFilePaths = (req.files as Express.Multer.File[]).map(
          (file) => `/uploads/${file.filename}`
        );
        deleteFiles(uploadedFilePaths);
      }
      res.status(404);
      throw new Error("Product not found");
    }

    // Update product fields (only if provided in the request body)
    product.name = name !== undefined ? name : product.name;
    product.description =
      description !== undefined ? description : product.description;
    product.price = price !== undefined ? price : product.price;
    product.discountedPrice =
      discountedPrice !== undefined ? discountedPrice : product.discountedPrice;
    product.category = category !== undefined ? category : product.category;
    product.stock = stock !== undefined ? stock : product.stock;
    product.isActive = isActive !== undefined ? isActive : product.isActive;
    // NEW FIELDS
    product.discountCode =
      discountCode !== undefined ? discountCode : product.discountCode;
    product.shopNowUrl =
      shopNowUrl !== undefined ? shopNowUrl : product.shopNowUrl;
    product.successRate =
      successRate !== undefined ? successRate : product.successRate;
    product.totalUses = totalUses !== undefined ? totalUses : product.totalUses;
    product.todayUses = todayUses !== undefined ? todayUses : product.todayUses;

    // Handle product images update
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      // New images uploaded, delete old ones
      deleteFiles(product.images); // Delete old images from file system
      product.images = req.files.map((file) => `/uploads/${file.filename}`); // Set new images
    } else if (req.body.clearImages === "true") {
      // Frontend can signal to clear all images
      deleteFiles(product.images);
      product.images = [];
    }
    // If no new files and no clearImages flag, existing images remain

    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  }
);

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    // Delete associated image files from the file system
    deleteFiles(product.images);

    await Product.deleteOne({ _id: productId });
    res.status(200).json({ message: "Product removed successfully" });
  }
);
