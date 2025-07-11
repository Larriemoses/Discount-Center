// client/src/App.tsx

import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AdminLoginPage from "./pages/AdminLogin";
import AdminDashboardPage from "./pages/AdminDashboard";
import AdminStoreListPage from "./pages/AdminStoreListPage";
import AdminStoreFormPage from "./pages/AdminStoreFormPage";
import AdminProductListPage from "./pages/AdminProductListPage";
import AdminProductFormPage from "./pages/AdminProductFormPage";
import Navbar from "./components/Navbar";
import StoreDetailsPage from "./pages/StoreDetailsPage";

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  // const isHomePage = location.pathname === "/"; // No longer needed here

  return (
    <>
      {/* Conditionally render Navbar only if it's NOT an admin route */}
      {/* No longer passing isHomePage prop */}
      {!isAdminRoute && <Navbar />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* Admin Routes (no Navbar) */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/stores" element={<AdminStoreListPage />} />
        <Route path="/admin/stores/new" element={<AdminStoreFormPage />} />
        <Route path="/admin/stores/edit/:id" element={<AdminStoreFormPage />} />
        <Route path="/admin/products" element={<AdminProductListPage />} />
        <Route path="/admin/products/new" element={<AdminProductFormPage />} />
        <Route
          path="/admin/products/edit/:id"
          element={<AdminProductFormPage />}
        />

        {/* Public Routes - Removed pt-[7rem] wrappers for consistent overlay */}
        <Route
          path="/today-deals"
          element={
            // Removed pt-[7rem]
            <div className="min-h-screen">
              <div>Today Deals Page Content (Coming Soon)</div>
            </div>
          }
        />
        <Route
          path="/stores"
          element={
            // Removed pt-[7rem]
            <div className="min-h-screen">
              <div>
                Public Stores List Page (This route can eventually show all
                public stores in a gallery)
              </div>
            </div>
          }
        />
        {/* StoreDetailsPage will also be updated to remove its internal pt-[7rem] */}
        <Route path="/stores/:slug" element={<StoreDetailsPage />} />
        <Route
          path="/submit-store"
          element={
            // Removed pt-[7rem]
            <div className="min-h-screen">
              <div>Submit a Store Page Content (Coming Soon)</div>
            </div>
          }
        />
        <Route
          path="/contact-us"
          element={
            // Removed pt-[7rem]
            <div className="min-h-screen">
              <div>Contact Us Page Content (Coming Soon)</div>
            </div>
          }
        />
      </Routes>
    </>
  );
}

export default App;
