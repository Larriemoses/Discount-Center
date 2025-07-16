// client/src/components/TopDealsSection.tsx

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

// Ensure these interfaces accurately reflect the data structure from your backend
interface IStore {
  _id: string;
  name: string;
  logo?: string | null; // Changed to allow null to explicitly handle missing logos
  slug: string;
  topDealHeadline?: string; // Used for "Nigeria" or similar tag under logo
}

interface IProduct {
  _id: string;
  name: string;
  code: string; // Corresponds to discountCode from backend
  shopNowLink: string; // Corresponds to shopNowUrl from backend
  usageCount: number; // Corresponds to totalUses from backend
  successRate: number;
  todayUses: number;
  store: IStore;
  likes: number;
  dislikes: number;
  discountType?: string;
  discountValue?: number;
}

// Interface for the specific data returned by the backend interaction endpoint
interface IProductInteractionResponseData {
  _id: string;
  totalUses: number;
  todayUses: number;
  successRate: number;
  likes: number;
  dislikes: number;
}

const TopDealsSection: React.FC = () => {
  const [topDeals, setTopDeals] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for custom notifications
  const [notificationMessage, setNotificationMessage] = useState<string | null>(
    null
  );
  const [notificationType, setNotificationType] = useState<
    "success" | "error" | null
  >(null);

  // Helper function to show notifications
  const showNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setNotificationMessage(message);
    setNotificationType(type);
    setTimeout(() => {
      setNotificationMessage(null);
      setNotificationType(null);
    }, 3000); // Notification disappears after 3 seconds
  };

  // Function to fetch top deals (memoized with useCallback)
  const fetchTopDeals = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/products/top-deals"
      );
      console.log("Frontend: Initial fetch response data:", response.data.data);

      // Map backend fields to frontend interface fields
      const fetchedDeals: IProduct[] = response.data.data.map((deal: any) => ({
        ...deal,
        usageCount: deal.totalUses,
        code: deal.discountCode, // Map discountCode from backend to 'code' on frontend
        shopNowLink: deal.shopNowUrl, // Map shopNowUrl from backend to 'shopNowLink' on frontend
      }));
      setTopDeals(fetchedDeals);
      setLoading(false);
    } catch (err) {
      console.error("Frontend: Failed to fetch top deals:", err);
      setError("Failed to load top deals. Please try again later.");
      showNotification("Failed to load deals.", "error");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopDeals();
  }, [fetchTopDeals]);

  // Function to handle interactions (copy, shop, like, dislike)
  const handleInteraction = async (
    productId: string,
    action: "copy" | "shop" | "like" | "dislike"
  ) => {
    console.log(
      `Frontend: Attempting interaction for product ID: ${productId}, action: ${action}`
    );
    try {
      const response = await axios.post<{
        success: boolean;
        data: IProductInteractionResponseData;
      }>(`http://localhost:5000/api/products/${productId}/interact`, {
        action,
      });

      console.log("Frontend: Backend response for interaction:", response.data);

      if (response.data.success) {
        const updatedData = response.data.data;
        console.log("Frontend: Data received for update:", updatedData);

        setTopDeals((prevDeals) => {
          const newDeals = prevDeals.map((deal) =>
            deal._id === productId
              ? {
                  ...deal,
                  usageCount: updatedData.totalUses,
                  todayUses: updatedData.todayUses,
                  successRate: updatedData.successRate,
                  likes: updatedData.likes,
                  dislikes: updatedData.dislikes,
                }
              : deal
          );
          console.log(
            "Frontend: New state after update (affected card):",
            newDeals.find((d) => d._id === productId)
          );
          return newDeals;
        });
      } else {
        console.error(
          "Frontend: Backend reported success: false for interaction."
        );
        showNotification(`Action failed: ${action}.`, "error");
      }
    } catch (err) {
      console.error(
        `Frontend: Failed to perform ${action} for product ${productId}:`,
        err
      );
      showNotification(
        `Failed to complete action: ${action}. Please try again.`,
        "error"
      );
    }
  };

  const handleCopyCode = (dealId: string, code: string) => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        handleInteraction(dealId, "copy");
        showNotification(`Code "${code}" copied!`);
      })
      .catch((err) => {
        console.error("Frontend: Failed to copy text to clipboard:", err);
        showNotification("Failed to copy code. Please try manually.", "error");
      });
  };

  const handleShopNow = (dealId: string, shopNowLink: string) => {
    window.open(shopNowLink, "_blank", "noopener noreferrer");
    handleInteraction(dealId, "shop");
    showNotification("Redirecting to store...", "success");
  };

  const handleLike = (dealId: string) => {
    handleInteraction(dealId, "like");
    showNotification("Thanks for the feedback!", "success");
  };

  const handleDislike = (dealId: string) => {
    handleInteraction(dealId, "dislike");
    showNotification("Feedback received.", "success");
  };

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Top Deals
        </h2>
        <div className="text-center text-gray-600">Loading top deals...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Top Deals
        </h2>
        <div className="text-center text-red-600">{error}</div>
      </section>
    );
  }

  if (topDeals.length === 0) {
    return (
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Top Deals
        </h2>
        <div className="text-center text-gray-600">
          No top deals available at the moment.
        </div>
      </section>
    );
  }

  const STATIC_FILES_BASE_URL = "http://localhost:5000/uploads";
  // The client-side development server is usually on port 5173 (Vite default)
  // Your public folder is served directly from the root of your client-side dev server.
  const PLACEHOLDER_LOGO_PATH = "/placeholder-logo.png"; // Correct path for files in client/public

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative bg-[#fffffff]">
      {/* Changed section background to a light purple hex color */}
      <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-800 mb-10">
        Top Deals
      </h2>

      {/* Custom Notification */}
      {notificationMessage && (
        <div
          className={`
            fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium text-lg
            transition-all duration-300 ease-in-out transform
            ${notificationType === "success" ? "bg-green-500" : "bg-red-500"}
          `}
          role="alert"
        >
          {notificationMessage}
        </div>
      )}

      {/* Changed to a responsive grid layout */}
      <div className="flex flex-col items-center gap-8">
        {topDeals.map((deal) => (
          <div
            key={deal._id}
            className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col w-full max-w-sm"
          >
            {/* Store Info (Logo + Tag) */}
            <div className="flex flex-col items-start mb-4">
              {/* Conditional rendering for logo and robust onError handler */}
              {/* IMPORTANT: The persistent logo loading issue is likely due to the 'logo' field in your MongoDB database
                  still containing the '/uploads/' prefix. You MUST manually edit your database entries
                  and ensure your backend upload logic saves ONLY the filename (e.g., "oraimo.png"), not "/uploads/oraimo.png".
                  The frontend code below is correctly structured to handle the image path once your backend data is clean. */}
              {deal.store.logo ? (
                <Link to={`/stores/${deal.store.slug}`}>
                  <img
                    src={`${STATIC_FILES_BASE_URL}/${deal.store.logo}`}
                    alt={`${deal.store.name} Logo`}
                    className="w-20 h-auto object-contain mb-1" // Logo size for cards
                    onError={(e) => {
                      // Log the error for debugging
                      console.error(
                        `Failed to load image: ${e.currentTarget.src}. Attempting fallback.`
                      );
                      e.currentTarget.onerror = null; // Prevent infinite loop on error

                      // Try to use a local placeholder image if the original fails
                      // Make sure you have a `placeholder-logo.png` in your `client/public` folder
                      e.currentTarget.src = PLACEHOLDER_LOGO_PATH;
                      e.currentTarget.alt = "Logo not available";
                      e.currentTarget.style.display = "block"; // Ensure it's visible if it was hidden by a previous error
                    }}
                  />
                </Link>
              ) : (
                // Render 'No Logo' placeholder if deal.store.logo is null, undefined, or an empty string
                <div className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded-md mb-1 text-gray-500 text-sm">
                  No Logo
                </div>
              )}

              {deal.store.topDealHeadline && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                  {deal.store.topDealHeadline}
                </span>
              )}
            </div>

            {/* Deal Description - Ensure single line for all screens */}
            <h3 className="text-lg font-bold text-gray-900 mb-4 leading-snug flex-grow truncate whitespace-nowrap overflow-hidden">
              {deal.name}
            </h3>

            {/* Action Buttons - Full width, vertical stack */}
            <div className="flex flex-col space-y-2 mb-4">
              <div className="flex w-full items-center ">
                <span className="flex-1 bg-[#6348db] text-[#f3f0fa] font-semibold rounded-l-md py-2 px-4 text-center truncate">
                  {deal.code}
                </span>
                <button
                  onClick={() => handleCopyCode(deal._id, deal.code)}
                  className="rounded-r-md border-2 border-[#6348db] bg-white py-2 px-4 font-semibold text-[#6348db] transition duration-300 hover:bg-[#f3f0fa] focus:outline-none"
                  style={{ height: "40px" }} // Ensures button matches the code height
                >
                  COPY CODE
                </button>
              </div>
              <button
                onClick={() => handleShopNow(deal._id, deal.shopNowLink)}
                className="w-full bg-[#6348db] text-white font-semibold py-3 px-4 rounded-md hover:bg-[#523aa7] transition duration-300 flex items-center justify-center text-center"
              >
                SHOP NOW
              </button>
            </div>

            {/* Usage Stats and Likes/Dislikes */}
            <div className="flex items-center justify-between text-gray-600 text-sm mt-auto">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleLike(deal._id)}
                  className="flex items-center p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43c0 .542.138 1.05.385 1.5l1.026 1.708a1.659 1.659 0 00.999.688 1.47 1.47 0 00.702 0h2.909c1.028 0 1.872-.844 1.872-1.872V12c0-1.028.844-1.872 1.872-1.872h.068a1.873 1.873 0 001.872-1.873c0-1.027-.845-1.872-1.872-1.872h-1.874a1.873 1.873 0 00-1.872-1.873V5.592c-.023-.393-.197-.775-.494-1.071l-1.472-1.472A1.873 1.873 0 007.828 2H5.092c-.393.023-.775.197-1.071.494L2.549 3.967A1.873 1.873 0 002 5.092v5.241z"></path>
                  </svg>
                </button>
                <button
                  onClick={() => handleDislike(deal._id)}
                  className="flex items-center p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667V4.237c0-.542-.138-1.05-.385-1.5l-1.026-1.708A1.659 1.659 0 0011.59 0a1.47 1.47 0 00-.702 0H7.979c-1.028 0-1.872.844-1.872 1.872V8c0 1.028-.844 1.872-1.872 1.872h-.068A1.873 1.873 0 000 11.745c0 1.027.845 1.872 1.872 1.872h1.874a1.873 1.873 0 001.872 1.873v.812c.023.393.197.775.494 1.071l1.472 1.472A1.873 1.873 0 0012.172 18h2.736c.393-.023.775-.197 1.071-.494l1.472-1.472A1.873 1.873 0 0018 14.908v-5.241z"></path>
                  </svg>
                </button>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <span className="font-semibold text-green-700">
                  {deal.successRate}% SUCCESS
                </span>
                <span className="text-gray-400">•</span>
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1 text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"></path>
                    <path
                      fillRule="evenodd"
                      d="M.661 10.457A10.007 10.007 0 0110 3c2.474 0 4.778.895 6.551 2.378l1.378-1.378a.5.5 0 01.707 0l1.414 1.414a.5.5 0 010 .707l-1.378 1.378C16.895 14.222 14.591 15.0 12.116 15.0a10.007 10.007 0 01-9.339-5.543zM10 17c-2.474 0-4.778-.895-6.551-2.378l-1.378 1.378a.5.5 0 01-.707 0l-1.414-1.414a.5.5 0 010-.707l1.378-1.378C3.105 5.778 5.409 5.0 7.884 5.0a10.007 10.007 0 019.339 5.543z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  {deal.usageCount} Used - {deal.todayUses} Today
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TopDealsSection;
