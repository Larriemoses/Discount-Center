// server/src/models/Product.ts

import { Document, Schema, model } from "mongoose";
import { IStore } from "./Store"; // Assuming IStore is correctly imported and defined

// Define the IProduct interface
export interface IProduct extends Document {
  _id: string;
  name: string;
  slug: string;
  description?: string; // Made optional
  price?: number; // Made optional
  discountedPrice?: number;
  category?: string; // Already optional due to default, but explicit `?` for TypeScript clarity
  images: string[];
  store: Schema.Types.ObjectId | IStore;
  stock?: number; // Made optional
  isActive: boolean;
  discountCode: string;
  shopNowUrl: string;
  totalUses: number;
  todayUses: number;
  successRate: number;
  likes: number;
  dislikes: number;
  lastDailyReset: Date;
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
      unique: true, // Assuming product names should be unique for slug generation
    },
    slug: String,
    description: {
      type: String,
      // Removed `required: true`
      trim: true,
      maxlength: [500, "Description can not be more than 500 characters"],
      default: "No description provided.", // Added a default value
    },
    price: {
      type: Number,
      // Removed `required: true`
      default: 0, // Added a default value
      min: [0, "Price cannot be negative"],
    },
    discountedPrice: Number, // Already optional
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
        // CONSIDER ADDING A 'No Category' or 'Uncategorized' if 'Other' doesn't fit this
        // For now, 'Other' is your default.
      ],
      default: "Other", // If frontend sends nothing, this will be used
    },
    images: {
      type: [String],
      default: [], // Ensure it defaults to an empty array if no images are provided
    },
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true, // This remains required as it's selected in the form
    },
    stock: {
      type: Number,
      // Removed `required: true`
      default: 0, // Added a default value
      min: [0, "Stock cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true, // Already has a default
    },
    discountCode: {
      type: String,
      required: [true, "Please add a discount code"], // This remains required
      maxlength: [50, "Discount code can not be more than 50 characters"],
    },
    shopNowUrl: {
      type: String,
      required: [true, "Please add a 'Shop Now' URL"], // This remains required
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
      default: 100,
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
      type: Date,
      default: () => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
      },
    },
  },
  {
    timestamps: true,
  }
);

// Add a pre-save hook to generate the slug from the product name
ProductSchema.pre<IProduct>("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  next();
});

const Product = model<IProduct>("Product", ProductSchema);

export default Product;
