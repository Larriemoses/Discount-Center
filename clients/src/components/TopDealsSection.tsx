// client/src/components/TopDealsSection.tsx

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

interface IStore {
  _id: string;
  name: string;
  logo?: string | null;
  slug: string;
  topDealHeadline?: string;
}

interface IProduct {
  _id: string;
  name: string;
  code: string;
  shopNowLink: string;
  usageCount: number;
  successRate: number;
  todayUses: number;
  store: IStore;
  likes: number; // Still in interface, but not used in UI
  dislikes: number; // Still in interface, but not used in UI
  discountType?: string;
  discountValue?: number;
}

interface IProductInteractionResponseData {
  _id: string;
  totalUses: number;
  todayUses: number;
  successRate: number;
  likes: number;
  dislikes: number;
}

// Extend React.FC to accept a 'className' prop
interface TopDealsSectionProps {
  className?: string; // Add this line
}

const TopDealsSection: React.FC<TopDealsSectionProps> = ({ className }) => {
  // Destructure className
  const [topDeals, setTopDeals] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [notificationMessage, setNotificationMessage] = useState<string | null>(
    null
  );
  const [notificationType, setNotificationType] = useState<
    "success" | "error" | null
  >(null);

  const showNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setNotificationMessage(message);
    setNotificationType(type);
    setTimeout(() => {
      setNotificationMessage(null);
      setNotificationType(null);
    }, 3000);
  };

  // Helper to get today's date string for localStorage keys
  const getTodayDateString = () => new Date().toDateString();

  const fetchTopDeals = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/products/top-deals"
      );
      console.log("Frontend: Initial fetch response data:", response.data.data);

      let fetchedDeals: IProduct[] = response.data.data.map((deal: any) => ({
        ...deal,
        usageCount: deal.totalUses,
        code: deal.discountCode,
        shopNowLink: deal.shopNowUrl,
      }));

      // --- ONE-TIME FRONTEND FORCE RESET LOGIC (FOR `TopDealsSection.tsx`) ---
      const forceResetKey = "forceResetTodayUses_TopDealsSection";
      const lastForceResetDate = localStorage.getItem(forceResetKey);
      const today = getTodayDateString();

      if (lastForceResetDate !== today) {
        console.log(
          "TopDealsSection: Performing one-time force reset of 'todayUses'."
        );
        fetchedDeals = fetchedDeals.map((deal) => ({
          ...deal,
          todayUses: 0, // Force reset to 0
        }));
        localStorage.setItem(forceResetKey, today); // Mark as done for today
      } else {
        console.log("TopDealsSection: One-time force reset already ran today.");
      }
      // --- END ONE-TIME FRONTEND FORCE RESET LOGIC ---

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

  const handleInteraction = async (
    productId: string,
    action: "copy" | "shop" // Removed 'like' | 'dislike'
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
                  likes: updatedData.likes, // Still update if backend sends, but not displayed
                  dislikes: updatedData.dislikes, // Still update if backend sends, but not displayed
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

  // Removed handleLike and handleDislike functions

  const STATIC_FILES_BASE_URL = "http://localhost:5000/uploads";
  const PLACEHOLDER_LOGO_PATH = "/placeholder-logo.png";

  if (loading) {
    return (
      // Apply the className prop here, combined with other classes
      <section className={`${className || ""} pb-12 container mx-auto px-4`}>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Top Deals
        </h2>
        <div className="text-center text-gray-600">Loading top deals...</div>
      </section>
    );
  }

  if (error) {
    return (
      // Apply the className prop here
      <section className={`${className || ""} pb-12 container mx-auto px-4`}>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Top Deals
        </h2>
        <div className="text-center text-red-600">{error}</div>
      </section>
    );
  }

  if (topDeals.length === 0) {
    return (
      // Apply the className prop here
      <section className={`${className || ""} pb-12 container mx-auto px-4`}>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Top Deals
        </h2>
        <div className="text-center text-gray-600">
          No top deals available at the moment.
        </div>
      </section>
    );
  }

  return (
    // Apply the className prop here to the main section
    <section
      className={`${
        className || ""
      } pb-12 relative bg-[#ffffff] container mx-auto px-4 sm:px-6 lg:px-8`}
    >
      <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-800 mb-10">
        Top Deals
      </h2>

      {notificationMessage && (
        <div
          className={`
            fixed top-2 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium text-lg
            transition-all duration-300 ease-in-out transform
            ${notificationType === "success" ? "bg-green-500" : "bg-red-500"}
          `}
          role="alert"
        >
          {notificationMessage}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
        {topDeals.map((deal) => {
          const product = deal;
          const logoSrc =
            product.store?.logo && product.store.logo !== "no-photo.jpg"
              ? `${STATIC_FILES_BASE_URL}/${product.store.logo}`
              : PLACEHOLDER_LOGO_PATH;

          return (
            <div
              key={product._id}
              className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col w-full max-w-sm"
            >
              <div className="flex flex-col items-start mb-4">
                {product.store?.logo &&
                product.store.logo !== "no-photo.jpg" ? (
                  <Link to={`/stores/${product.store.slug}`}>
                    <img
                      src={logoSrc}
                      alt={`${product.store.name} Logo`}
                      className="w-20 h-auto object-contain mb-1"
                      onError={(e) => {
                        console.error(
                          `Failed to load image: ${e.currentTarget.src}. Attempting fallback.`
                        );
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = PLACEHOLDER_LOGO_PATH;
                        e.currentTarget.alt = "Logo not available";
                        e.currentTarget.style.display = "block";
                      }}
                    />
                  </Link>
                ) : (
                  <div className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded-md mb-1 text-gray-500 text-sm">
                    No Logo
                  </div>
                )}

                {product.store?.topDealHeadline && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                    {product.store.topDealHeadline}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-4 leading-snug flex-grow truncate whitespace-nowrap overflow-hidden">
                {product.name}
              </h3>

              <div className="flex flex-col space-y-2 mb-4">
                <div className="flex w-full items-stretch">
                  <span className="flex-1 bg-[#6348db] text-[#f3f0fa] font-semibold rounded-l-md py-2 px-4 text-center truncate">
                    {product.code}
                  </span>
                  <button
                    onClick={() => handleCopyCode(product._id, product.code)}
                    className="rounded-r-md border-2 border-[#6348db] bg-white py-2 px-4 font-semibold text-[#6348db] transition duration-300 hover:bg-[#f3f0fa] focus:outline-none"
                    style={{ height: "40px" }}
                  >
                    COPY CODE
                  </button>
                </div>
                <button
                  onClick={() =>
                    handleShopNow(product._id, product.shopNowLink)
                  }
                  className="w-full bg-[#6348db] text-white font-semibold py-3 px-4 rounded-md hover:bg-[#523aa7] transition duration-300 flex items-center justify-center text-center"
                >
                  SHOP NOW
                </button>
              </div>

              <div className="flex items-center justify-end text-gray-600 text-sm mt-auto">
                {" "}
                {/* Changed justify-between to justify-end */}
                {/* Removed Like/Dislike Buttons */}
                <div className="flex items-center space-x-2 text-gray-600">
                  <span className="font-semibold text-green-700">
                    {product.successRate}% SUCCESS
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
                    {product.usageCount} Used - {product.todayUses} Today
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TopDealsSection;
