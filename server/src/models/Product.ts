// server/src/models/Product.ts
import { Document, Schema, model } from "mongoose";
import { IStore } from "./Store"; // Assuming IStore is also defined

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  category?: string;
  images: string[]; // Make sure this is 'string[]'
  store: IStore["_id"] | IStore; // Can be ObjectId or populated Store object
  stock: number; // Make sure this is 'number'
  isActive: boolean;
  discountCode: string;
  shopNowUrl: string;
  successRate: number;
  totalUses: number;
  todayUses: number;
  likes: number;
  dislikes: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discountedPrice: { type: Number },
    category: { type: String },
    images: [{ type: String }], // Mongoose schema definition
    store: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    stock: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    discountCode: { type: String, required: true },
    shopNowUrl: { type: String, required: true },
    successRate: { type: Number, default: 0 },
    totalUses: { type: Number, default: 0 },
    todayUses: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Product = model<IProduct>("Product", ProductSchema);
export default Product;
