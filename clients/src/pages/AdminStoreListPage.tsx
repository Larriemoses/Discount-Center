// src/pages/AdminStoreListPage.tsx
import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { Link, useNavigate } from "react-router-dom";
import type { IStoreApi } from "@common/types/IStoreTypes"; // <--- Changed IStore to IStoreApi and added 'type'

const AdminStoreListPage: React.FC = () => {
  const [stores, setStores] = useState<IStoreApi[]>([]); // <--- Use IStoreApi
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<string | null>(null);
  const adminToken = localStorage.getItem("adminToken");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!adminToken) {
          navigate("/admin/login");
          return;
        }

        const response = await axiosInstance.get<{
          success: boolean;
          data: IStoreApi[];
        }>("/stores", {
          // <--- Use IStoreApi
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        if (response.data && Array.isArray(response.data.data)) {
          setStores(response.data.data);
        } else {
          setError("Unexpected data format from server.");
          console.error("Unexpected data format:", response.data);
        }
      } catch (err: any) {
        console.error("Failed to fetch stores:", err);
        setError(
          "Failed to load stores: " +
            (err.response?.data?.message || err.message)
        );
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate("/admin/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [adminToken, navigate]);

  const confirmDelete = (id: string) => {
    setStoreToDelete(id);
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setStoreToDelete(null);
    setShowDeleteConfirm(false);
  };

  const handleDelete = async () => {
    if (!storeToDelete) return;

    try {
      if (!adminToken) {
        navigate("/admin/login");
        return;
      }
      await axiosInstance.delete(`/stores/${storeToDelete}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setStores(stores.filter((store) => store._id !== storeToDelete));
      alert("Store deleted successfully!");
    } catch (err: any) {
      console.error("Failed to delete store:", err);
      setError(
        "Failed to delete store: " +
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
        <p className="text-lg text-gray-700">Loading stores...</p>
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
          Manage Stores
        </h1>
        <div className="flex justify-end mb-6">
          <Link
            to="/admin/stores/new"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
          >
            Add New Store
          </Link>
        </div>

        {stores.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">
            No stores available. Add one above!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Logo
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr
                    key={store._id}
                    className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      {store.logo && store.logo !== "no-photo.jpg" ? (
                        <img
                          src={`${import.meta.env.VITE_BACKEND_URL.replace(
                            "/api",
                            ""
                          )}/uploads/${store.logo}`}
                          alt={`${store.name} logo`}
                          className="w-10 h-10 object-contain rounded-full"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/placeholder-logo.png";
                            e.currentTarget.alt = "Logo Not Found";
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 flex items-center justify-center rounded-full text-xs text-gray-400">
                          No Logo
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {store.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 line-clamp-2 max-w-xs">
                      {store.description}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/admin/stores/edit/${store._id}`}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => confirmDelete(store._id)}
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
              Are you sure you want to delete this store? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
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

export default AdminStoreListPage;
