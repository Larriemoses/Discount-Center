// common/src/types/IProductTypes.ts
import type { IProduct } from "../interfaces/IProduct"; // <--- ADD 'type' keyword
import type { IStoreApi } from "./IStoreTypes"; // <--- ADD 'type' keyword

// IProductApi represents a Product document as returned by the API
// It omits the 'store' property from IProduct and redefines it to handle population.
export interface IProductApi extends Omit<IProduct, "store"> {
  _id: string; // Always present for API responses
  createdAt: Date; // Always present for API responses
  updatedAt: Date; // Always present for API responses
  // The 'store' field can be either the ObjectId string (if not populated)
  // or a full IStoreApi object (if populated by Mongoose)
  store: string | IStoreApi;
}
