// src/components/PrivateRoute.tsx

import { Navigate } from "react-router-dom";
import React from "react"; // <--- IMPORTANT: This import is needed for React.ReactNode type

// 1. Define the props interface for PrivateRoute
interface PrivateRouteProps {
  isAuthenticated: boolean; // Explicitly declare the isAuthenticated prop
  children: React.ReactNode; // Explicitly declare the children prop (the components it wraps)
}

// 2. Apply the props interface to the functional component
const PrivateRoute: React.FC<PrivateRouteProps> = ({
  isAuthenticated,
  children,
}) => {
  // If the user is not authenticated, redirect them to the admin login page
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // If authenticated, render the children components (the protected content)
  return <>{children}</>;
};

export default PrivateRoute;
