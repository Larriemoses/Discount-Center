// common/src/types/IStoreTypes.ts
import type { IStore } from "../interfaces/IStore"; // <--- ADD 'type' keyword

// IStoreApi represents a Store document as returned by the API (with _id, timestamps)
export interface IStoreApi extends IStore {
  _id: string; // Always present for API responses
  createdAt: Date; // Always present for API responses
  updatedAt: Date; // Always present for API responses
}
