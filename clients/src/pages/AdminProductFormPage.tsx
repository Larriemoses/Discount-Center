// client/src/pages/AdminProductFormPage.tsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
// Only import the types (interfaces) for Product and Store
import type { IProduct } from "../../../server/src/models/Product";
import type { IStore } from "../../../server/src/models/Store";

const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>(); // 'id' will be present for edit mode
  const navigate = useNavigate();
  const adminToken = localStorage.getItem("adminToken");

  // --- Form state for ONLY the product fields you want to fill ---
  const [name, setName] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [shopNowUrl, setShopNowUrl] = useState("");
  const [images, setImages] = useState<FileList | null>(null); // For new image files
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]); // For images already on the server
  const [selectedStore, setSelectedStore] = useState(""); // To select the product's store

  // State for fetching data and submission
  const [stores, setStores] = useState<IStore[]>([]);
  const [loading, setLoading] = useState(true); // For initial data fetch
  const [error, setError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false); // For form submission

  // --- Effect to fetch stores and product data (if in edit mode) ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(""); // Clear previous errors
      try {
        // Fetch all stores (needed for both add and edit mode to select a store)
        const storesResponse = await axios.get(
          "http://localhost:5000/api/stores",
          {
            headers: { Authorization: `Bearer ${adminToken}` },
          }
        );
        // Ensure you're accessing the data correctly based on your API's response structure
        // If it's { success: true, data: [...] }, then storesResponse.data.data
        // If it's just [...], then storesResponse.data
        setStores(storesResponse.data.data || storesResponse.data);

        // If 'id' exists, we are in edit mode: fetch product data
        if (id) {
          const productResponse = await axios.get(
            `http://localhost:5000/api/products/${id}`,
            {
              headers: { Authorization: `Bearer ${adminToken}` },
            }
          );
          const product: IProduct = productResponse.data;

          setName(product.name);
          setDiscountCode(product.discountCode);
          setShopNowUrl(product.shopNowUrl);

          // Populate existing image URLs for display
          setExistingImageUrls(product.images || []);

          // Set selected store if product has one (handle populated vs. ID)
          if (product.store) {
            // Check if product.store is an object (meaning it's populated)
            if (
              typeof product.store === "object" &&
              product.store !== null &&
              "_id" in product.store
            ) {
              // It's a populated IStore object, use its _id
              setSelectedStore(String(product.store._id)); // Ensure it's a string
            } else {
              // It's likely just the ObjectId string
              setSelectedStore(String(product.store)); // Ensure it's a string
            }
          } else {
            setSelectedStore(""); // No store selected
          }
          // Do NOT set state for description, price, category, etc., as they are not needed in the form
        }
      } catch (err: any) {
        console.error("Failed to fetch data:", err);
        setError(
          "Failed to load data: " + (err.response?.data?.message || err.message)
        );
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate("/admin/login"); // Redirect to login if unauthorized
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, adminToken]);

  // --- Handle form submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(""); // Clear previous submission errors

    const formData = new FormData();
    formData.append("name", name);
    formData.append("discountCode", discountCode);
    formData.append("shopNowUrl", shopNowUrl);

    // Only append images if new ones are selected
    if (images) {
      for (let i = 0; i < images.length; i++) {
        formData.append("images", images[i]);
      }
    }

    try {
      if (!selectedStore && !id) {
        // Only require store for new products, not updates
        setError("Please select a store.");
        setSubmitLoading(false);
        return;
      }

      let response;
      if (id) {
        // --- EDIT PRODUCT ---
        // When editing, we typically don't change the store via the URL.
        // If you allow changing the store of an existing product, append it to FormData.
        // Otherwise, the backend updates the product by its ID.
        // If your backend PUT /api/products/:id expects 'store' in body to change it, add this:
        if (selectedStore) formData.append("store", selectedStore);

        response = await axios.put(
          `http://localhost:5000/api/products/${id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${adminToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        alert("Product updated successfully!");
      } else {
        // --- ADD NEW PRODUCT ---
        // For new products, the store ID must be in the URL path as per your API.
        response = await axios.post(
          `http://localhost:5000/api/products/stores/${selectedStore}/products`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${adminToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        alert("Product added successfully!");
      }
      console.log("Submission successful:", response.data);
      navigate("/admin/products"); // Redirect back to product list after success
    } catch (err: any) {
      console.error("Submission failed:", err.response?.data || err);
      // More specific error message if available from backend
      setError(
        "Submission failed: " +
          (err.response?.data?.error ||
            err.response?.data?.message ||
            err.message)
      );
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate("/admin/login");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // Conditional rendering for loading and error states
  if (loading) return <div className="text-center p-8">Loading form...</div>;
  if (error && !submitLoading && !id)
    return <div className="text-center p-8 text-red-600">{error}</div>; // Only show fetch error if not submitting and not editing

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          {id ? "Edit Product" : "Add New Product"}
        </h1>
        {error && submitLoading && (
          <div className="text-red-600 mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Store Selection (required for new products) */}
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
                  <option key={store._id as string} value={store._id as string}>
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

          {/* Product Name */}
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

          {/* Discount Code */}
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

          {/* Shop Now URL */}
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

          {/* Image Upload */}
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
                    src={`http://localhost:5000${url}`} // Adjust path if needed
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

          {/* Submit Button and Back to Dashboard Button */}
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
