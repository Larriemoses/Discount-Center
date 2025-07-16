// client/src/App.tsx

import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage"; // This will need pt-[7rem]
import AdminLoginPage from "./pages/AdminLogin";
import AdminDashboardPage from "./pages/AdminDashboard";
import AdminStoreListPage from "./pages/AdminStoreListPage";
import AdminStoreFormPage from "./pages/AdminStoreFormPage";
import AdminProductListPage from "./pages/AdminProductListPage";
import AdminProductFormPage from "./pages/AdminProductFormPage";
import Navbar from "./components/Navbar";
import StoreDetailsPage from "./pages/StoreDetailsPage"; // This already has pt-[7rem] from previous step

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  // const isHomePage = location.pathname === "/"; // This line is no longer needed for Navbar styling

  return (
    <>
      {/* Conditionally render Navbar only if it's NOT an admin route */}
      {/* No longer passing isHomePage prop */}
      {!isAdminRoute && <Navbar />}

      <Routes>
        {/* HomePage will now also need pt-[7rem] as it follows a solid Navbar */}
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

        {/* Public Routes - All these pages now need a wrapper with pt-[Xrem] */}
        {/* The pt-[7rem] value should match the height of your solid navbar plus some extra space */}
        <Route
          path="/today-deals"
          element={
            <div className="pt-[1rem] min-h-screen">
              <div>Today Deals Page Content (Coming Soon)</div>
            </div>
          }
        />
        <Route
          path="/stores"
          element={
            <div className="pt-[1rem] min-h-screen">
              <div>
                Public Stores List Page (This route can eventually show all
                public stores in a gallery)
              </div>
            </div>
          }
        />
        {/* StoreDetailsPage already has pt-[7rem] from the previous update */}
        <Route path="/stores/:slug" element={<StoreDetailsPage />} />
        <Route
          path="/submit-store"
          element={
            <div className="pt-[1rem] min-h-screen">
              <div>Submit a Store Page Content (Coming Soon)</div>
            </div>
          }
        />
        <Route
          path="/contact-us"
          element={
            <div className="pt-[1rem] min-h-screen">
              <div>Contact Us Page Content (Coming Soon)</div>
            </div>
          }
        />
      </Routes>
    </>
  );
}

export default App;
