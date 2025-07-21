// client/src/pages/SubmitStorePage.tsx

import React, { useState } from "react";
// import axios from "axios"; // Remove this line
import axiosInstance from "../utils/axiosInstance"; // Add this line
import { Link } from "react-router-dom";

const SubmitStorePage: React.FC = () => {
  const [name, setName] = useState("");
  const [mainUrl, setMainUrl] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactName, setContactName] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      // --- UPDATED: Use axiosInstance instead of direct axios call ---
      await axiosInstance.post("/public/submit-store", {
        name,
        mainUrl,
        description,
        contactEmail,
        contactName,
      });
      setMessage("Store submitted successfully! We will review it soon.");
      setName("");
      setMainUrl("");
      setDescription("");
      setContactEmail("");
      setContactName("");
    } catch (err: any) {
      // Use 'any' for simpler error handling without deep type casting
      console.error("Store submission failed:", err.response?.data || err);
      setError(
        "Failed to submit store: " +
          (err.response?.data?.message ||
            "An unexpected error occurred. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      {" "}
      {/* Adjusted padding for responsiveness */}
      <div className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-md">
        {" "}
        {/* Adjusted padding for responsiveness */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          {" "}
          {/* Adjusted font size */}
          Suggest a Store
        </h1>
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 text-sm sm:text-base">
            {" "}
            {/* Adjusted font size */}
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm sm:text-base">
            {" "}
            {/* Adjusted font size */}
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {" "}
          {/* Increased vertical space for larger screens */}
          <div>
            <label
              htmlFor="storeName"
              className="block text-gray-700 text-sm sm:text-base font-bold mb-2" // Adjusted font size
            >
              Store Name:
            </label>
            <input
              type="text"
              id="storeName"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm sm:text-base" // Adjusted font size
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="mainUrl"
              className="block text-gray-700 text-sm sm:text-base font-bold mb-2"
            >
              Store Website URL:
            </label>
            <input
              type="url"
              id="mainUrl"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm sm:text-base"
              value={mainUrl}
              onChange={(e) => setMainUrl(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-gray-700 text-sm sm:text-base font-bold mb-2"
            >
              Brief Description of the Store (Optional):
            </label>
            <textarea
              id="description"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24 resize-none text-sm sm:text-base"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <hr className="my-6" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
            {" "}
            {/* Adjusted font size */}
            Your Contact Information (Optional)
          </h2>
          <div>
            <label
              htmlFor="contactName"
              className="block text-gray-700 text-sm sm:text-base font-bold mb-2"
            >
              Your Name:
            </label>
            <input
              type="text"
              id="contactName"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm sm:text-base"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="contactEmail"
              className="block text-gray-700 text-sm sm:text-base font-bold mb-2"
            >
              Your Email:
            </label>
            <input
              type="email"
              id="contactEmail"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm sm:text-base"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 space-y-4 sm:space-y-0 sm:space-x-4">
            {" "}
            {/* Added flex-col for small screens, then flex-row for larger, with spacing */}
            <Link
              to="/"
              className="w-full sm:w-auto text-center bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 text-sm sm:text-base"
            >
              Back to Home
            </Link>
            <button
              type="submit"
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 text-sm sm:text-base"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Store"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitStorePage;
