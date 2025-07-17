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
import StoreListPage from "./pages/StoreListPage";
import Footer from "./components/Footer"; // Import the Footer component

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {/* Conditionally render Navbar only if it's NOT an admin route */}
      {!isAdminRoute && <Navbar />}

      <Routes>
        {/* HomePage will now also need pt-[7rem] as it follows a solid Navbar */}
        {/* IMPORTANT: Ensure HomePage.tsx's main div or container has 'pt-[7rem]' */}
        <Route path="/" element={<HomePage />} />

        {/* Admin Routes (no Navbar, no Footer) */}
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

        {/* Public Routes - All these pages now need a wrapper with pt-[7rem] to clear the fixed Navbar */}
        <Route
          path="/today-deals"
          element={
            <div className="pt-[7rem] min-h-screen">
              <div>Today Deals Page Content (Coming Soon)</div>
            </div>
          }
        />
        <Route
          path="/stores"
          element={<StoreListPage />} // Use the new StoreListPage component here
        />
        {/* StoreDetailsPage already has pt-[7rem] from the previous update */}
        <Route path="/stores/:slug" element={<StoreDetailsPage />} />
        <Route
          path="/submit-store"
          element={
            <div className="pt-[7rem] min-h-screen">
              <div>Submit a Store Page Content (Coming Soon)</div>
            </div>
          }
        />
        <Route
          path="/contact-us"
          element={
            <div className="pt-[7rem] min-h-screen">
              <div>Contact Us Page Content (Coming Soon)</div>
            </div>
          }
        />
      </Routes>

      {/* Conditionally render Footer only if it's NOT an admin route */}
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App;
