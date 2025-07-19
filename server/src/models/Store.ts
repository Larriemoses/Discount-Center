// src/models/Store.ts
import mongoose, { Document, Schema } from "mongoose";

// Define the interface for a Store document
export interface IStore extends Document {
  name: string;
  description: string;
  slug: string;
  logo?: string;
  topDealHeadline?: string; // This will be your 'Subtitle'
  tagline?: string; // <--- NEW: This will be your 'Sub-subtitle'
  mainUrl?: string; // It's correctly defined in the interface
  images?: string[];
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
      lowercase: true,
      required: true,
    },
    logo: {
      type: String,
      default: "no-photo.jpg",
    },
    topDealHeadline: {
      type: String,
      trim: true,
      maxlength: [150, "Top deal headline can not be more than 150 characters"],
    },
    tagline: {
      type: String,
      trim: true,
      maxlength: [150, "Tagline can not be more than 150 characters"],
    },
    // **********************************************************
    // >>>>>>>>>> ADD THE mainUrl FIELD HERE <<<<<<<<<<
    // **********************************************************
    mainUrl: {
      type: String,
      trim: true,
      // You might want to add a regex match for URL validation, like:
      // match: [
      //   /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      //   'Please use a valid URL with HTTP or HTTPS'
      // ],
      // You can also make it required if every store must have one:
      // required: [true, "Please add a main store URL"],
    },
    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate slug if not provided or if name changes
StoreSchema.pre<IStore>("save", function (next) {
  if (this.isNew || (this.isModified("name") && !this.isModified("slug"))) {
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
  }
  next();
});

const Store = mongoose.model<IStore>("Store", StoreSchema);

export default Store;
