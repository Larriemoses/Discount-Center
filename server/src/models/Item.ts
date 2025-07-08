import mongoose, { Schema, Document } from "mongoose";

// Define an interface for our Item document
export interface IItem extends Document {
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Item schema
const ItemSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true } // Mongoose will automatically add createdAt and updatedAt fields
);

// Create and export the Mongoose model
export default mongoose.model<IItem>("Item", ItemSchema);
