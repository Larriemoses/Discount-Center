// src/pages/AdminProductListPage.tsx
import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { Link, useNavigate } from "react-router-dom";
import type { IProductApi } from "@common/types/IProductTypes";

const AdminProductListPage: React.FC = () => {
  const [products, setProducts] = useState<IProductApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const adminToken = localStorage.getItem("adminToken");
  const navigate = useNavigate();

  // Define backend base URL for images
  const backendRootUrl = import.meta.env.VITE_BACKEND_URL.replace("/api", ""); // This is now used
  const STATIC_FILES_BASE_URL = `${backendRootUrl}/uploads`; // Define this to use backendRootUrl

  STATIC_FILES_BASE_URL;
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!adminToken) {
          navigate("/admin/login");
          return;
        }

        const response = await axiosInstance.get<{
          success: boolean;
          data: IProductApi[];
        }>("/products", {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        if (response.data && Array.isArray(response.data.data)) {
          setProducts(response.data.data);
        } else {
          setError("Unexpected data format from server.");
          console.error("Unexpected data format:", response.data);
        }
      } catch (err: any) {
        console.error("Failed to fetch products:", err);
        setError(
          "Failed to load products: " +
            (err.response?.data?.message || err.message)
        );
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate("/admin/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [adminToken, navigate]);

  const confirmDelete = (id: string) => {
    setProductToDelete(id);
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setProductToDelete(null);
    setShowDeleteConfirm(false);
  };

  const executeDelete = async () => {
    if (!productToDelete) return;

    try {
      if (!adminToken) {
        navigate("/admin/login");
        return;
      }
      await axiosInstance.delete(`/products/${productToDelete}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setProducts(
        products.filter((product) => product._id !== productToDelete)
      );
      alert("Product deleted successfully!");
    } catch (err: any) {
      console.error("Failed to delete product:", err);
      setError(
        "Failed to delete product: " +
          (err.response?.data?.message || err.message)
      );
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate("/admin/login");
      }
    } finally {
      cancelDelete();
    }
  };

  if (loading) {
    return (
      <div className="pt-[7rem] min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-700">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-[7rem] min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <p className="text-lg text-red-600 mb-4">{error}</p>
        <Link to="/admin/dashboard" className="text-purple-600 hover:underline">
          Go back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-[2rem] min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Manage Products
        </h1>
        <div className="flex justify-end mb-6">
          <Link
            to="/admin/products/new"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
          >
            Add New Product
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">
            No products available. Add one above!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Store
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uses
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Rate
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product._id}
                    className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {typeof product.store === "object" &&
                      product.store !== null
                        ? product.store.name
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      ${product.price?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {product.stock}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {product.totalUses}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {product.successRate?.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/admin/products/edit/${product._id}`}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => confirmDelete(product._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this product? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductListPage;
