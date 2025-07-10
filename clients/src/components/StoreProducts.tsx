// src/components/StoreProducts.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom"; // Import useParams to get URL parameters
import api from "../services/api"; // Your API service
import { AxiosError } from "axios";

// Interface for a Product (matching your backend IProduct model)
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
  }; // Populated store object
  stock: number;
  isActive: boolean;
  discountCode: string;
  shopNowUrl: string;
  successRate: number;
  totalUses: number;
  todayUses: number;
  createdAt: string;
  updatedAt: string;
}

const StoreProducts: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>(); // Get storeId from the URL
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string>(""); // To display store name

  useEffect(() => {
    const fetchProducts = async () => {
      if (!storeId) {
        setError("Store ID is missing from the URL.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // Fetch products for the specific storeId
        const response = await api.get(`/products/stores/${storeId}/products`);
        setProducts(response.data);

        // Assuming products[0] will have the store data if the array is not empty
        // Or you could make a separate call to /stores/:storeId if needed.
        if (response.data.length > 0) {
          setStoreName(response.data[0].store.name);
        } else {
          // If no products, still try to get the store name for context
          try {
            const storeResponse = await api.get(`/stores/${storeId}`);
            setStoreName(storeResponse.data.name);
          } catch (storeErr) {
            console.error(
              "Could not fetch store details for empty product list:",
              storeErr
            );
            setStoreName("Unknown Store");
          }
        }
      } catch (err) {
        const axiosError = err as AxiosError;
        console.error("Error fetching products:", axiosError);
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

    fetchProducts();
  }, [storeId]); // Re-run effect if storeId changes in the URL

  if (loading) {
    return (
      <p className="text-center text-lg mt-8">
        Loading deals for {storeName || "store"}...
      </p>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 text-lg mt-8">
        <p>{error}</p>
        <Link to="/" className="text-purple-600 hover:underline">
          Go back to Stores
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Link
        to="/"
        className="text-purple-600 hover:underline mb-4 inline-block"
      >
        &larr; Back to All Stores
      </Link>
      <h2 className="text-3xl font-bold text-center mb-6">
        Deals from {storeName}
      </h2>

      {products.length === 0 ? (
        <p className="text-center text-gray-600 mt-8">
          No deals found for {storeName} yet. Check back later!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-md p-6 transform hover:scale-105 transition-transform duration-200 ease-in-out flex flex-col"
            >
              {/* Product Logo / Image */}
              {product.images && product.images.length > 0 ? (
                <img
                  src={`${import.meta.env.VITE_BACKEND_URL?.replace(
                    "/api",
                    ""
                  )}${product.images[0]}`}
                  alt={product.name}
                  className="w-full h-40 object-contain mb-4 rounded-md border border-gray-200 p-2"
                />
              ) : (
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center mb-4 rounded-md text-gray-500 text-sm border border-dashed border-gray-400">
                  No Product Image
                </div>
              )}

              {/* Product Title */}
              <h3 className="text-xl font-semibold mb-2 text-gray-900 line-clamp-2">
                {product.name}
              </h3>
              {/* Product Description */}
              <p className="text-gray-700 text-sm mb-4 line-clamp-3 flex-grow">
                {product.description}
              </p>

              {/* Discount Code & Copy Button */}
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
                      navigator.clipboard.writeText(product.discountCode)
                    }
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Shop Now Button */}
              <a
                href={product.shopNowUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-full text-center transition-colors duration-200 mb-4"
              >
                SHOP NOW
              </a>

              {/* Usage Statistics */}
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
