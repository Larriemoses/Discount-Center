// src/App.tsx
import { useState } from "react"; // Removed React
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import StoreListPage from "./pages/StoreListPage";
import StoreDetailsPage from "./pages/StoreDetailsPage";
import AdminLoginPage from "./pages/AdminLogin";
import AdminDashboardPage from "./pages/AdminDashboard";
import AdminStoreListPage from "./pages/AdminStoreListPage";
import AdminStoreFormPage from "./pages/AdminStoreFormPage";
import AdminProductListPage from "./pages/AdminProductListPage";
import AdminProductFormPage from "./pages/AdminProductFormPage";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import PrivateRoute from "./components/PrivateRoutes"; // Import PrivateRoute

function App() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(
    !!localStorage.getItem("adminToken")
  );

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/stores" element={<StoreListPage />} />
        <Route path="/stores/:slug" element={<StoreDetailsPage />} />
        <Route
          path="/admin/login"
          element={
            <AdminLoginPage setIsAdminAuthenticated={setIsAdminAuthenticated} />
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute isAuthenticated={isAdminAuthenticated}>
              <AdminDashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/stores"
          element={
            <PrivateRoute isAuthenticated={isAdminAuthenticated}>
              <AdminStoreListPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/stores/new"
          element={
            <PrivateRoute isAuthenticated={isAdminAuthenticated}>
              <AdminStoreFormPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/stores/edit/:id"
          element={
            <PrivateRoute isAuthenticated={isAdminAuthenticated}>
              <AdminStoreFormPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <PrivateRoute isAuthenticated={isAdminAuthenticated}>
              <AdminProductListPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/products/new"
          element={
            <PrivateRoute isAuthenticated={isAdminAuthenticated}>
              <AdminProductFormPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/products/edit/:id"
          element={
            <PrivateRoute isAuthenticated={isAdminAuthenticated}>
              <AdminProductFormPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <PrivateRoute isAuthenticated={isAdminAuthenticated}>
              <AdminAnalyticsPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
