// server/src/models/Store.ts
import mongoose, { Document, Schema, model, Model } from "mongoose";
import { IStore } from "@common/interfaces/IStore"; // Use the base store interface

// Define the Mongoose Document interface.
export interface IStoreDocument extends IStore, Document {
  // Add any custom instance methods you define on the schema here if needed
}

// Define the Mongoose Model interface (optional but good for type safety on statics)
export interface IStoreModel extends Model<IStoreDocument> {
  // Add any static methods you define on the schema here if needed
}

// Define the Store schema, using IStoreDocument and IStoreModel for type safety
const StoreSchema: Schema<IStoreDocument, IStoreModel> = new Schema<
  IStoreDocument,
  IStoreModel
>(
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
    // If you had a field like this in Store.ts that references another schema:
    // SomeRefField: {
    //   type: mongoose.Schema.Types.ObjectId as unknown as typeof Schema.Types.ObjectId, // Apply the fix here too!
    //   ref: "AnotherModel",
    // },
  },
  {
    timestamps: true,
  }
);

StoreSchema.pre<IStoreDocument>("save", function (next) {
  if (this.isNew || (this.isModified("name") && !this.isModified("slug"))) {
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
  }
  next();
});

const Store = model<IStoreDocument, IStoreModel>("Store", StoreSchema);

export default Store;
