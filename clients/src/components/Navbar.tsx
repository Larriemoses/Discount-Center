// client/src/components/Navbar.tsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import type { IStore } from "../../../server/src/models/Store";

// Remove NavbarProps interface as isHomePage prop is no longer needed
// interface NavbarProps {
//   isHomePage: boolean;
// }

// Remove the isHomePage prop from the component's signature
const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const [publicStores, setPublicStores] = useState<IStore[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [storesError, setStoresError] = useState("");

  useEffect(() => {
    const fetchPublicStores = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/stores/public"
        );
        setPublicStores(response.data.data);
      } catch (err: any) {
        console.error("Failed to fetch public stores for navbar:", err);
        setStoresError("Failed to load stores.");
      } finally {
        setLoadingStores(false);
      }
    };
    fetchPublicStores();
  }, []);

  // Function to close both dropdowns (useful for navigation)
  const closeAllMenus = () => {
    setIsMobileMenuOpen(false);
    setIsStoreDropdownOpen(false);
  };

  // Navbar will now ALWAYS be solid and relatively positioned
  const navClasses =
    "relative w-full z-30 bg-gradient-to-r from-purple-800 to-blue-500 p-4 shadow-md";

  // No need for conditional link shadow classes since background is solid
  // Removed linkShadowClasses variable and directly apply text-white
  // const linkShadowClasses = isHomePage ? "drop-shadow-md" : "";

  return (
    <nav className={navClasses}>
      <div className="container mx-auto flex justify-between items-center px-4">
        {/* Logo/Site Title */}
        <Link
          to="/"
          className="text-white text-2xl font-bold tracking-wide" // Removed linkShadowClasses
          onClick={closeAllMenus}
        >
          Discount Center
        </Link>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white focus:outline-none" // Removed linkShadowClasses
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex space-x-6 items-center">
          <Link
            to="/"
            className="text-white hover:text-gray-200 transition duration-300" // Removed linkShadowClasses
            onClick={closeAllMenus}
          >
            Home
          </Link>
          <Link
            to="/today-deals"
            className="text-white hover:text-gray-200 transition duration-300" // Removed linkShadowClasses
            onClick={closeAllMenus}
          >
            Today Deals
          </Link>

          {/* Store Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsStoreDropdownOpen(!isStoreDropdownOpen)}
              className="text-white hover:text-gray-200 transition duration-300 flex items-center focus:outline-none" // Removed linkShadowClasses
            >
              Store
              <svg
                className="ml-1 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isStoreDropdownOpen && (
              // Desktop Dropdown: semi-transparent white, subtle shadow, and blur
              <div className="absolute left-0 mt-2 w-48 bg-white/90 rounded-md shadow-lg py-1 z-20 backdrop-blur-sm">
                {loadingStores ? (
                  <div className="px-4 py-2 text-gray-700">
                    Loading stores...
                  </div>
                ) : storesError ? (
                  <div className="px-4 py-2 text-red-600">{storesError}</div>
                ) : publicStores.length === 0 ? (
                  <div className="px-4 py-2 text-gray-700">
                    No stores found.
                  </div>
                ) : (
                  publicStores.map((store) => (
                    <Link
                      key={store._id as string}
                      to={`/stores/${store.slug}`}
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                      onClick={closeAllMenus}
                    >
                      {store.name}
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          <Link
            to="/submit-store"
            className="text-white hover:text-gray-200 transition duration-300" // Removed linkShadowClasses
            onClick={closeAllMenus}
          >
            Submit a store
          </Link>
          <Link
            to="/contact-us"
            className="text-white hover:text-gray-200 transition duration-300" // Removed linkShadowClasses
            onClick={closeAllMenus}
          >
            Contact us
          </Link>
        </div>
      </div>

      {/* Mobile Menu (conditionally rendered) */}
      {isMobileMenuOpen && (
        // Mobile menu: semi-transparent purple, subtle shadow, and blur
        // This menu always has a semi-transparent background for readability on all pages
        <div className="md:hidden mt-4 space-y-2 bg-purple-800/90 p-4 rounded-md shadow-lg backdrop-blur-sm">
          <Link
            to="/"
            className="block text-white hover:text-gray-200 transition duration-300 py-2"
            onClick={closeAllMenus}
          >
            Home
          </Link>
          <Link
            to="/today-deals"
            className="block text-white hover:text-gray-200 transition duration-300 py-2"
            onClick={closeAllMenus}
          >
            Today Deals
          </Link>

          {/* Mobile Store Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsStoreDropdownOpen(!isStoreDropdownOpen)}
              className="block text-white hover:text-gray-200 transition duration-300 py-2 w-full text-left"
            >
              Store
              <svg
                className="ml-1 w-4 h-4 inline-block"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isStoreDropdownOpen && (
              // Mobile Dropdown List: semi-transparent white, subtle shadow, and blur
              <div className="mt-2 space-y-1 bg-white/90 rounded-md shadow-inner py-1 z-20 backdrop-blur-sm">
                {loadingStores ? (
                  <div className="px-4 py-2 text-gray-700">
                    Loading stores...
                  </div>
                ) : storesError ? (
                  <div className="px-4 py-2 text-red-600">{storesError}</div>
                ) : publicStores.length === 0 ? (
                  <div className="px-4 py-2 text-gray-700">
                    No stores found.
                  </div>
                ) : (
                  publicStores.map((store) => (
                    <Link
                      key={store._id as string}
                      to={`/stores/${store.slug}`}
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                      onClick={closeAllMenus}
                    >
                      {store.name}
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          <Link
            to="/submit-store"
            className="block text-white hover:text-gray-200 transition duration-300 py-2"
            onClick={closeAllMenus}
          >
            Submit a store
          </Link>
          <Link
            to="/contact-us"
            className="block text-white hover:text-gray-200 transition duration-300 py-2"
            onClick={closeAllMenus}
          >
            Contact us
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
