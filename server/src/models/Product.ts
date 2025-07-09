// src/models/Product.ts

import mongoose, { Schema, Document } from "mongoose";

// Define an interface for Product document
export interface IProduct extends Document {
  name: string; // e.g., "Oraimo Discount Code: Up To 49% Off + Extra 5% Code"
  description: string; // e.g., "Exclusive Oraimo Discount Code: Save Up to 58% Off + Get an Extra Free 5% Off Voucher"
  price: number; // Original price (if applicable, or base price for the offer)
  discountedPrice?: number; // Optional, if a discount is applied (e.g., final price after discount)
  category?: string; // e.g., 'Electronics', 'Clothing', 'Food', 'Coupon', 'Voucher'
  images: string[]; // Array of image URLs/paths (could be product images, or offer banner)
  store: mongoose.Types.ObjectId; // Reference to the Store model
  stock: number; // Remaining stock of the discounted item/offer
  isActive: boolean; // To easily enable/disable a product/offer

  // NEW FIELDS based on UI
  discountCode: string; // e.g., "7HJQ440D3JPK"
  shopNowUrl: string; // The URL for the "SHOP NOW" button
  successRate: number; // e.g., 100 (for 100% SUCCESS)
  totalUses: number; // e.g., 5387
  todayUses: number; // e.g., 5

  createdAt: Date;
  updatedAt: Date;
}

// Define the Product schema
const ProductSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountedPrice: {
      type: Number,
      min: 0,
    },
    category: {
      type: String,
      trim: true,
    },
    images: [
      {
        type: String, // Store paths to uploaded images
      },
    ],
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store", // Reference to the Store model
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // NEW SCHEMA FIELDS
    discountCode: {
      type: String,
      required: [true, "Please provide a discount code"],
      trim: true,
    },
    shopNowUrl: {
      type: String,
      required: [true, "Please provide a 'Shop Now' URL"],
      trim: true,
    },
    successRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0, // Default to 0% success
    },
    totalUses: {
      type: Number,
      min: 0,
      default: 0,
    },
    todayUses: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Create and export the Mongoose model
export default mongoose.model<IProduct>("Product", ProductSchema);
