import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios, { AxiosError } from "axios";
import type { IStore } from "../../../server/src/models/Store"; // Type import for store interface

const StoreListPage: React.FC = () => {
  const [stores, setStores] = useState<IStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Base URL for static files (logos)
  const STATIC_FILES_BASE_URL = "http://localhost:5000/uploads";
  // Assuming you have a placeholder logo in your public folder for missing images
  const PLACEHOLDER_LOGO_PATH = "/placeholder-logo.png";

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch public stores from your backend API
        const response = await axios.get(
          "http://localhost:5000/api/stores/public"
        );

        // Your backend's getPublicStores controller should return { success: true, data: stores }
        if (response.data && Array.isArray(response.data.data)) {
          setStores(response.data.data);
        } else {
          setError("Unexpected data format from server.");
          console.error("Unexpected data format:", response.data);
        }
      } catch (err) {
        const axiosError = err as AxiosError;
        console.error("Failed to fetch public stores:", axiosError);
        if (axiosError.response) {
          setError(
            `Server Error: ${axiosError.response.status} - ${
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
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []); // Empty dependency array means this runs once on component mount

  if (loading) {
    return (
      <div className="pt-[7rem] min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-700">Loading stores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-[7rem] min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <p className="text-lg text-red-600 mb-4">{error}</p>
        <Link to="/" className="text-purple-600 hover:underline">
          Go back to Home
        </Link>
      </div>
    );
  }

  return (
    // Add pt-[7rem] to push content below the fixed Navbar
    <div className="pt-[2rem] min-h-[60vh] sm:p-8">
      <div className="max-w-6xl mx-auto bg-white p-6 ">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8 text-center">
          All Available Stores
        </h1>

        {stores.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">
            No stores are available at the moment. Please check back later!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <Link
                key={store._id as string} // Explicitly cast _id to string for the key prop
                to={`/stores/${store.slug}`} // Link to the store's details page
                className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-center mb-3">
                    {store.logo && store.logo !== "no-photo.jpg" ? (
                      <img
                        src={`${STATIC_FILES_BASE_URL}/${store.logo}`}
                        alt={`${store.name} logo`}
                        className="w-16 h-16 object-contain rounded-full mr-4 border border-gray-200 p-1"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = PLACEHOLDER_LOGO_PATH;
                          e.currentTarget.alt = "Store Logo Not Found";
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-full mr-4 text-xs text-gray-400 border border-dashed border-gray-400">
                        No Logo
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 line-clamp-1">
                        {store.name}
                      </h2>
                      {store.topDealHeadline && (
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {store.topDealHeadline}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm line-clamp-3 mb-4">
                    {store.description}
                  </p>
                  <div className="text-purple-600 hover:text-purple-800 font-medium text-sm">
                    View Deals &rarr;
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreListPage;
