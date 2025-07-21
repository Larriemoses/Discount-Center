// src/pages/HomePage.tsx
import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { Link } from "react-router-dom";
import type { IProductApi } from "@common/types/IProductTypes"; // Use IProductApi
import type { IStoreApi } from "@common/types/IStoreTypes"; // Use IStoreApi
// Removed unused Footer import

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<IProductApi[]>([]); // Use IProductApi
  const [stores, setStores] = useState<IStoreApi[]>([]); // Use IStoreApi
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const STATIC_FILES_BASE_URL =
    import.meta.env.VITE_BACKEND_URL.replace("/api", "") + "/uploads";
  const PLACEHOLDER_IMAGE_PATH = "/placeholder-image.png"; // Assuming you have a placeholder image

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [productsResponse, storesResponse] = await Promise.all([
          axiosInstance.get<{ success: boolean; data: IProductApi[] }>(
            "/products/public"
          ), // Use IProductApi
          axiosInstance.get<{ success: boolean; data: IStoreApi[] }>(
            "/stores/public"
          ), // Use IStoreApi
        ]);

        if (
          productsResponse.data &&
          Array.isArray(productsResponse.data.data)
        ) {
          setProducts(productsResponse.data.data);
        } else {
          setError("Unexpected product data format.");
          console.error(
            "Unexpected product data format:",
            productsResponse.data
          );
        }

        if (storesResponse.data && Array.isArray(storesResponse.data.data)) {
          setStores(storesResponse.data.data);
        } else {
          setError("Unexpected store data format.");
          console.error("Unexpected store data format:", storesResponse.data);
        }
      } catch (err: any) {
        console.error("Failed to fetch data for home page:", err);
        setError("Failed to load home page data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="pt-[7rem] min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-700">Loading amazing deals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-[7rem] min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <p className="text-lg text-red-600 mb-4">{error}</p>
        <Link to="/" className="text-purple-600 hover:underline">
          Reload Page
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-[2rem] min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Featured Products
        </h1>

        {products.length === 0 ? (
          <p className="text-center text-gray-600 text-lg mb-8">
            No featured products available at the moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {products.slice(0, 6).map((product) => (
              <Link
                key={product._id}
                to={`/stores/${
                  typeof product.store === "object" ? product.store.slug : ""
                }`} // Assuming store is populated for slug
                className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
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
                  <h2 className="text-xl font-semibold text-gray-800 line-clamp-1">
                    {product.name}
                  </h2>
                  {typeof product.store === "object" &&
                    product.store !== null && (
                      <p className="text-sm text-gray-600 line-clamp-1">
                        From: {product.store.name}
                      </p>
                    )}
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
                  <button className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                    Shop Now
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}

        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Explore Our Stores
        </h1>

        {stores.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">
            No stores available at the moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.slice(0, 6).map((store) => (
              <Link
                key={store._id}
                to={`/stores/${store.slug}`}
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
                          e.currentTarget.src = "/placeholder-logo.png"; // Placeholder for missing logo
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
      {/* <Footer /> */} {/* Removed Footer component as it's not imported */}
    </div>
  );
};

export default HomePage;
