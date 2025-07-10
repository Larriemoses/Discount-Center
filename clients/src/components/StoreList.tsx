// src/components/StoreList.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { AxiosError } from "axios";

interface IStore {
  _id: string;
  name: string;
  description: string;
  slug: string;
  logo?: string;
  topDealHeadline?: string; // <--- ADDED: Headline for the store's main deal page
  createdAt: string;
  updatedAt: string;
}

const StoreList: React.FC = () => {
  const [stores, setStores] = useState<IStore[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get("/stores");
        if (Array.isArray(response.data)) {
          setStores(response.data);
        } else {
          console.error(
            "Backend /stores endpoint did not return an array:",
            response.data
          );
          setError(
            "Failed to load stores: Unexpected data format from server."
          );
        }
      } catch (err) {
        const axiosError = err as AxiosError;
        console.error("Error fetching stores:", axiosError);
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

    fetchStores();
  }, []);

  if (loading) {
    return <p className="text-center text-lg mt-8">Loading stores...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 text-lg mt-8">{error}</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold text-center mb-6">Our Stores</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {stores.length === 0 ? (
          <p className="col-span-full text-center text-gray-600">
            No stores found. Please add some from the backend using Postman.
          </p>
        ) : (
          stores.map((store) => (
            <div
              key={store._id}
              className="bg-white rounded-lg shadow-md p-6 text-center transform hover:scale-105 transition-transform duration-200 ease-in-out flex flex-col items-center"
            >
              {store.logo && store.logo !== "no-photo.jpg" ? (
                <img
                  src={`${import.meta.env.VITE_BACKEND_URL?.replace(
                    "/api",
                    ""
                  )}${store.logo}`}
                  alt={`${store.name} logo`}
                  className="w-32 h-32 object-contain mx-auto mb-4 rounded-md border border-gray-200 p-2"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-200 flex items-center justify-center mx-auto mb-4 rounded-md text-gray-500 text-sm border border-dashed border-gray-400">
                  No Logo
                </div>
              )}
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                {store.name}
              </h3>
              <p className="text-gray-700 text-sm mb-4 flex-grow">
                {store.description}
              </p>
              <Link
                to={`/stores/${store._id}`}
                className="mt-auto block w-full"
              >
                <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200 w-full">
                  View Deals
                </button>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StoreList;
