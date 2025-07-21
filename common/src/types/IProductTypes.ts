// common/src/types/IProductTypes.ts
import { IProduct } from "../interfaces/IProduct"; // Import the base IProduct
import { IStoreApi } from "./IStoreTypes"; // Import the API Store interface

// IProductApi represents a Product document as returned by the API
// It omits the 'store' property from IProduct and redefines it to handle population.
export interface IProductApi extends Omit<IProduct, "store"> {
  // <--- IMPORTANT CHANGE HERE
  _id: string; // Always present for API responses
  createdAt: Date; // Always present for API responses
  updatedAt: Date; // Always present for API responses
  // The 'store' field can be either the ObjectId string (if not populated)
  // or a full IStoreApi object (if populated by Mongoose)
  store: string | IStoreApi; // <--- Redefined 'store' with the union type
}
