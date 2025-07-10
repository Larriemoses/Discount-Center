// client/src/pages/AdminStoreFormPage.tsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import type { IStore } from "../../../server/src/models/Store"; // Corrected type-only import

const AdminStoreFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>(); // 'id' will be present for edit mode
  const navigate = useNavigate();
  const adminToken = localStorage.getItem("adminToken");

  // Form state for store fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState(""); // Slug field
  const [logo, setLogo] = useState<File | null>(null); // For new logo file
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null); // For logo already on the server

  // State for fetching data & submission
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  // --- Effect to fetch store data (if in edit mode) ---
  useEffect(() => {
    const fetchStoreData = async () => {
      setLoading(true);
      setError("");
      try {
        if (id) {
          // If 'id' exists, we are in edit mode: fetch store data
          const response = await axios.get(
            `http://localhost:5000/api/stores/${id}`,
            {
              headers: { Authorization: `Bearer ${adminToken}` },
            }
          );
          const store: IStore = response.data;

          setName(store.name);
          setDescription(store.description);
          setSlug(store.slug);
          setExistingLogoUrl(
            store.logo && store.logo !== "no-photo.jpg"
              ? `/uploads/${store.logo}`
              : null
          ); // Pre-fill existing logo
        }
      } catch (err: any) {
        console.error("Failed to fetch store data:", err);
        setError(
          "Failed to load store data: " +
            (err.response?.data?.message || err.message)
        );
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate("/admin/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [id, navigate, adminToken]); // Re-run if ID changes (for navigation between edit/new)

  // --- Handle form submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("slug", slug); // Append slug

    if (logo) {
      formData.append("logo", logo); // Append new logo file
    } else if (id && existingLogoUrl === null) {
      // If in edit mode and user explicitly cleared existing logo (future feature)
      // Or if no new logo is selected and there was no existing one, this is fine.
      // If you want to allow explicitly removing a logo, you might add a checkbox
      // and send a `clearLogo: true` flag. For now, we assume if `logo` is null
      // and `existingLogoUrl` is null, no logo is desired.
    }

    try {
      if (id) {
        // --- EDIT STORE ---
        const response = await axios.put(
          `http://localhost:5000/api/stores/${id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${adminToken}`,
              "Content-Type": "multipart/form-data", // Important for file uploads
            },
          }
        );
        alert("Store updated successfully!");
      } else {
        // --- ADD NEW STORE ---
        const response = await axios.post(
          `http://localhost:5000/api/stores`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${adminToken}`,
              "Content-Type": "multipart/form-data", // Important for file uploads
            },
          }
        );
        alert("Store added successfully!");
      }
      navigate("/admin/stores"); // Redirect back to store list after success
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

  // Function to handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogo(e.target.files[0]);
      setExistingLogoUrl(null); // Clear existing logo preview when a new one is selected
    } else {
      setLogo(null);
    }
  };

  if (loading) return <div className="text-center p-8">Loading form...</div>;
  if (error && !submitLoading)
    return <div className="text-center p-8 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          {id ? "Edit Store" : "Add New Store"}
        </h1>
        {error && submitLoading && (
          <div className="text-red-600 mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Store Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Store Name:
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
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          {/* Slug */}
          <div>
            <label
              htmlFor="slug"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Slug (Unique URL Path):
            </label>
            <input
              type="text"
              id="slug"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>

          {/* Logo */}
          <div>
            <label
              htmlFor="logo"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Store Logo:
            </label>
            <input
              type="file"
              id="logo"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              accept="image/*" // Only accept image files
              onChange={handleLogoChange}
            />
            {existingLogoUrl && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Current Logo:</p>
                <img
                  src={`http://localhost:5000${existingLogoUrl}`} // Adjust path if needed
                  alt="Existing Store Logo"
                  className="w-24 h-24 object-contain rounded-full shadow"
                />
              </div>
            )}
            {id && (
              <p className="text-xs text-gray-500 mt-1">
                Select a new logo to replace the existing one.
              </p>
            )}
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
              {submitLoading ? "Saving..." : id ? "Update Store" : "Add Store"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminStoreFormPage;
