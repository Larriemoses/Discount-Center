// server/src/controllers/productController.ts

import { Request, Response, NextFunction } from "express"; // NextFunction added for full signature
import asyncHandler from "express-async-handler";
import Product, { IProduct } from "../models/Product";
import Store from "../models/Store"; // To check if store exists
import path from "path";
import fs from "fs";
// Assuming you have AdminUser if needed for user context (from authMiddleware)
// import { IAdminUser } from "../models/AdminUser";

// Extend Request type for Multer's files and auth middleware's user
interface CustomRequest extends Request {
  files?:
    | { [fieldname: string]: Express.Multer.File[] }
    | Express.Multer.File[]; // Multer array files type
  user?: any; // From protect middleware (IAdminUser or similar type from authMiddleware)
}

// Helper function to delete files from the 'uploads' directory
const deleteFiles = (filePaths: string[]) => {
  filePaths.forEach((filePath) => {
    // Ensure the path is correct relative to the server root 'uploads' directory
    const fullPath = path.join(__dirname, "..", "..", filePath); // Adjust path to reach /uploads from /src/controllers
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
        console.log(`Deleted file: ${fullPath}`);
      } catch (err) {
        console.error(`Error deleting file ${fullPath}:`, err);
      }
    }
  });
};

/**
 * @desc    Get all products (for Admin List Page)
 * @route   GET /api/products
 * @access  Private (Admin only)
 */
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  console.log("getProducts controller function invoked."); // <--- ADD THIS LOG

  // Use populate('store', 'name logo') to get store name and logo for display
  const products = await Product.find({}).populate("store", "name logo");

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc    Get all products for a specific store (Public or Admin filtered)
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

    // Populate the 'store' field to get store details like logo, name, etc.
    const products = await Product.find({ store: storeId }).populate("store");

    res.status(200).json(products); // Return empty array if no products found for store
  }
);

// @desc    Get a single product by its ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id).populate("store");

    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  }
);

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
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
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
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
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
      successRate: successRate !== undefined ? successRate : 0,
      totalUses: totalUses !== undefined ? totalUses : 0,
      todayUses: todayUses !== undefined ? todayUses : 0,
    });

    const createdProduct = await newProduct.save();
    res.status(201).json(createdProduct);
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
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
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
      // Frontend can signal to clear all images (e.g., if user removes them)
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

    await Product.deleteOne({ _id: productId }); // Use deleteOne on the model
    res.status(200).json({ message: "Product removed successfully" });
  }
);
