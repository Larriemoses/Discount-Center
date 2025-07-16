// client/src/pages/AdminProductListPage.tsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import type { IProduct } from "../../../server/src/models/Product";
import type { IStore } from "../../../server/src/models/Store"; // Make sure IStore is correctly imported if used in IProduct

const AdminProductListPage: React.FC = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // State for custom confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [productIdToDelete, setProductIdToDelete] = useState<string | null>(
    null
  );

  // State for custom notifications
  const [notificationMessage, setNotificationMessage] = useState<string | null>(
    null
  );
  const [notificationType, setNotificationType] = useState<
    "success" | "error" | null
  >(null);

  // Helper function to show notifications
  const showNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setNotificationMessage(message);
    setNotificationType(type);
    setTimeout(() => {
      setNotificationMessage(null);
      setNotificationType(null);
    }, 3000); // Notification disappears after 3 seconds
  };

  // Get admin token for authenticated requests
  const adminToken = localStorage.getItem("adminToken");

  // Path for placeholder image (ensure this file exists in your client/public directory)
  const PLACEHOLDER_IMAGE_PATH = "/placeholder-product.png";

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("http://localhost:5000/api/products", {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      setProducts(response.data.data);
    } catch (err: any) {
      console.error("Failed to fetch products:", err);
      setError(
        "Failed to load products. " +
          (err.response?.data?.message || "Server error.")
      );
      if (err.response?.status === 401 || err.response?.status === 403) {
        showNotification(
          "Session expired or unauthorized. Please log in.",
          "error"
        );
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to initiate delete confirmation
  const confirmDelete = (productId: string) => {
    setProductIdToDelete(productId);
    setShowConfirmModal(true);
  };

  // Function to handle actual deletion after confirmation
  const handleDelete = async () => {
    if (!productIdToDelete) return;

    setShowConfirmModal(false); // Close the modal
    try {
      await axios.delete(
        `http://localhost:5000/api/products/${productIdToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
      showNotification("Product deleted successfully!", "success");
      fetchProducts(); // Refresh the list
    } catch (err: any) {
      console.error("Failed to delete product:", err);
      setError(
        "Failed to delete product. " +
          (err.response?.data?.message || "Server error.")
      );
      showNotification("Failed to delete product. Server error.", "error");
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate("/admin/login");
      }
    } finally {
      setProductIdToDelete(null); // Clear the ID
    }
  };

  if (loading)
    return <div className="text-center p-8">Loading products...</div>;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Custom Notification */}
      {notificationMessage && (
        <div
          className={`
            fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium text-lg
            transition-all duration-300 ease-in-out transform
            ${notificationType === "success" ? "bg-green-500" : "bg-red-500"}
          `}
          role="alert"
        >
          {notificationMessage}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-6">
              Are you sure you want to delete this product? This action cannot
              be undone.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Product Management
          </h1>
          <div className="flex space-x-4">
            <Link
              to="/admin/dashboard"
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              Back to Dashboard
            </Link>
            <Link
              to="/admin/products/new"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              Add New Product
            </Link>
          </div>
        </div>

        {products.length === 0 ? (
          <p className="text-center text-gray-600">
            No products found. Add a new one!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Image</th>
                  <th className="py-3 px-6 text-left">Name</th>
                  <th className="py-3 px-6 text-left">Store</th>
                  <th className="py-3 px-6 text-left">Price (Disc.)</th>
                  <th className="py-3 px-6 text-left">Code</th>
                  <th className="py-3 px-6 text-left">Stock</th>
                  <th className="py-3 px-6 text-left">Active</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm font-light">
                {products.map((product) => (
                  // IMPORTANT: Ensure NO NEWLINES or extra SPACES between <td> tags in this line
                  <tr
                    key={product._id as string}
                    className="border-b border-gray-200 hover:bg-gray-100"
                  >
                    <td className="py-3 px-6 text-left">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={`http://localhost:5000/uploads/${product.images[0]}`}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = PLACEHOLDER_IMAGE_PATH;
                            e.currentTarget.alt = "Product image not available";
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded text-xs text-gray-500">
                          No Img
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-6 text-left font-medium">
                      {product.name}
                    </td>
                    <td className="py-3 px-6 text-left">
                      {typeof product.store === "object" &&
                      product.store !== null &&
                      "name" in product.store
                        ? (product.store as { name: string }).name
                        : "N/A"}
                    </td>
                    <td className="py-3 px-6 text-left">
                      ${product.price}
                      {product.discountedPrice
                        ? ` ($${product.discountedPrice})`
                        : ""}
                    </td>
                    <td className="py-3 px-6 text-left">
                      {product.discountCode}
                    </td>
                    <td className="py-3 px-6 text-left">{product.stock}</td>
                    <td className="py-3 px-6 text-left">
                      {product.isActive ? (
                        <span className="bg-green-200 text-green-800 py-1 px-3 rounded-full text-xs">
                          Yes
                        </span>
                      ) : (
                        <span className="bg-red-200 text-red-800 py-1 px-3 rounded-full text-xs">
                          No
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex item-center justify-center">
                        <Link
                          to={`/admin/products/edit/${product._id}`}
                          className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L7.5 21H3v-4.5L15.232 5.232z"
                            />
                          </svg>
                        </Link>
                        <button
                          onClick={() => confirmDelete(product._id as string)}
                          className="w-4 mr-2 transform hover:text-red-500 hover:scale-110"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductListPage;
