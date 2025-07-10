// client/src/pages/AdminProductFormPage.tsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import type { IProduct } from "../../../server/src/models/Product";
import type { IStore } from "../../../server/src/models/Store";

const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>(); // 'id' will be present for edit mode
  const navigate = useNavigate();
  const adminToken = localStorage.getItem("adminToken");

  // Form state for product fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [discountedPrice, setDiscountedPrice] = useState<number | string>("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState<number | string>("");
  const [isActive, setIsActive] = useState(true);
  const [discountCode, setDiscountCode] = useState("");
  const [shopNowUrl, setShopNowUrl] = useState("");
  const [successRate, setSuccessRate] = useState<number | string>("");
  const [totalUses, setTotalUses] = useState<number | string>("");
  const [todayUses, setTodayUses] = useState<number | string>("");
  const [images, setImages] = useState<FileList | null>(null); // For new image files
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]); // For images already on the server
  const [selectedStore, setSelectedStore] = useState(""); // To select the product's store

  // State for fetching data
  const [stores, setStores] = useState<IStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  // --- Effect to fetch stores and product data (if in edit mode) ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch all stores (needed for both add and edit mode to select a store)
        const storesResponse = await axios.get(
          "http://localhost:5000/api/stores",
          {
            headers: { Authorization: `Bearer ${adminToken}` },
          }
        );
        setStores(storesResponse.data.data || storesResponse.data); // Adjust based on your API response

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
          setDescription(product.description);
          setPrice(product.price);
          setDiscountedPrice(product.discountedPrice || "");
          setCategory(product.category || "");
          setStock(product.stock);
          setIsActive(product.isActive);
          setDiscountCode(product.discountCode);
          setShopNowUrl(product.shopNowUrl);
          setSuccessRate(product.successRate || "");
          setTotalUses(product.totalUses || "");
          setTodayUses(product.todayUses || "");

          // Populate existing image URLs for display
          setExistingImageUrls(product.images || []);

          // Set selected store if product has one (handle populated vs. ID)
          if (product.store) {
            setSelectedStore(
              typeof product.store === "object"
                ? typeof (product.store as any)._id === "string"
                  ? (product.store as any)._id
                  : String((product.store as any)._id)
                : String(product.store)
            );
          }
        }
      } catch (err: any) {
        console.error("Failed to fetch data:", err);
        setError(
          "Failed to load data: " + (err.response?.data?.message || err.message)
        );
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate("/admin/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, adminToken]); // Re-run if ID changes (for navigation between edit/new)

  // --- Handle form submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", String(price));
    if (discountedPrice !== "")
      formData.append("discountedPrice", String(discountedPrice));
    if (category) formData.append("category", category);
    formData.append("stock", String(stock));
    formData.append("isActive", String(isActive));
    formData.append("discountCode", discountCode);
    formData.append("shopNowUrl", shopNowUrl);
    if (successRate !== "") formData.append("successRate", String(successRate));
    if (totalUses !== "") formData.append("totalUses", String(totalUses));
    if (todayUses !== "") formData.append("todayUses", String(todayUses));

    // Append new image files
    if (images) {
      for (let i = 0; i < images.length; i++) {
        formData.append("images", images[i]);
      }
    }
    // For update, you might need to send a flag if images were explicitly removed or only new ones added
    // For simplicity, we'll assume new images replace old ones, or old ones persist if no new are added.
    // Or you could send `existingImageUrls` back to let backend handle deletion/retention.
    // For now, let's assume `Multer` handles replacements if new files are sent.

    // Crucially, send the selected store ID
    if (selectedStore) {
      // For create, this is the storeId in the URL
      // For update, this becomes a field in the body if you allow changing product's store
      // We'll rely on the URL for create, and send as body field if store can be changed on update.
      // For now, we need it for the POST URL for new product.
      // If updating, you might not send `store` in the body if it's not allowed to change.
      // But for creation, it MUST be in the URL.
    } else if (!id) {
      // Only require store selection for new products
      setError("Please select a store.");
      setSubmitLoading(false);
      return;
    }

    try {
      if (id) {
        // --- EDIT PRODUCT ---
        // For update, the store ID might not be in the URL path, but the existing product has it.
        // We need to send the `store` in the FormData if the product's store can be changed.
        // If not, simply update based on product ID.
        // If your PUT route requires the storeId in the path, we need to get it from `product.store`
        // or ensure `selectedStore` is valid.
        // Let's assume your PUT route is `PUT /api/products/:id` (which it is)
        // and doesn't require storeId in path, and product's store can be implicitly updated via product.store
        if (selectedStore) formData.append("store", selectedStore); // Send store ID if allowed to change on update

        const response = await axios.put(
          `http://localhost:5000/api/products/${id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${adminToken}`,
              "Content-Type": "multipart/form-data", // Important for file uploads
            },
          }
        );
        alert("Product updated successfully!");
      } else {
        // --- ADD NEW PRODUCT ---
        // The create product route is POST /api/products/stores/:storeId/products
        if (!selectedStore) {
          setError("Please select a store for the new product.");
          setSubmitLoading(false);
          return;
        }
        const response = await axios.post(
          `http://localhost:5000/api/products/stores/${selectedStore}/products`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${adminToken}`,
              "Content-Type": "multipart/form-data", // Important for file uploads
            },
          }
        );
        alert("Product added successfully!");
      }
      navigate("/admin/products"); // Redirect back to product list after success
    } catch (err: any) {
      console.error("Submission failed:", err.response?.data || err);
      setError(
        "Submission failed: " + (err.response?.data?.message || err.message)
      );
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate("/admin/login");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <div className="text-center p-8">Loading form...</div>;
  if (error && !submitLoading)
    return <div className="text-center p-8 text-red-600">{error}</div>; // Only show fetch error if not submitting

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          {id ? "Edit Product" : "Add New Product"}
        </h1>
        {error && submitLoading && (
          <div className="text-red-600 mb-4">{error}</div>
        )}{" "}
        {/* Show submission error */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Store Selection (required for new products) */}
          {!id && ( // Only show store selection for new products
            <div className="mb-4">
              <label
                htmlFor="store"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Select Store:
              </label>
              <select
                id="store"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                required={!id} // Required only for new products
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
          {id && ( // Display current store name for edit mode
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Current Store:
              </label>
              <p className="text-gray-900 text-lg">
                {stores.find((store) => store._id === selectedStore)?.name ||
                  "Loading..."}
              </p>
              {/* Optionally allow changing store on edit, or make it read-only */}
              {/* For now, it's read-only implied if you don't allow changing `selectedStore` after initial fetch */}
            </div>
          )}

          {/* Product Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Product Name:
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

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Description:
            </label>
            <textarea
              id="description"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          {/* Price */}
          <div>
            <label
              htmlFor="price"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Price ($):
            </label>
            <input
              type="number"
              id="price"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="0"
              step="0.01"
            />
          </div>

          {/* Discounted Price */}
          <div>
            <label
              htmlFor="discountedPrice"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Discounted Price ($):
            </label>
            <input
              type="number"
              id="discountedPrice"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={discountedPrice}
              onChange={(e) => setDiscountedPrice(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Category:
            </label>
            <input
              type="text"
              id="category"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          {/* Stock */}
          <div>
            <label
              htmlFor="stock"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Stock:
            </label>
            <input
              type="number"
              id="stock"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              min="0"
            />
          </div>

          {/* Images */}
          <div>
            <label
              htmlFor="images"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Product Images:
            </label>
            <input
              type="file"
              id="images"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              multiple // Allow multiple files
              accept="image/*" // Only accept image files
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

          {/* Discount Code */}
          <div>
            <label
              htmlFor="discountCode"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Discount Code:
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
              Shop Now URL:
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

          {/* Success Rate */}
          <div>
            <label
              htmlFor="successRate"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Success Rate (%):
            </label>
            <input
              type="number"
              id="successRate"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={successRate}
              onChange={(e) => setSuccessRate(e.target.value)}
              min="0"
              max="100"
              step="0.01"
            />
          </div>

          {/* Total Uses */}
          <div>
            <label
              htmlFor="totalUses"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Total Uses:
            </label>
            <input
              type="number"
              id="totalUses"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={totalUses}
              onChange={(e) => setTotalUses(e.target.value)}
              min="0"
            />
          </div>

          {/* Today Uses */}
          <div>
            <label
              htmlFor="todayUses"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Today Uses:
            </label>
            <input
              type="number"
              id="todayUses"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={todayUses}
              onChange={(e) => setTodayUses(e.target.value)}
              min="0"
            />
          </div>

          {/* Is Active Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              className="mr-2 leading-tight"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <label
              htmlFor="isActive"
              className="text-gray-700 text-sm font-bold"
            >
              Is Active
            </label>
          </div>

          {/* Submit Button and Back to Dashboard Button */}
          <div className="flex justify-between items-center mt-6">
            {" "}
            {/* <--- Modified div for spacing */}
            <Link
              to="/admin/dashboard" // <--- Link to Admin Dashboard
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
