// client/src/pages/StoreDetailsPage.tsx

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import type { IStore } from "../../../server/src/models/Store";
import type { IProduct } from "../../../server/src/models/Product";

const StoreDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<IStore | null>(null);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setLoadingProducts] = useState(true);
  const [error, setError] = useState("");
  const [productsError, setProductsError] = useState("");
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null); // State for copy success message

  const STATIC_FILES_BASE_URL = "http://localhost:5000/uploads";
  const PLACEHOLDER_LOGO_PATH = "/placeholder-logo.png"; // Assuming this is in client/public

  // Helper function to copy text to clipboard and show toast
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopiedMessage("Copied successfully!");
        setTimeout(() => {
          setCopiedMessage(null); // Clear message after 3 seconds
        }, 3000);
      },
      (err) => {
        console.error("Failed to copy text: ", err);
        setCopiedMessage("Failed to copy code.");
        setTimeout(() => {
          setCopiedMessage(null);
        }, 3000);
      }
    );
  };

  // Helper function to handle product interaction (copy, shop)
  const handleProductInteraction = async (
    productId: string,
    action: "copy" | "shop"
  ) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/products/${productId}/interact`,
        { action }
      );
      const updatedProduct = response.data.data;

      if (updatedProduct) {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === updatedProduct._id ? updatedProduct : product
          )
        );
      }
      console.log("Interaction successful:", updatedProduct);
    } catch (error) {
      console.error("Error interacting with product:", error);
    }
  };

  useEffect(() => {
    const fetchStoreAndProducts = async () => {
      if (!slug) {
        setError("No store slug provided.");
        setLoading(false);
        setLoadingProducts(false);
        return;
      }
      try {
        // Fetch Store Details
        const storeResponse = await axios.get(
          `http://localhost:5000/api/stores/by-slug/${slug}`
        );
        const fetchedStore: IStore = storeResponse.data.data;
        setStore(fetchedStore);
        setLoading(false);

        // After fetching store, fetch its products using the store's _id
        if (fetchedStore && fetchedStore._id) {
          try {
            // Corrected line:
            const productsResponse = await axios.get(
              `http://localhost:5000/api/products/stores/${fetchedStore._id}/products`
            );
            setProducts(productsResponse.data);
          } catch (productErr: any) {
            console.error("Failed to fetch products for store:", productErr);
            setProductsError(
              "Failed to load products: " +
                (productErr.response?.data?.message ||
                  productErr.message ||
                  "Server error.")
            );
          } finally {
            setLoadingProducts(false);
          }
        } else {
          setLoadingProducts(false);
          setProductsError("Could not find store ID to fetch products.");
        }
      } catch (err: any) {
        console.error("Failed to fetch store details:", err);
        setError(
          "Failed to load store details. " +
            (err.response?.data?.message || err.message || "Server error.")
        );
        setLoading(false);
        setLoadingProducts(false);
      }
    };

    fetchStoreAndProducts();
  }, [slug]);

  if (loading) return <div className="text-center p-8">Loading store...</div>;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;
  if (!store)
    return (
      <div className="text-center p-8 text-gray-600">Store not found.</div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        {/* Centered Header Section: Main Title (Name), Subtitle, Sub-subtitle, then Store Logo */}
        <div className="flex flex-col items-center mb-6 text-center">
          {/* Main Store Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 break-words mb-2">
            {store.name}
          </h1>

          {/* Subtitle (Top Deal Headline) */}
          {store.topDealHeadline && (
            <p className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">
              {store.topDealHeadline}
            </p>
          )}

          {/* Sub-subtitle (Tagline) */}
          {store.tagline && (
            <p className="text-lg sm:text-xl text-gray-600 max-w-prose">
              {store.tagline}
            </p>
          )}

          {/* Store Logo - Remains here as requested */}
          {store.logo && store.logo !== "no-photo.jpg" ? (
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 flex items-center justify-center rounded-full overflow-hidden mt-4 shadow-sm">
              <img
                src={`${STATIC_FILES_BASE_URL}/${store.logo}`}
                alt={store.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.onerror = null; // Prevent infinite loop
                  e.currentTarget.src = PLACEHOLDER_LOGO_PATH;
                  e.currentTarget.alt = "Store Logo Not Found";
                }}
              />
            </div>
          ) : (
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 flex items-center justify-center rounded-full mt-4 text-xs text-gray-400 shadow-sm">
              No Logo
            </div>
          )}
        </div>

        {/* Full Store Description */}
        {store.description && (
          <div className="mb-6 border-t border-gray-200 pt-6 mt-6 text-center">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
              Full Description
            </h2>
            <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
              {store.description}
            </p>
          </div>
        )}

        {/* Products section */}
        <h2 className="text-xl sm:text-2xl font-bold mt-8 mb-4 text-gray-800 text-center">
          Products from {store.name}
        </h2>
        {productsLoading ? (
          <div className="text-center p-4">Loading products...</div>
        ) : productsError ? (
          <div className="text-center p-4 text-red-600">{productsError}</div>
        ) : products.length > 0 ? (
          <div className="flex flex-col items-center gap-6">
            {products.map((product) => (
              <div
                key={product._id.toString()}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden
                           w-4/5 md:w-2/5 flex flex-col p-4"
              >
                {/* Product Details Section */}
                <div>
                  {/* Inline Store Logo and Product Name (Title) */}
                  <div className="flex items-center mb-3">
                    {product.store &&
                    typeof product.store === "object" &&
                    "logo" in product.store &&
                    product.store.logo &&
                    product.store.logo !== "no-photo.jpg" ? (
                      <img
                        src={`${STATIC_FILES_BASE_URL}/${
                          (product.store as IStore).logo
                        }`}
                        alt={(product.store as IStore).name || "Store Logo"}
                        className="w-8 h-8 object-contain rounded-full mr-2"
                        onError={(e) => {
                          e.currentTarget.onerror = null; // Prevent infinite loop
                          e.currentTarget.src = PLACEHOLDER_LOGO_PATH;
                          e.currentTarget.alt = "Store Logo Not Found";
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded-full mr-2 flex items-center justify-center text-xs text-gray-400">
                        NL
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                      {product.name}
                    </h3>
                  </div>

                  {/* Price remains removed */}
                </div>

                {/* Discount Code & Copy button */}
                <div className="mt-2 space-y-2">
                  <div className="flex items-center">
                    <span className="flex-grow bg-[#6348db] text-[#f3f0fa] font-semibold rounded-l-md py-2 px-4 text-center truncate">
                      {product.discountCode}
                    </span>
                    <button
                      onClick={() => {
                        copyToClipboard(product.discountCode);
                        // handleProductInteraction will update usage numbers
                        handleProductInteraction(
                          product._id.toString(),
                          "copy"
                        );
                      }}
                      className="rounded-r-md border-2 border-[#6348db] bg-white py-2 px-4 font-semibold text-[#6348db] transition duration-300 hover:bg-[#f3f0fa] focus:outline-none"
                      style={{ height: "40px" }}
                    >
                      COPY CODE
                    </button>
                  </div>
                  {/* Shop Now button */}
                  <a
                    href={product.shopNowUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      handleProductInteraction(product._id.toString(), "shop")
                    } // This will update usage numbers
                    className="block w-full text-center bg-[#6348db] text-white py-3 px-4 rounded-md hover:bg-[#523aa7] transition duration-300 flex items-center justify-center text-center"
                  >
                    SHOP NOW
                  </a>
                </div>

                {/* Usage Stats (Used and Today) */}
                <div className="flex items-center justify-between text-gray-600 text-xs mt-3">
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 text-gray-400 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          d="M5 4a1 1 0 00-2 0v7.293a1 1 0 00.293.707l2.586 2.586a1 1 0 00.707.293H15a1 1 0 001-1V4a1 1 0 00-1-1H5zM3 15a2 2 0 11-4 0 2 2 0 014 0z"
                          clipRule="evenodd"
                          fillRule="evenodd"
                        ></path>
                      </svg>
                      {product.totalUses} Used
                    </span>
                  </div>
                  <span className="text-gray-500">
                    - {product.todayUses} Today
                  </span>
                </div>

                {/* Like/Dislike Buttons remain removed */}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center">
            No products found for this store yet.
          </p>
        )}
      </div>

      {/* Toast Notification for Copy Success */}
      {copiedMessage && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-fade-in-out">
          {copiedMessage}
        </div>
      )}
    </div>
  );
};

export default StoreDetailsPage;
