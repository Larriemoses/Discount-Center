// client/src/pages/AdminDashboard.tsx

import React from "react";
import { useNavigate, Link } from "react-router-dom"; // <--- Import Link

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear the token and any other stored admin info
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUsername");
    localStorage.removeItem("adminRole");

    // Redirect to the admin login page
    navigate("/admin/login");
  };

  // You can fetch admin-specific data here later
  const adminUsername = localStorage.getItem("adminUsername") || "Admin";

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Welcome, {adminUsername} (Admin Dashboard)
        </h1>
        <p className="text-gray-700 mb-8">
          This is your central hub for managing stores, products, and other
          administrative tasks.
        </p>

        {/* Updated the grid layout to only have 2 columns for medium and large screens,
          since the analytics card has been removed. This centers the two remaining cards.
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Example Admin Actions/Cards */}
          <div className="bg-blue-50 p-4 rounded-lg shadow-sm flex flex-col items-center justify-center">
            <h3 className="text-xl font-semibold mb-2">Manage Stores</h3>
            <p className="text-gray-600 text-center text-sm">
              Add, edit, or delete store information.
            </p>
            {/* Link for Manage Stores (Assuming you'll create /admin/stores later) */}
            <Link
              to="/admin/stores"
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              Go to Stores
            </Link>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow-sm flex flex-col items-center justify-center">
            <h3 className="text-xl font-semibold mb-2">Manage Products</h3>
            <p className="text-gray-600 text-center text-sm">
              Add, edit, or delete product listings.
            </p>
            {/* Link for Manage Products */}
            <Link
              to="/admin/products" // <--- This will now navigate to your product list page
              className="mt-4 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
            >
              Go to Products
            </Link>
          </div>
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-300"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
