// server/src/models/Product.ts

import { Document, Schema, model } from "mongoose";
import { IStore } from "./Store";

// Define the IProduct interface
export interface IProduct extends Document {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountedPrice?: number;
  category?: string;
  images: string[];
  store: Schema.Types.ObjectId | IStore;
  stock: number;
  isActive: boolean;
  discountCode: string;
  shopNowUrl: string;
  totalUses: number;
  todayUses: number;
  successRate: number;
  likes: number;
  dislikes: number;
  lastDailyReset: Date; // <--- ADDED: Field to track last daily reset
  createdAt: Date;
  updatedAt: Date;
}

// Define the Product Schema
const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Please add a product name"],
      trim: true,
      maxlength: [100, "Name can not be more than 100 characters"],
    },
    slug: String, // <--- ADDED: For SEO-friendly URLs
    description: {
      type: String,
      required: [true, "Please add a description"],
      maxlength: [500, "Description can not be more than 500 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please add a price"],
    },
    discountedPrice: Number,
    category: {
      type: String,
      enum: [
        "Electronics",
        "Fashion",
        "Home & Garden",
        "Books",
        "Sports",
        "Health & Beauty",
        "Automotive",
        "Food & Drink",
        "Other",
      ],
      default: "Other",
    },
    images: [String], // Array of image URLs
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store", // Reference to the Store model
      required: true,
    },
    stock: {
      type: Number,
      required: [true, "Please add stock quantity"],
      min: [0, "Stock cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    discountCode: {
      type: String,
      required: [true, "Please add a discount code"],
      maxlength: [50, "Discount code can not be more than 50 characters"],
    },
    shopNowUrl: {
      type: String,
      required: [true, "Please add a 'Shop Now' URL"],
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        "Please use a valid URL with HTTP or HTTPS",
      ],
    },
    totalUses: {
      type: Number,
      default: 0,
    },
    todayUses: {
      type: Number,
      default: 0,
    },
    successRate: {
      type: Number,
      default: 100, // Default to 100% successful if no feedback
      min: 0,
      max: 100,
    },
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    },
    lastDailyReset: {
      // <--- ADDED: Default to midnight of the current day
      type: Date,
      default: () => {
        const date = new Date();
        date.setHours(0, 0, 0, 0); // Set to midnight of current day
        return date;
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// Add a pre-save hook to generate the slug from the product name
// This hook ensures slug is always generated/updated on save
ProductSchema.pre<IProduct>("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    // Generate if name changes or if slug is missing
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphen
      .replace(/^-+|-+$/g, ""); // Trim hyphens from start/end
  }
  next();
});

const Product = model<IProduct>("Product", ProductSchema);

export default Product;
