// src/pages/StoreDetailsPage.tsx
import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useParams } from "react-router-dom"; // Removed Link
import type { IStoreApi } from "@common/types/IStoreTypes";
import type { IProductApi } from "@common/types/IProductTypes";

const StoreDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<IStoreApi | null>(null);
  const [products, setProducts] = useState<IProductApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const STATIC_FILES_BASE_URL =
    import.meta.env.VITE_BACKEND_URL.replace("/api", "") + "/uploads";
  const PLACEHOLDER_IMAGE_PATH = "/placeholder-image.png";

  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const storeResponse = await axiosInstance.get<{
          success: boolean;
          data: IStoreApi;
        }>(`/stores/public/${slug}`);
        setStore(storeResponse.data.data);

        const productsResponse = await axiosInstance.get<{
          success: boolean;
          data: IProductApi[];
        }>(`/products/public/store/${storeResponse.data.data._id}`);
        setProducts(productsResponse.data.data);
      } catch (err: any) {
        console.error("Failed to fetch store details:", err);
        if (err.response && err.response.status === 404) {
          setError("Store not found.");
        } else {
          setError("Failed to load store details. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchStoreDetails();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-[7rem] min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-700">Loading store details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-[7rem] min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <p className="text-lg text-red-600 mb-4">{error}</p>
        <a href="/stores" className="text-purple-600 hover:underline">
          Back to All Stores
        </a>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="pt-[7rem] min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-700">Store not found.</p>
      </div>
    );
  }

  return (
    <div className="pt-[2rem] min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
        {/* Store Header Section */}
        <div className="flex flex-col md:flex-row items-center md:items-start mb-8 border-b pb-6">
          <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
            {store.logo && store.logo !== "no-photo.jpg" ? (
              <img
                src={`${STATIC_FILES_BASE_URL}/${store.logo}`}
                alt={`${store.name} logo`}
                className="w-32 h-32 object-contain rounded-full border border-gray-200 p-2 shadow-sm"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/placeholder-logo.png";
                }}
              />
            ) : (
              <div className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded-full text-lg text-gray-400 border border-dashed border-gray-400">
                No Logo
              </div>
            )}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {store.name}
            </h1>
            {store.topDealHeadline && (
              <p className="text-xl text-purple-700 font-semibold mb-2">
                {store.topDealHeadline}
              </p>
            )}
            {store.tagline && (
              <p className="text-lg text-gray-600 mb-4">{store.tagline}</p>
            )}
            <p className="text-gray-700 leading-relaxed mb-4">
              {store.description}
            </p>
            {store.mainUrl && (
              <a
                href={store.mainUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300"
              >
                Visit Store Website
                <svg
                  className="ml-2 -mr-1 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Products Section */}
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Products from {store.name}
        </h2>

        {products.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">
            No products available for this store yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <img
                  src={
                    product.images && product.images.length > 0
                      ? `${STATIC_FILES_BASE_URL}/${product.images[0]}`
                      : PLACEHOLDER_IMAGE_PATH
                  }
                  alt={product.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = PLACEHOLDER_IMAGE_PATH;
                  }}
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-800 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-gray-700 text-sm line-clamp-2 mb-3">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-lg font-bold text-green-600">
                      $
                      {product.discountedPrice?.toFixed(2) ||
                        product.price?.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {product.discountedPrice
                        ? `$${product.price?.toFixed(2)}`
                        : ""}
                    </span>
                  </div>
                  <a
                    href={product.shopNowUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 w-full inline-block text-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                  >
                    Shop Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreDetailsPage;
