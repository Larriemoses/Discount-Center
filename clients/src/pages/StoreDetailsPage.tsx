// client/src/pages/StoreDetailsPage.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import type { IStore } from "../../../server/src/models/Store";

const StoreDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<IStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStore = async () => {
      if (!slug) {
        setError("No store slug provided.");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(
          `http://localhost:5000/api/stores/by-slug/${slug}`
        );
        setStore(response.data.data);
      } catch (err: any) {
        console.error("Failed to fetch store details:", err);
        setError(
          "Failed to load store details. " +
            (err.response?.data?.message || "Server error.")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
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
        {/* Centered Header Section: Logo, Main Title (Name), Subtitle (Top Deal Headline), Sub-subtitle (Tagline) */}
        <div className="flex flex-col items-center mb-6 text-center">
          {store.logo && store.logo !== "no-photo.jpg" ? (
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 flex items-center justify-center rounded-full overflow-hidden mb-4 shadow-sm">
              <img
                src={`http://localhost:5000/uploads/${store.logo}`}
                alt={store.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 flex items-center justify-center rounded-full mb-4 text-xs text-gray-400 shadow-sm">
              No Logo
            </div>
          )}

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

          {/* Sub-subtitle (Tagline) - NOW USES THE DEDICATED FIELD */}
          {store.tagline && (
            <p className="text-lg sm:text-xl text-gray-600 max-w-prose">
              {store.tagline}
            </p>
          )}
        </div>

        {/* Full Store Description */}
        {store.description && (
          <div className="mb-6 border-t border-gray-200 pt-6 mt-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
              Full Description
            </h2>
            <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
              {store.description}
            </p>
          </div>
        )}

        {/* Products section */}
        <h2 className="text-xl sm:text-2xl font-bold mt-8 mb-4 text-gray-800">
          Products from {store.name}
        </h2>
        {/* Placeholder for products */}
        <p className="text-gray-600">Products will be listed here soon...</p>
      </div>
    </div>
  );
};

export default StoreDetailsPage;
