// client/src/pages/StoreDetailsPage.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
// Ensure this path is correct based on your client/src/ folder structure relative to server/src/models/Store
import type { IStore } from "../../../server/src/models/Store";

const StoreDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>(); // Get slug from URL
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
        // Fetch store details using the new public route by slug
        const response = await axios.get(
          `http://localhost:5000/api/stores/by-slug/${slug}`
        );
        setStore(response.data.data); // Assuming response.data.data
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
  }, [slug]); // Rerun when slug changes

  if (loading) return <div className="text-center p-8">Loading store...</div>;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;
  if (!store)
    return (
      <div className="text-center p-8 text-gray-600">Store not found.</div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">{store.name}</h1>
        {store.logo && store.logo !== "no-photo.jpg" && (
          <img
            src={`http://localhost:5000${store.logo}`}
            alt={store.name}
            className="w-32 h-32 object-cover rounded-full mb-4"
          />
        )}
        <p className="text-gray-700 mb-4">{store.description}</p>
        <p className="text-gray-600">Slug: {store.slug}</p>
        {/* You can list products related to this store here later */}
        <h2 className="text-2xl font-bold mt-8 mb-4">
          Products from {store.name}
        </h2>
        {/* Placeholder for products */}
        <p>Products will be listed here soon...</p>
      </div>
    </div>
  );
};

export default StoreDetailsPage;
