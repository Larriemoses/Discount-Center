// client/src/App.tsx

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Public components
import StoreList from "./components/StoreList";
import StoreProducts from "./components/StoreProducts";

// Admin Auth components
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import PrivateRoute from "./components/PrivateRoute";

// Admin Management components
import AdminProductListPage from "./pages/AdminProductListPage";
import AdminStoreListPage from "./pages/AdminStoreListPage"; // Assuming this is correct path
import AdminProductFormPage from "./pages/AdminProductFormPage";
import AdminStoreFormPage from "./pages/AdminStoreFormPage"; // <--- Import the new Store Form Page

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        {/* Your Navbar/Header might go here */}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<StoreList />} />
          <Route path="/stores/:storeId" element={<StoreProducts />} />

          {/* Admin Authentication Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<PrivateRoute />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            {/* Admin Product Routes */}
            <Route path="products" element={<AdminProductListPage />} />
            <Route path="products/new" element={<AdminProductFormPage />} />
            <Route
              path="products/edit/:id"
              element={<AdminProductFormPage />}
            />
            {/* Admin Store Routes */}
            <Route path="stores" element={<AdminStoreListPage />} />
            <Route path="stores/new" element={<AdminStoreFormPage />} />{" "}
            {/* <--- Use the new component for adding */}
            <Route
              path="stores/edit/:id"
              element={<AdminStoreFormPage />}
            />{" "}
            {/* <--- Use the new component for editing */}
          </Route>

          {/* Fallback route for 404 */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
