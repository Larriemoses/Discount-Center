// client/src/pages/StoreDetailsPage.tsx

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios, { AxiosError } from "axios";
import type { IStoreClient, IProductClient } from "../types"; // Adjust path if your types file is elsewhere

const StoreDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // Use the client-specific types for your state
  const [store, setStore] = useState<IStoreClient | null>(null);
  const [products, setProducts] = useState<IProductClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setLoadingProducts] = useState(true);
  const [error, setError] = useState("");
  const [productsError, setProductsError] = useState("");
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);

  const STATIC_FILES_BASE_URL = "http://localhost:5000/uploads";
  const PLACEHOLDER_LOGO_PATH = "/placeholder-logo.png"; // Assuming this is in client/public

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopiedMessage("Copied successfully!");
        setTimeout(() => {
          setCopiedMessage(null);
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

  const handleProductInteraction = async (
    productId: string,
    action: "copy" | "shop"
  ) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/products/${productId}/interact`,
        { action }
      );
      // Destructure only the fields we expect to change from the backend response
      const { _id, totalUses, todayUses } = response.data.data;

      if (_id) {
        // Ensure we have an ID to update
        setProducts((prevProducts) =>
          prevProducts.map((product) => {
            if (product._id === _id) {
              // Explicitly update only usage stats, preserving all other product properties
              return {
                ...product, // Keep all existing properties (including the 'store' object)
                totalUses:
                  totalUses !== undefined ? totalUses : product.totalUses,
                todayUses:
                  todayUses !== undefined ? todayUses : product.todayUses,
              };
            }
            return product;
          })
        );
      }
      console.log("Interaction successful:", response.data.data);
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
        // Fetch Store Details using slug
        const storeResponse = await axios.get(
          `http://localhost:5000/api/stores/by-slug/${slug}`
        );
        // Cast to IStoreClient
        const fetchedStore: IStoreClient = storeResponse.data.data;
        setStore(fetchedStore);
        setLoading(false);

        // After fetching store, fetch its products using the store's _id
        if (fetchedStore && fetchedStore._id) {
          try {
            const productsResponse = await axios.get(
              `http://localhost:5000/api/products/stores/${fetchedStore._id}/products`
            );
            // Cast to IProductClient[]
            setProducts(productsResponse.data as IProductClient[]);
          } catch (productErr) {
            const axiosProductError = productErr as AxiosError;
            console.error(
              "Failed to fetch products for store:",
              axiosProductError
            );
            setProductsError(
              "Failed to load products: " +
                ((axiosProductError.response?.data as any)?.message ||
                  axiosProductError.message ||
                  "Server error.")
            );
          } finally {
            setLoadingProducts(false);
          }
        } else {
          setLoadingProducts(false);
          setProductsError("Could not find store ID to fetch products.");
        }
      } catch (err) {
        const axiosError = err as AxiosError;
        console.error("Failed to fetch store details:", axiosError);
        if (axiosError.response) {
          setError(
            `Failed to load store details: ${axiosError.response.status} - ${
              (axiosError.response.data as any)?.message ||
              axiosError.response.statusText ||
              "Unknown error"
            }`
          );
        } else if (axiosError.request) {
          setError(
            "Network Error: No response from server. Is the backend running?"
          );
        } else {
          setError(`Request Error: ${axiosError.message}`);
        }
        setLoading(false);
        setLoadingProducts(false);
      }
    };

    fetchStoreAndProducts();
  }, [slug]);

  // Helper function to ensure URL has a protocol
  const getFullUrl = (url: string | undefined): string => {
    if (!url) {
      // Check if url is null, undefined, or an empty string
      console.warn(
        "Attempted to get full URL for an undefined or empty URL string. Returning '#'."
      );
      return "#"; // Return a safe fallback URL
    }
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return `https://${url}`;
    }
    return url;
  };

  // Helper to safely format store name for URLs
  const getFormattedStoreName = (name: string | undefined): string => {
    if (!name) {
      return ""; // Return empty string if name is undefined or null
    }
    return name.toLowerCase().replace(/\s/g, "");
  };

  if (loading)
    return <div className="pt-[7rem] text-center p-8">Loading store...</div>;
  if (error)
    return (
      <div className="pt-[7rem] text-center p-8 text-red-600">{error}</div>
    );
  if (!store)
    return (
      <div className="pt-[7rem] text-center p-8 text-gray-600">
        Store not found.
      </div>
    );

  // Derive formatted store name once, after 'store' is guaranteed to exist
  const formattedStoreName = getFormattedStoreName(store.name);

  return (
    <div className="pt-8 sm:pt-[4rem] min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto p-6 rounded-lg">
        {/* Centered Header Section for Store Details */}
        <div className="flex flex-col items-center mb-6 text-center">
          {/* Main Store Title - Responsive font size and word breaking */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 break-words mb-2">
            {store.name}
          </h1>

          {/* Subtitle (Top Deal Headline) - Responsive font size and word breaking */}
          {store.topDealHeadline && (
            <p className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2 break-words">
              {store.topDealHeadline}
            </p>
          )}

          {/* Sub-subtitle (Tagline) - Responsive font size, max-w-prose for readability, word breaking */}
          {store.tagline && (
            <p className="text-lg sm:text-xl text-gray-600 max-w-prose break-words">
              {store.tagline}
            </p>
          )}

          {/* Store Logo - Responsive sizing and fallback */}
          {store.logo && store.logo !== "no-photo.jpg" ? (
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 flex items-center justify-center rounded-full overflow-hidden mt-4 shadow-sm">
              <img
                src={`${STATIC_FILES_BASE_URL}/${store.logo}`}
                alt={store.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.onerror = null;
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

        {/* Full Store Description - Responsive text and word breaking */}
        {store.description && (
          <div className="mb-6 border-t border-gray-200 pt-6 mt-6 text-center">
            <p className="text-gray-700 leading-relaxed text-base sm:text-lg break-words">
              {store.description}
            </p>
          </div>
        )}

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
                          w-full max-w-md p-4 flex flex-col"
              >
                <div>
                  <div className="flex items-center mb-3">
                    {/* Product's Store Logo - Responsive sizing and fallback */}
                    {product.store &&
                    typeof product.store === "object" &&
                    "logo" in product.store &&
                    (product.store as IStoreClient).logo &&
                    (product.store as IStoreClient).logo !== "no-photo.jpg" ? (
                      <img
                        src={`${STATIC_FILES_BASE_URL}/${
                          (product.store as IStoreClient).logo
                        }`}
                        alt={
                          (product.store as IStoreClient).name || "Store Logo"
                        }
                        className="w-8 h-8 object-contain rounded-full mr-2"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = PLACEHOLDER_LOGO_PATH;
                          e.currentTarget.alt = "Store Logo Not Found";
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded-full mr-2 flex items-center justify-center text-xs text-gray-400">
                        NL
                      </div>
                    )}
                    {/* Product Name - Responsive text, line clamp, and word breaking */}
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 break-words">
                      {product.name}
                    </h3>
                  </div>
                </div>

                {/* Discount Code & Copy button - designed to stay inline and adjust */}
                <div className="mt-2 space-y-2">
                  <div className="flex items-stretch min-w-0">
                    <span className="flex-grow bg-[#6348db] text-[#f3f0fa] font-semibold rounded-l-md py-2 px-3 text-center text-sm sm:text-base break-words overflow-hidden">
                      {product.discountCode}
                    </span>
                    <button
                      onClick={() => {
                        copyToClipboard(product.discountCode);
                        handleProductInteraction(
                          product._id.toString(),
                          "copy"
                        );
                      }}
                      className="flex-shrink-0 rounded-r-md border-2 border-[#6348db] bg-white py-2 px-3 font-semibold text-[#6348db] transition duration-300 hover:bg-[#f3f0fa] focus:outline-none text-sm sm:text-base"
                      style={{ height: "40px" }}
                    >
                      COPY CODE
                    </button>
                  </div>
                  {/* Shop Now button - Full width and centered */}
                  <a
                    href={product.shopNowUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      handleProductInteraction(product._id.toString(), "shop")
                    }
                    className="block w-full text-center bg-[#6348db] text-white py-3 px-4 rounded-md hover:bg-[#523aa7] transition duration-300 flex items-center justify-center"
                  >
                    SHOP NOW
                  </a>
                </div>

                {/* Usage Stats - Responsive and spaced */}
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
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center">
            No products found for this store yet.
          </p>
        )}

        {/* EFFORTLESS SAVINGS SECTION - REVISED */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Effortless Savings
          </h2>
          <p className="text-xl sm:text-2xl font-semibold text-gray-700 mb-6">
            Start Here
          </p>
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
            We've sourced the best working Oraimo discount code to help you save
            on your favorite gadgets and accessories. Whether you're grabbing a
            new power bank, earbuds, or smart appliance, this code is all you
            need to shop smarter and pay less no stress, just real savings.
          </p>
        </div>
        {/* END EFFORTLESS SAVINGS SECTION */}

        {/* How to Use Your Discount Code Section - Only renders if store.mainUrl exists */}
        {store.mainUrl ? (
          <div className="mt-12 pt-6 border-t border-gray-200">
            {" "}
            {/* Removed text-left from parent to control alignment on children */}
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
              How to Use Your {store.name} Discount Code
            </h2>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6 max-w-3xl mx-auto">
              {" "}
              {/* Added mx-auto for centering on larger screens */}
              Save big on your favorite {store.name} products with our exclusive
              discount codes. Follow these simple steps to redeem your code:
            </p>
            <ul className="list-disc pl-5 space-y-3 text-gray-700 text-base sm:text-lg max-w-3xl mx-auto">
              {" "}
              {/* Added mx-auto for centering on larger screens */}
              <li>
                Visit the{" "}
                <a
                  href={getFullUrl(store.mainUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 hover:underline cursor-pointer"
                >
                  {store.name} Store
                </a>
              </li>
              <li>
                Click here to shop directly on the official {}
                <a
                  href={getFullUrl(store.mainUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 hover:underline cursor-pointer"
                >
                  {store.name} store
                </a>
                .
              </li>
              <li>Sign in or sign up if you are new</li>
              <li>Select Your Products</li>
              <li>
                Browse through the wide range of {store.name} accessories,
                including earbuds, power banks, smartwatches, and more.
              </li>
              <li>
                Go to Checkout, once you're ready, proceed to the checkout page
                by clicking the cart icon.
              </li>
              <li>Look for the field labeled "enter discount Code"</li>
              <li>Enter the relevant discount code from Discount Region.</li>
              <li>Click "Apply" to validate the coupon</li>
              <li>The discount should be reflected in your order total.</li>
              <li>
                Proceed to payment online or at delivery and Complete Your
                Purchase.
              </li>
            </ul>
            <p className="text-green-600 font-semibold mt-6 text-center text-base sm:text-lg">
              {" "}
              {/* Reduced font size here */}
              Congratulations! You've successfully used an {store.name} discount
              code.
            </p>
            <p className="text-sm text-gray-500 mt-4 text-center">
              <strong className="text-gray-600">NOTE:</strong> There are
              instances when you might not need to add a code at checkout
              because is applied automatically.
            </p>
          </div>
        ) : (
          <div className="mt-12 pt-6 border-t border-gray-200 text-left text-center text-gray-500">
            <p>Store website URL for discount instructions is not available.</p>
          </div>
        )}

        {/* Best Deals Section - REVISED */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          {" "}
          {/* Removed text-left from parent */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
            Best {store.name} Deals
          </h2>
          <ul className="list-disc pl-5 space-y-3 text-gray-700 text-base sm:text-lg max-w-3xl mx-auto">
            {" "}
            {/* Added mx-auto for centering on larger screens */}
            <li>
              Sign up for an {store.name} account to earn up to 600 reward
              points instantly and up to 1000 points with purchases. Redeem
              these points for discounts on future orders.
            </li>
            <li>
              Use the Discount Region coupon code to enjoy a 5% discount on any{" "}
              {store.name} product you purchase and take advantage of Daily
              Deals offering up to 49% off on select items.
            </li>
            <li>
              Combine reward points, coupon codes, and daily deals for maximum
              savings.
            </li>
          </ul>
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed mt-6 text-center max-w-3xl mx-auto">
            {" "}
            {/* Added mx-auto for centering on larger screens */}
            Start saving today and enjoy top quality {store.name} accessories at
            unbeatable prices!
          </p>
        </div>

        {/* Contact Customer Care Section - REVISED */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          {" "}
          {/* Removed text-left from parent */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
            Need Help? Here's How to Contact {store.name} Customer Care
          </h2>
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6 text-center max-w-3xl mx-auto">
            {" "}
            {/* Added mx-auto for centering on larger screens */}
            If you have questions or need support, you can easily reach{" "}
            {store.name} through any of these channels:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mt-6 max-w-4xl mx-auto">
            {" "}
            {/* Ensured grid is max-width and centered */}
            {/* Phone Support */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm flex flex-col items-center">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">
                Phone Support
              </h3>
              <p className="text-gray-700 break-words text-base">
                {" "}
                {/* Adjusted font size */}
                +234 818 135 3103 (First Choice)
              </p>
              <p className="text-gray-700 break-words text-base">
                +234 809 604 0753
              </p>{" "}
              {/* Adjusted font size */}
            </div>
            {/* Whatsapp Support */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm flex flex-col items-center">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">
                Whatsapp Support
              </h3>
              <p className="text-gray-700 text-base">Chat with a rep:</p>{" "}
              {/* Adjusted font size */}
              <p className="text-gray-700 break-words text-base">
                +234 916 459 8060
              </p>{" "}
              {/* Adjusted font size */}
              <p className="text-gray-700 break-words text-base">
                +234 818 642 3337
              </p>{" "}
              {/* Adjusted font size */}
            </div>
            {/* Email Support */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm flex flex-col items-center">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">
                Email Support
              </h3>
              <p className="text-gray-700 text-base">
                {" "}
                {/* Adjusted font size */}
                Send a message to: care.ng@oraimo.com
              </p>
              <p className="text-gray-700 break-words text-base">
                {" "}
                {/* Adjusted font size */}
                deliveryissue.ng@oraimo.com (First Choice for Logistics Issue)
              </p>
            </div>
          </div>
          {/* Social Media Buttons - CRITICAL FIX HERE */}
          <div className="flex flex-wrap justify-center gap-4 mt-8 max-w-4xl mx-auto">
            {" "}
            {/* Ensured buttons container is max-width and centered */}
            {/* Facebook Link */}
            {formattedStoreName && (
              <a
                href={`https://www.facebook.com/${formattedStoreName}nigeria`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#3b5998] text-white py-3 px-6 rounded-md hover:opacity-90 transition-opacity duration-300 flex items-center justify-center space-x-2 text-base sm:text-lg w-full sm:w-auto"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.248-1.333 1.134-1.333h2.866v-3h-4c-4.198 0-4.667 3.149-4.667 5.333v2.667z" />
                </svg>
                <span>Facebook</span>
              </a>
            )}
            {/* Twitter Link */}
            {formattedStoreName && (
              <a
                href={`https://twitter.com/${formattedStoreName}nigeria`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1DA1F2] text-white py-3 px-6 rounded-md hover:opacity-90 transition-opacity duration-300 flex items-center justify-center space-x-2 text-base sm:text-lg w-full sm:w-auto"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.89-.957-2.172-1.55-3.596-1.55-2.714 0-4.918 2.204-4.918 4.918 0 .387.044.764.126 1.127-4.095-.205-7.739-2.173-10.179-5.176-.424.729-.665 1.579-.665 2.493 0 1.708.875 3.215 2.205 4.098-.813-.026-1.574-.249-2.238-.618v.062c0 2.387 1.696 4.385 3.945 4.834-.412.11-.847.168-1.297.168-.318 0-.626-.031-.926-.088.627 1.956 2.445 3.38 4.6 3.42-1.68 1.321-3.805 2.108-6.102 2.108-.397 0-.79-.023-1.176-.069 2.179 1.397 4.768 2.212 7.548 2.212 9.055 0 14.009-7.502 14.009-14.01 0-.213-.005-.426-.014-.637.962-.695 1.797-1.564 2.454-2.553z" />
                </svg>
                <span>Twitter</span>
              </a>
            )}
            {/* Instagram Link */}
            {formattedStoreName && (
              <a
                href={`https://www.instagram.com/${formattedStoreName}nigeria`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#262626] text-white py-3 px-6 rounded-md hover:opacity-90 transition-opacity duration-300 flex items-center justify-center space-x-2 text-base sm:text-lg w-full sm:w-auto"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.07 1.645.07 4.85s-.012 3.584-.07 4.85c-.149 3.225-1.664 4.771-4.919 4.919-.058 1.265-.07-1.644-.07-4.85s.012-3.584.07-4.85c.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.073 4.948.073s3.668-.014 4.948-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.798-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.202-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.44-.645 1.44-1.44s-.645-1.44-1.44-1.44z" />
                </svg>
                <span>Instagram</span>
              </a>
            )}
          </div>
        </div>

        {/* Toast Notification for Copy Success */}
        {copiedMessage && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-fade-in-out">
            {copiedMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreDetailsPage;
