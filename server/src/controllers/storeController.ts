// src/controllers/storeController.ts
import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import Store, { IStore } from "../models/Store"; // Assuming you have a Store model
import path from "path"; // For file path manipulation
import fs from "fs"; // For file system operations

// Define your CustomRequest interface to include 'file' and 'user'
// 'user' is added by your protect middleware
interface CustomRequest extends Request {
  file?: Express.Multer.File;
  user?: any; // Consider creating a more specific interface for your user (e.g., { _id: string; role: string; })
}

// @desc    Create a new store
// @route   POST /api/stores
// @access  Private/Admin
const createStore = asyncHandler(async (req: CustomRequest, res: Response) => {
  const { name, description, slug } = req.body;

  // Check if file was uploaded (Multer adds 'file' to req)
  const logoPath = req.file ? `/uploads/${req.file.filename}` : undefined;

  // Basic validation (add more as needed)
  if (!name || !description) {
    if (logoPath && req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path); // Delete uploaded file if validation fails
    }
    res.status(400);
    throw new Error("Please enter all required fields for the store.");
  }

  // Check if store with same name or slug already exists
  const existingStore = await Store.findOne({ $or: [{ name }, { slug }] });
  if (existingStore) {
    if (logoPath && req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path); // Delete uploaded file
    }
    res.status(400);
    throw new Error("Store with this name or slug already exists.");
  }

  const newStore: IStore = new Store({
    name,
    description,
    slug: slug || name.toLowerCase().replace(/\s/g, "-"), // Generate slug if not provided
    logo: logoPath, // Save the path to the logo
    // Add other fields as per your Store model
  });

  const createdStore = await newStore.save();
  res.status(201).json(createdStore);
});

// @desc    Get all stores
// @route   GET /api/stores
// @access  Public
const getStores = asyncHandler(async (req: Request, res: Response) => {
  const stores = await Store.find({});
  res.status(200).json(stores);
});

// @desc    Get single store by ID
// @route   GET /api/stores/:id
// @access  Public
const getStoreById = asyncHandler(async (req: Request, res: Response) => {
  const store = await Store.findById(req.params.id);

  if (store) {
    res.status(200).json(store);
  } else {
    res.status(404);
    throw new Error("Store not found");
  }
});

// @desc    Update a store
// @route   PUT /api/stores/:id
// @access  Private/Admin
const updateStore = asyncHandler(async (req: CustomRequest, res: Response) => {
  const { name, description, slug } = req.body;
  const storeId = req.params.id;

  let store = await Store.findById(storeId);

  if (!store) {
    // If a new file was uploaded but store not found, delete the uploaded file
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(404);
    throw new Error("Store not found");
  }

  // Check for duplicate name/slug, excluding the current store being updated
  const existingStore = await Store.findOne({
    $or: [{ name }, { slug }],
    _id: { $ne: storeId }, // Exclude the current store's ID
  });

  if (existingStore) {
    // If a new file was uploaded but validation fails, delete it
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400);
    throw new Error("Store with this name or slug already exists.");
  }

  // Update fields
  store.name = name || store.name;
  store.description = description || store.description;
  store.slug = slug || store.slug;

  // Handle logo update
  if (req.file) {
    // A new logo was uploaded
    const newLogoPath = `/uploads/${req.file.filename}`;

    // If an old logo exists, delete it
    if (store.logo && fs.existsSync(path.join(__dirname, "..", store.logo))) {
      fs.unlinkSync(path.join(__dirname, "..", store.logo));
    }
    store.logo = newLogoPath; // Set new logo path
  } else if (req.body.logo === null) {
    // If frontend explicitly sends logo: null, it means remove the logo
    if (store.logo && fs.existsSync(path.join(__dirname, "..", store.logo))) {
      fs.unlinkSync(path.join(__dirname, "..", store.logo));
    }
    store.logo = undefined; // Remove logo field
  }
  // If req.file is not present and req.body.logo is not null/undefined, keep existing logo

  const updatedStore = await store.save();
  res.status(200).json(updatedStore);
});

// @desc    Delete a store
// @route   DELETE /api/stores/:id
// @access  Private/Admin
const deleteStore = asyncHandler(async (req: Request, res: Response) => {
  const storeId = req.params.id;
  const store = await Store.findById(storeId);

  if (!store) {
    res.status(404);
    throw new Error("Store not found");
  }

  // If the store has a logo, delete the associated file
  if (store.logo && fs.existsSync(path.join(__dirname, "..", store.logo))) {
    fs.unlinkSync(path.join(__dirname, "..", store.logo));
  }

  await Store.deleteOne({ _id: storeId }); // Use deleteOne with query
  res.status(200).json({ message: "Store removed successfully" });
});

export { createStore, getStores, getStoreById, updateStore, deleteStore };
