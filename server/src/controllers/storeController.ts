// src/controllers/storeController.ts
import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import Store, { IStore } from "../models/Store";
import path from "path";
import fs from "fs";

interface CustomRequest extends Request {
  file?: Express.Multer.File;
  user?: any;
}

// @desc    Create a new store
// @route   POST /api/stores
// @access  Private/Admin
export const createStore = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { name, description, slug } = req.body; // Keep slug in body to allow manual override

    const logoPath = req.file ? `/uploads/${req.file.filename}` : undefined;

    // Basic validation (using model's validation where possible)
    if (!name || !description) {
      if (logoPath && req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(400);
      throw new Error(
        "Please enter all required fields (name, description) for the store."
      );
    }

    // Generate a potential slug for the existence check, consistent with model's pre-save hook
    const potentialSlug = (slug || name)
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    // Check if store with same name or potential slug already exists
    const existingStore = await Store.findOne({
      $or: [{ name: name }, { slug: potentialSlug }],
    });

    if (existingStore) {
      if (logoPath && req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(400);
      // Be more specific if possible, but generic "exists" is fine too
      throw new Error(
        `Store with name '${name}' or slug '${potentialSlug}' already exists.`
      );
    }

    const newStoreData: IStore = {
      name,
      description,
      // Provide slug if it came from body, otherwise model's pre-save hook will generate
      ...(slug && { slug: potentialSlug }), // Use the generated potentialSlug if slug was provided
      logo: logoPath || "no-photo.jpg", // Use default if no logo uploaded
    } as IStore; // Cast to IStore to satisfy type, as mongoose will handle generation for missing fields

    const newStore = new Store(newStoreData);
    const createdStore = await newStore.save(); // Model's pre-save hook will ensure slug is set if not provided

    res.status(201).json(createdStore);
  }
);

// @desc    Get all stores
// @route   GET /api/stores
// @access  Public
export const getStores = asyncHandler(async (req: Request, res: Response) => {
  const stores = await Store.find({});
  res.status(200).json(stores);
});

// @desc    Get single store by ID
// @route   GET /api/stores/:id
// @access  Public
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

// @desc    Update a store
// @route   PUT /api/stores/:id
// @access  Private/Admin
export const updateStore = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { name, description, slug } = req.body;
    const storeId = req.params.id;

    let store = await Store.findById(storeId);

    if (!store) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(404);
      throw new Error("Store not found");
    }

    // Prepare potential updates. Only update fields if they are explicitly provided.
    const updateFields: Partial<IStore> = {};
    if (name !== undefined) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;

    // Handle slug update:
    // If slug is provided in body, use it.
    // If name is provided (and changed), and slug is NOT provided, the model's pre-save hook will re-generate it.
    // If name is NOT provided, and slug is NOT provided, the existing slug will be kept.
    if (slug !== undefined) {
      updateFields.slug = slug
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");
    }

    // --- Check for duplicates BEFORE attempting to update ---
    let queryForDuplicate: { [key: string]: any }[] = [];
    if (updateFields.name) {
      queryForDuplicate.push({ name: updateFields.name });
    }
    if (updateFields.slug) {
      queryForDuplicate.push({ slug: updateFields.slug });
    }
    // If only description is updated, no name/slug conflict possible
    if (queryForDuplicate.length > 0) {
      const existingStore = await Store.findOne({
        $or: queryForDuplicate,
        _id: { $ne: storeId }, // Exclude the current store's ID
      });

      if (existingStore) {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        res.status(400);
        throw new Error("Store with this name or slug already exists.");
      }
    }
    // --- End duplicate check ---

    // Handle logo update
    if (req.file) {
      // A new logo was uploaded
      const newLogoPath = `/uploads/${req.file.filename}`;
      if (
        store.logo &&
        store.logo !== "no-photo.jpg" &&
        fs.existsSync(path.join(__dirname, "..", store.logo))
      ) {
        fs.unlinkSync(path.join(__dirname, "..", store.logo)); // Delete old custom logo
      }
      updateFields.logo = newLogoPath;
    } else if (req.body.logo === "null" || req.body.logo === "") {
      // Frontend explicitly sends logo: 'null' or empty string to remove it
      if (
        store.logo &&
        store.logo !== "no-photo.jpg" &&
        fs.existsSync(path.join(__dirname, "..", store.logo))
      ) {
        fs.unlinkSync(path.join(__dirname, "..", store.logo)); // Delete old custom logo
      }
      updateFields.logo = "no-photo.jpg"; // Set to default image
    }
    // If req.file is not present and req.body.logo is not 'null'/'', keep existing logo

    // Apply updates
    Object.assign(store, updateFields);

    const updatedStore = await store.save();
    res.status(200).json(updatedStore);
  }
);

// @desc    Delete a store
// @route   DELETE /api/stores/:id
// @access  Private/Admin
export const deleteStore = asyncHandler(async (req: Request, res: Response) => {
  const storeId = req.params.id;
  const store = await Store.findById(storeId);

  if (!store) {
    res.status(404);
    throw new Error("Store not found");
  }

  // If the store has a logo (and it's not the default), delete the associated file
  if (
    store.logo &&
    store.logo !== "no-photo.jpg" &&
    fs.existsSync(path.join(__dirname, "..", store.logo))
  ) {
    fs.unlinkSync(path.join(__dirname, "..", store.logo));
  }

  await Store.deleteOne({ _id: storeId });
  res.status(200).json({ message: "Store removed successfully" });
});
