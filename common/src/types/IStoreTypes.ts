// common/src/types/IStoreTypes.ts
import { IStore } from "../interfaces/IStore"; // Import the base IStore

// IStoreApi represents a Store document as returned by the API (with _id, timestamps)
export interface IStoreApi extends IStore {
  _id: string; // Always present for API responses
  createdAt: Date; // Always present for API responses
  updatedAt: Date; // Always present for API responses
}
