// src/pages/AdminProductFormPage.tsx

import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate, useParams, Link } from "react-router-dom";
import type { IProductApi } from "@common/types/IProductTypes";
import type { IStoreApi } from "@common/types/IStoreTypes";
import { motion } from "framer-motion";

// Define interfaces for API responses (matching backend structure)
interface SingleProductApiResponse {
  success: boolean;
  data: IProductApi;
}

interface StoresApiResponse {
  success: boolean;
  count: number;
  data: IStoreApi[];
}

const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const adminToken = localStorage.getItem("adminToken");

  const [name, setName] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [shopNowUrl, setShopNowUrl] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [selectedStore, setSelectedStore] = useState("");

  const [stores, setStores] = useState<IStoreApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  // New state for notifications
  const [notificationMessage, setNotificationMessage] = useState<string | null>(
    null
  );
  const [notificationType, setNotificationType] = useState<
    "success" | "error" | null
  >(null);

  const backendRootUrl = import.meta.env.VITE_BACKEND_URL.replace("/api", "");

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

  useEffect(() => {
    const fetchData = async () => {
      if (!adminToken) {
        navigate("/admin/login");
        return;
      }
      setLoading(true);
      setError("");
      try {
        const storesResponse = await axiosInstance.get<StoresApiResponse>(
          "/stores",
          {
            headers: { Authorization: `Bearer ${adminToken}` },
          }
        );
        setStores(storesResponse.data.data || []);

        if (id) {
          const productResponse =
            await axiosInstance.get<SingleProductApiResponse>(
              `/products/${id}`,
              {
                headers: { Authorization: `Bearer ${adminToken}` },
              }
            );

          // Bug fix: Add a check to ensure product data exists before setting state
          const product = productResponse.data?.data;
          if (!product) {
            throw new Error("Product data not found in the response.");
          }

          setName(product.name);
          setDiscountCode(product.discountCode);
          setShopNowUrl(product.shopNowUrl);
          setExistingImageUrls(product.images || []);

          if (product.store) {
            const storeId =
              typeof product.store === "object"
                ? product.store._id
                : product.store;
            setSelectedStore(String(storeId));
          } else {
            setSelectedStore("");
          }
        }
      } catch (err: any) {
        console.error("Failed to fetch data:", err);
        setError(
          "Failed to load data. Please ensure the server is running and you are logged in."
        );
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate("/admin/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, adminToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("discountCode", discountCode);
    formData.append("shopNowUrl", shopNowUrl);
    if (selectedStore) formData.append("store", selectedStore);

    if (images) {
      for (let i = 0; i < images.length; i++) {
        formData.append("images", images[i]);
      }
    }

    try {
      if (!selectedStore && !id) {
        setError("Please select a store.");
        setSubmitLoading(false);
        return;
      }

      let response;
      if (id) {
        response = await axiosInstance.put(`/products/${id}`, formData, {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "Content-Type": "multipart/form-data",
          },
        });
        showNotification("Product updated successfully!");
      } else {
        response = await axiosInstance.post(
          `/products/stores/${selectedStore}/products`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${adminToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        showNotification("Product added successfully!");
      }
      console.log("Submission successful:", response.data);
      navigate("/admin/products");
    } catch (err: any) {
      console.error("Submission failed:", err.response?.data || err);
      setError(
        "Submission failed: " +
          (err.response?.data?.error ||
            err.response?.data?.message ||
            err.message)
      );
      showNotification(
        "Submission failed: " + (err.response?.data?.message || err.message),
        "error"
      );
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate("/admin/login");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // Improved conditional rendering to show error if fetch fails
  if (loading) return <div className="text-center p-8">Loading form...</div>;
  if (error)
    return (
      <div className="text-center p-8 text-red-600 font-bold">{error}</div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {notificationMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-2 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium text-lg transition-all duration-300 ease-in-out transform ${
            notificationType === "success" ? "bg-green-500" : "bg-red-500"
          }`}
          role="alert"
        >
          {notificationMessage}
        </motion.div>
      )}
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          {id ? "Edit Product" : "Add New Product"}
        </h1>
        {error && <div className="text-red-600 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!id && (
            <div className="mb-4">
              <label
                htmlFor="store"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Select Store: <span className="text-red-500">*</span>
              </label>
              <select
                id="store"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                required
              >
                <option value="">-- Select a Store --</option>
                {stores.map((store) => (
                  <option key={store._id} value={store._id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {id && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Current Store:
              </label>
              <p className="text-gray-900 text-lg">
                {stores.find((store) => store._id === selectedStore)?.name ||
                  "Loading..."}
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Product Name: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="discountCode"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Discount Code: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="discountCode"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="shopNowUrl"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Shop Now URL: <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              id="shopNowUrl"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={shopNowUrl}
              onChange={(e) => setShopNowUrl(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="images"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Product Images: (Optional)
            </label>
            <input
              type="file"
              id="images"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              multiple
              accept="image/*"
              onChange={(e) => setImages(e.target.files)}
            />
            {existingImageUrls.length > 0 && (
              <div className="mt-2 grid grid-cols-4 gap-2">
                {existingImageUrls.map((url, index) => (
                  <img
                    key={index}
                    src={`${backendRootUrl}${url}`}
                    alt={`Existing Product Image ${index + 1}`}
                    className="w-24 h-24 object-cover rounded shadow"
                  />
                ))}
              </div>
            )}
            {id && (
              <p className="text-xs text-gray-500 mt-1">
                Select new images to replace existing ones. (Future: Add
                individual image deletion)
              </p>
            )}
          </div>

          <div className="flex justify-between items-center mt-6">
            <Link
              to="/admin/dashboard"
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300"
            >
              Back to Dashboard
            </Link>
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300"
              disabled={submitLoading}
            >
              {submitLoading
                ? "Saving..."
                : id
                ? "Update Product"
                : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProductFormPage;
