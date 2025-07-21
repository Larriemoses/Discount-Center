// server/src/models/Product.ts
import { IProduct } from "@common/interfaces/IProduct"; // Use the base product interface
import mongoose, { Document, Schema, model, Model } from "mongoose";

// Define the Mongoose Document interface.
// This extends your base data shape with Mongoose Document properties.
export interface IProductDocument extends IProduct, Document {
  // Add any custom instance methods you define on the schema here if needed
}

// Define the Mongoose Model interface (optional but good for type safety on statics)
export interface IProductModel extends Model<IProductDocument> {
  // Add any static methods you define on the schema here if needed
}

// Define the Product Schema, using IProductDocument for type safety
const ProductSchema = new Schema<IProductDocument, IProductModel>(
  {
    name: {
      type: String,
      required: [true, "Please add a product name"],
      trim: true,
      maxlength: [100, "Name can not be more than 100 characters"],
      unique: true,
    },
    slug: String,
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description can not be more than 500 characters"],
      default: "No description provided.",
    },
    price: {
      type: Number,
      default: 0,
      min: [0, "Price cannot be negative"],
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
    images: {
      type: [String],
      default: [],
    },
    store: {
      // --- THE NEW PRAGMATIC FIX ---
      type: String, // <--- CHANGE THIS LINE FROM mongoose.Schema.Types.ObjectId
      ref: "Store",
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
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

ProductSchema.pre<IProductDocument>("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  next();
});

const Product = model<IProductDocument, IProductModel>(
  "Product",
  ProductSchema
);

export default Product;
