// common/src/interfaces/IProduct.ts
import { IStore } from "./IStore"; // Import the base IStore interface

export interface IProduct {
  name: string;
  description?: string;
  price?: number;
  discountedPrice?: number;
  category?: string;
  images?: string[];
  // 'store' is a string here, representing the ObjectId of the store
  store: string;
  stock?: number;
  isActive?: boolean;
  discountCode: string;
  shopNowUrl: string;
  totalUses?: number;
  todayUses?: number;
  successRate?: number;
  likes?: number;
  dislikes?: number;
  lastDailyReset?: Date;
  slug?: string;
}
