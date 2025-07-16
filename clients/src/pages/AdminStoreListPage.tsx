// client/src/pages/AdminStoreListPage.tsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import type { IStore } from "../../../server/src/models/Store";

const AdminStoreListPage: React.FC = () => {
  const [stores, setStores] = useState<IStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const adminToken = localStorage.getItem("adminToken");

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("http://localhost:5000/api/stores", {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      setStores(response.data.data || response.data);
    } catch (err: any) {
      console.error("Failed to fetch stores:", err);
      setError(
        "Failed to load stores. " +
          (err.response?.data?.message || "Server error.")
      );
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (storeId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this store? This will also affect associated products!"
      )
    ) {
      try {
        await axios.delete(`http://localhost:5000/api/stores/${storeId}`, {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        });
        alert("Store deleted successfully!");
        fetchStores(); // Refresh the list
      } catch (err: any) {
        console.error("Failed to delete store:", err);
        setError(
          "Failed to delete store. " +
            (err.response?.data?.message || "Server error.")
        );
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate("/admin/login");
        }
      }
    }
  };

  if (loading) return <div className="text-center p-8">Loading stores...</div>;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      {" "}
      {/* Added p-4 for smaller screens */}
      <div className="max-w-full lg:max-w-7xl mx-auto bg-white p-4 sm:p-6 rounded-lg shadow-md">
        {" "}
        {/* Changed max-w-7xl to max-w-full and added responsive padding */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          {" "}
          {/* flex-col for mobile, flex-row for larger */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
            Store Management
          </h1>{" "}
          {/* Responsive text size */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            {" "}
            {/* Responsive buttons layout */}
            <Link
              to="/admin/dashboard"
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 text-center"
            >
              Back to Dashboard
            </Link>
            <Link
              to="/admin/stores/new"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 text-center"
            >
              Add New Store
            </Link>
          </div>
        </div>
        {stores.length === 0 ? (
          <p className="text-center text-gray-600">
            No stores found. Add a new one!
          </p>
        ) : (
          <div className="overflow-x-auto">
            {" "}
            {/* This is key for table responsiveness */}
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-xs sm:text-sm leading-normal">
                  {" "}
                  {/* Responsive text size for headers */}
                  <th className="py-2 px-4 text-left">Logo</th>{" "}
                  {/* Adjusted padding */}
                  <th className="py-2 px-4 text-left">Name</th>
                  <th className="py-2 px-4 text-left">Description</th>
                  <th className="py-2 px-4 text-left hidden md:table-cell">
                    Slug
                  </th>{" "}
                  {/* Hide slug on small screens */}
                  <th className="py-2 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm font-light">
                {stores.map((store) => (
                  <tr
                    key={store._id as string}
                    className="border-b border-gray-200 hover:bg-gray-100"
                  >
                    <td className="py-2 px-4 text-left">
                      {" "}
                      {/* Adjusted padding */}
                      {store.logo && store.logo !== "no-photo.jpg" ? (
                        <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded overflow-hidden">
                          {" "}
                          {/* Added wrapper div for consistent container */}
                          <img
                            src={`http://localhost:5000/uploads/${store.logo}`}
                            alt={store.name}
                            className="w-full h-full object-cover" // Ensure image fills its new container, maintaining aspect ratio
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded text-xs text-gray-400">
                          No Logo
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-4 text-left font-medium">
                      {store.name}
                    </td>
                    <td className="py-2 px-4 text-left max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap sm:max-w-xs">
                      {" "}
                      {/* Adjusted max-width for better mobile display */}
                      {store.description}
                    </td>
                    <td className="py-2 px-4 text-left hidden md:table-cell">
                      {store.slug}
                    </td>{" "}
                    {/* Hide slug on small screens */}
                    <td className="py-2 px-4 text-center">
                      <div className="flex item-center justify-center">
                        <Link
                          to={`/admin/stores/edit/${store._id}`}
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
                          onClick={() => handleDelete(store._id as string)}
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

export default AdminStoreListPage;
