// client/src/components/PrivateRoute.tsx

import React from "react";
import { Navigate, Outlet } from "react-router-dom";

interface PrivateRouteProps {
  children?: React.ReactNode; // For future nested routes if needed
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  // Check if an admin token exists in localStorage
  const isAuthenticated = localStorage.getItem("adminToken");

  // If authenticated, render the children (the protected component) or the outlet for nested routes
  // Otherwise, redirect to the admin login page
  return isAuthenticated ? (
    children ? (
      children
    ) : (
      <Outlet />
    )
  ) : (
    <Navigate to="/admin/login" replace />
  );
};

export default PrivateRoute;
