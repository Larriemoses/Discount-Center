// src/models/Store.ts
import mongoose, { Document, Schema } from "mongoose";

// Define the interface for a Store document
export interface IStore extends Document {
  name: string;
  description: string;
  slug?: string; // Optional, can be generated from name
  logo?: string; // Path to the uploaded logo image
  // Add any other fields your store might have, e.g.,
  // clicks?: number;
  // isActive?: boolean;
  // category?: mongoose.Types.ObjectId; // If linking to a category model
  createdAt: Date;
  updatedAt: Date;
}

// Define the Store schema
const StoreSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a store name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name can not be more than 50 characters"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
      maxlength: [500, "Description can not be more than 500 characters"],
    },
    slug: {
      type: String,
      unique: true, // Slugs should also be unique
    },
    logo: {
      type: String,
      default: "no-photo.jpg", // Default image if no logo is uploaded
    },
    // Add other fields here as needed
    // clicks: {
    //   type: Number,
    //   default: 0,
    // },
    // isActive: {
    //   type: Boolean,
    //   default: true,
    // },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Pre-save hook to generate slug if not provided
StoreSchema.pre<IStore>("save", function (next) {
  if (!this.isModified("name") && this.slug) {
    // Only generate if name changes and slug isn't already set
    return next();
  }
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/\s/g, "-")
      .replace(/[^\w-]+/g, "");
  }
  next();
});

// Export the Mongoose model
const Store = mongoose.model<IStore>("Store", StoreSchema);

export default Store;
