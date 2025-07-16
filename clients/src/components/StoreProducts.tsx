// src/components/StoreProducts.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { AxiosError } from "axios";

interface IStore {
  _id: string;
  name: string;
  description: string;
  slug: string;
  logo?: string;
  topDealHeadline?: string;
  createdAt: string;
  updatedAt: string;
}

interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  category?: string;
  images: string[];
  store: {
    _id: string;
    name: string;
    logo?: string;
    slug: string;
  };
  stock: number;
  isActive: boolean;
  discountCode: string;
  shopNowUrl: string;
  successRate: number;
  totalUses: number;
  todayUses: number; // This is the field we're targeting
  createdAt: string;
  updatedAt: string;
}

const StoreProducts: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [storeDetails, setStoreDetails] = useState<IStore | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to get today's date string for localStorage keys
  const getTodayDateString = () => new Date().toDateString();

  useEffect(() => {
    const fetchData = async () => {
      if (!storeId) {
        setError("Store ID is missing from the URL.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const storeResponse = await api.get(`/stores/${storeId}`);
        setStoreDetails(storeResponse.data);

        const productsResponse = await api.get(
          `/products/stores/${storeId}/products`
        );
        if (Array.isArray(productsResponse.data)) {
          let fetchedProducts: IProduct[] = productsResponse.data;

          // --- ONE-TIME FRONTEND FORCE RESET LOGIC (FOR `StoreProducts.tsx`) ---
          const forceResetKey = "forceResetTodayUses_StoreProducts";
          const lastForceResetDate = localStorage.getItem(forceResetKey);
          const today = getTodayDateString();

          if (lastForceResetDate !== today) {
            // Check if force reset ran today
            console.log(
              "StoreProducts: Performing one-time force reset of 'todayUses'."
            );
            fetchedProducts = fetchedProducts.map((product) => ({
              ...product,
              todayUses: 0, // Force reset to 0
            }));
            localStorage.setItem(forceResetKey, today); // Mark as done for today
          } else {
            console.log(
              "StoreProducts: One-time force reset already ran today."
            );
          }
          // --- END ONE-TIME FRONTEND FORCE RESET LOGIC ---

          setProducts(fetchedProducts);
        } else {
          console.error(
            "Backend /products endpoint did not return an array:",
            productsResponse.data
          );
          setError(
            "Failed to load products: Unexpected data format from server."
          );
        }
      } catch (err) {
        const axiosError = err as AxiosError;
        console.error("Error fetching data for store products:", axiosError);
        if (axiosError.response) {
          const errorMessage =
            (axiosError.response.data as any)?.message ||
            axiosError.response.statusText ||
            "Unknown server error";
          setError(
            `Server Error: ${axiosError.response.status} - ${errorMessage}`
          );
        } else if (axiosError.request) {
          setError(
            "Network Error: No response from server. Is the backend running?"
          );
        } else {
          setError(`Request Error: ${axiosError.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [storeId]);

  // Handle Copy Button Click - Update frontend state for immediate visual feedback
  const handleCopyCode = async (productId: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);

      // Optimistic UI update: immediately increment totalUses and todayUses
      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p._id === productId
            ? { ...p, totalUses: p.totalUses + 1, todayUses: p.todayUses + 1 }
            : p
        )
      );

      // Call backend to record the interaction
      await api.post(`/products/${productId}/interact`, { action: "copy" });
      // The backend will send back updated counts if successful, but our optimistic update is faster.
      // If the backend response contradicts, a full re-fetch or more complex state sync might be needed.
    } catch (err) {
      console.error("Failed to copy or update interaction:", err);
      // Revert optimistic update if there was an error (optional, but good for robustness)
      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p._id === productId
            ? { ...p, totalUses: p.totalUses - 1, todayUses: p.todayUses - 1 }
            : p
        )
      );
      // Show an error message to the user
    }
  };

  if (loading) {
    return (
      <p className="text-center text-lg mt-8">
        Loading deals for {storeDetails?.name || "store"}...
      </p>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 text-lg mt-8">
        <p>{error}</p>
        <Link to="/" className="text-purple-600 hover:underline">
          Go back to All Stores
        </Link>
      </div>
    );
  }

  if (!storeDetails) {
    return <p className="text-center text-lg mt-8">Store details not found.</p>;
  }

  return (
    <div className="p-4">
      <Link
        to="/"
        className="text-purple-600 hover:underline mb-2 inline-block"
      >
        &larr; Back to All Stores
      </Link>

      {storeDetails.topDealHeadline && (
        <div className="p-6 text-center mb-2">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-2">
            {storeDetails.topDealHeadline}
          </h2>
          <p className="text-gray-600 text-lg">
            Top {storeDetails.name} Coupon Codes for{" "}
            {new Date().toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </p>
          <p className="text-gray-600 text-sm mt-1">
            This page contains the best {storeDetails.name} discount codes,
            curated by Discount Center
          </p>

          {storeDetails.logo && storeDetails.logo !== "no-photo.jpg" ? (
            <img
              src={`${import.meta.env.VITE_BACKEND_URL?.replace("/api", "")}${
                storeDetails.logo
              }`}
              alt={`${storeDetails.name} logo`}
              className="w-24 h-24 object-contain mx-auto mt-4 rounded-md border border-gray-200 p-2"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-200 flex items-center justify-center mx-auto mt-4 rounded-md text-gray-500 text-sm border border-dashed border-gray-400">
              No Logo
            </div>
          )}
          <hr className="my-4 border-gray-300 " />
        </div>
      )}

      <h3 className="text-3xl font-normal text-center mb-6">
        All Deals from {storeDetails.name}
      </h3>

      {products.length === 0 ? (
        <p className="text-center text-gray-600 mt-8">
          No deals found for {storeDetails.name} yet. Check back later!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-md p-6 transform hover:scale-105 transition-transform duration-200 ease-in-out flex flex-col"
            >
              {storeDetails.logo && storeDetails.logo !== "no-photo.jpg" ? (
                <img
                  src={`${import.meta.env.VITE_BACKEND_URL?.replace(
                    "/api",
                    ""
                  )}${storeDetails.logo}`}
                  alt={`${storeDetails.name} logo`}
                  className="w-16 h-16 object-contain mb-2 rounded-md border border-gray-200 p-1"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 flex items-center justify-center mb-2 rounded-md text-gray-500 text-xs border border-dashed border-gray-400">
                  No Logo
                </div>
              )}

              <h4 className="text-xl font-semibold mb-2 text-gray-900 line-clamp-2">
                {product.name}
              </h4>
              <p className="text-gray-700 text-sm mb-4 line-clamp-3 flex-grow">
                {product.description}
              </p>

              <div className="bg-purple-100 border border-purple-300 rounded-md p-3 mb-4 text-center">
                <p className="text-purple-800 font-bold text-lg mb-2">
                  Discount Code:
                </p>
                <div className="flex items-center justify-center space-x-2">
                  <span className="bg-purple-600 text-white font-mono text-xl py-2 px-4 rounded-md tracking-wider">
                    {product.discountCode}
                  </span>
                  <button
                    onClick={() =>
                      handleCopyCode(product._id, product.discountCode)
                    }
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <a
                href={product.shopNowUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-full text-center transition-colors duration-200 mb-4"
              >
                SHOP NOW
              </a>

              <div className="flex justify-between items-center text-gray-600 text-sm mt-auto">
                <span className="flex items-center">
                  <span className="text-green-500 font-bold mr-1">👍</span>{" "}
                  {product.successRate}% SUCCESS
                </span>
                <span className="flex items-center space-x-2">
                  <span>👁️ {product.totalUses} Used</span>
                  <span>|</span>
                  <span>{product.todayUses} Today</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoreProducts;
