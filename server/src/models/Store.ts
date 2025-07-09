// src/models/Store.ts
import mongoose, { Document, Schema } from "mongoose";

// Define the interface for a Store document
export interface IStore extends Document {
  name: string;
  description: string;
  slug: string; // Made required by default as it will always be generated
  logo?: string; // Path to the uploaded logo image
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
      unique: true,
      trim: true,
      lowercase: true, // Ensure slug is always lowercase
      required: true, // Slug will always be generated, so it's required
    },
    logo: {
      type: String,
      default: "no-photo.jpg", // Default image if no logo is uploaded
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Pre-save hook to generate slug if not provided or if name changes
// This hook ensures consistency if controller bypasses explicit slug generation,
// or if documents are created/updated without using the controller.
StoreSchema.pre<IStore>("save", function (next) {
  // Generate slug if it's new OR if the name has been modified AND slug isn't manually set
  // This helps ensure slugs are always up-to-date with the name if not manually overridden
  if (this.isNew || (this.isModified("name") && !this.isModified("slug"))) {
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w-]+/g, ""); // Remove all non-word chars except -
  }
  next();
});

// Export the Mongoose model
const Store = mongoose.model<IStore>("Store", StoreSchema);

export default Store;
