// client/src/pages/ContactUsPage.tsx
import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ContactUsPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(null);
    setError(null);

    try {
      await axios.post("http://localhost:5000/api/public/contact", {
        name,
        email,
        subject,
        message,
      });
      setSuccessMessage("Your message has been sent successfully!");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      console.error(
        "Contact form submission failed:",
        err.response?.data || err
      );
      setError(
        "Failed to send message: " +
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
          Contact Us
        </h1>
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 text-sm sm:text-base">
            {" "}
            {/* Adjusted font size */}
            {successMessage}
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
              htmlFor="name"
              className="block text-gray-700 text-sm sm:text-base font-bold mb-2" // Adjusted font size
            >
              Your Name:
            </label>
            <input
              type="text"
              id="name"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm sm:text-base" // Adjusted font size
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm sm:text-base font-bold mb-2"
            >
              Your Email:
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm sm:text-base"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="subject"
              className="block text-gray-700 text-sm sm:text-base font-bold mb-2"
            >
              Subject:
            </label>
            <input
              type="text"
              id="subject"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm sm:text-base"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="message"
              className="block text-gray-700 text-sm sm:text-base font-bold mb-2"
            >
              Message:
            </label>
            <textarea
              id="message"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32 resize-none text-sm sm:text-base"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            ></textarea>
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
              {loading ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactUsPage;
