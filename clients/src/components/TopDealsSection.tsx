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
  likes: number;
  dislikes: number;
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

interface TopDealsSectionProps {
  className?: string;
}

const TopDealsSection: React.FC<TopDealsSectionProps> = ({ className }) => {
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

  const getTodayDateString = () => new Date().toDateString();

  const fetchTopDeals = useCallback(async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/products/top-deals`
      );
      let fetchedDeals: IProduct[] = response.data.data.map((deal: any) => ({
        ...deal,
        usageCount: deal.totalUses,
        code: deal.discountCode,
        shopNowLink: deal.shopNowUrl,
      }));

      const forceResetKey = "forceResetTodayUses_TopDealsSection";
      const lastForceResetDate = localStorage.getItem(forceResetKey);
      const today = getTodayDateString();

      if (lastForceResetDate !== today) {
        fetchedDeals = fetchedDeals.map((deal) => ({ ...deal, todayUses: 0 }));
        localStorage.setItem(forceResetKey, today);
      }

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
    action: "copy" | "shop"
  ) => {
    try {
      const response = await axios.post<{
        success: boolean;
        data: IProductInteractionResponseData;
      }>(`${import.meta.env.VITE_BACKEND_URL}/products/${productId}/interact`, {
        action,
      });

      if (response.data.success) {
        const updatedData = response.data.data;
        setTopDeals((prevDeals) =>
          prevDeals.map((deal) =>
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
          )
        );
      } else {
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
        console.error("Clipboard copy failed:", err);
        showNotification("Failed to copy code. Please try manually.", "error");
      });
  };

  const handleShopNow = (dealId: string, shopNowLink: string) => {
    window.open(shopNowLink, "_blank", "noopener noreferrer");
    handleInteraction(dealId, "shop");
    showNotification("Redirecting to store...", "success");
  };

  const STATIC_FILES_BASE_URL =
    import.meta.env.VITE_BACKEND_URL.replace("/api", "") + "/uploads";
  const PLACEHOLDER_LOGO_PATH = "/placeholder-logo.png";

  if (loading) {
    return (
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
    <section
      className={`${
        className || ""
      } pb-12 relative bg-white container mx-auto px-4 sm:px-6 lg:px-8`}
    >
      <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-800 mb-10">
        Top Deals
      </h2>

      {notificationMessage && (
        <div
          className={`fixed top-2 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium text-lg transition-all duration-300 ease-in-out transform ${
            notificationType === "success" ? "bg-green-500" : "bg-red-500"
          }`}
          role="alert"
        >
          {notificationMessage}
        </div>
      )}

      <div className="flex flex-col items-center gap-8">
        {topDeals.map((product) => {
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
                <div className="flex items-center space-x-2 text-gray-600">
                  <span className="font-semibold text-green-700">
                    {product.successRate}% SUCCESS
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="flex items-center">
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
