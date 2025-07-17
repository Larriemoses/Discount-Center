// client/src/types/index.d.ts

// Defines the shape of a Store object as received by the client
// Excludes Mongoose-specific properties.
export interface IStoreClient {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  tagline?: string;
  topDealHeadline?: string;
  mainUrl: string; // Added this line to include the main URL for the store
  // Add any other store properties your client uses here
}

// Defines the shape of a Product object as received by the client
// Excludes Mongoose-specific properties.
export interface IProductClient {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountedPrice?: number;
  category?: string;
  images: string[];
  discountCode: string;
  shopNowUrl: string;
  totalUses: number;
  todayUses: number;
  // The 'store' can be either a string (ObjectId) or a populated IStoreClient object
  store: string | IStoreClient;
  isActive: boolean;
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  // Add any other product properties your client uses here
}
