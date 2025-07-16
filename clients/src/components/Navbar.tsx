// client/src/components/Navbar.tsx

import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import axios from "axios";
import type { IStore } from "../../../server/src/models/Store";

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const [publicStores, setPublicStores] = useState<IStore[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [storesError, setStoresError] = useState("");

  // Cloudinary URL for the logo
  const LOGO_URL =
    "https://res.cloudinary.com/dvl2r3bdw/image/upload/v1752540945/image-removebg-preview_uyqjbj.png";

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

  // Helper function for NavLink classNames to apply active state styling
  const getNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `transition duration-300 ${
      isActive ? "text-[#796cf5] font-semibold" : "text-black"
    } hover:text-[#796cf5]`;

  // Navbar will now ALWAYS be solid and relatively positioned with increased height
  // Increased vertical padding to accommodate larger logo and moderate overall height
  const navClasses = "relative w-full z-30 bg-white py-1 shadow-md"; // Increased py-6 to py-8

  return (
    <nav className={navClasses}>
      {/* Adjusted horizontal padding for desktop/larger screens, moderate for mobile */}
      <div className="container mx-auto flex justify-between items-center px-4 sm:px-8 lg:px-20">
        {" "}
        {/* Increased lg:px-12 to lg:px-20 */}
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center" // Use flex to align image if needed
          onClick={closeAllMenus}
        >
          <img
            src={LOGO_URL}
            alt="Discount Center Logo"
            className="h-20 w-auto" // Increased height from h-16 to h-20 for much bigger logo
          />
        </Link>
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-[#796cf5] focus:outline-none hover:text-[#5c4ae0] transition duration-300" // Mobile menu icon is now lilac
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
          <NavLink
            to="/"
            className={getNavLinkClasses} // Using NavLink for active styling
            onClick={closeAllMenus}
            end // Ensures exact match for "/"
          >
            Home
          </NavLink>
          <NavLink
            to="/today-deals"
            className={getNavLinkClasses} // Using NavLink for active styling
            onClick={closeAllMenus}
          >
            Today Deals
          </NavLink>

          {/* Store Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsStoreDropdownOpen(!isStoreDropdownOpen)}
              className="text-black hover:text-[#796cf5] transition duration-300 flex items-center focus:outline-none" // Text black, hover lilac
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
                  <>
                    {publicStores.map((store) => (
                      <Link
                        key={store._id as string}
                        to={`/stores/${store.slug}`}
                        className="block px-4 py-2 text-black hover:bg-gray-100 hover:text-[#796cf5] transition duration-300" // Text black, hover lilac, subtle background
                        onClick={closeAllMenus}
                      >
                        {store.name}
                      </Link>
                    ))}
                    {/* See More Stores link */}
                    <Link
                      to="/stores" // Assuming /stores lists all stores
                      className="block px-4 py-2 text-[#796cf5] hover:bg-gray-100 hover:text-[#5c4ae0] transition duration-300 font-semibold border-t border-gray-200 mt-1 pt-2" // Changed text color to lilac, hover to darker lilac
                      onClick={closeAllMenus}
                    >
                      See More Stores
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <NavLink
            to="/submit-store"
            className={getNavLinkClasses} // Using NavLink for active styling
            onClick={closeAllMenus}
          >
            Submit a store
          </NavLink>
          <NavLink
            to="/contact-us"
            className={getNavLinkClasses} // Using NavLink for active styling
            onClick={closeAllMenus}
          >
            Contact us
          </NavLink>
        </div>
      </div>

      {/* Mobile Menu (conditionally rendered) */}
      {isMobileMenuOpen && (
        // Mobile menu: semi-transparent white, subtle shadow, and blur
        <div className="md:hidden mt-4 space-y-2 bg-white/90 p-4 rounded-md shadow-xl backdrop-blur-sm">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `block py-2 ${
                isActive ? "text-[#796cf5] font-semibold" : "text-black"
              } hover:text-[#796cf5] transition duration-300`
            }
            onClick={closeAllMenus}
            end // Ensures exact match for "/"
          >
            Home
          </NavLink>
          <NavLink
            to="/today-deals"
            className={({ isActive }) =>
              `block py-2 ${
                isActive ? "text-[#796cf5] font-semibold" : "text-black"
              } hover:text-[#796cf5] transition duration-300`
            }
            onClick={closeAllMenus}
          >
            Today Deals
          </NavLink>

          {/* Mobile Store Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsStoreDropdownOpen(!isStoreDropdownOpen)}
              className="block text-black hover:text-[#796cf5] transition duration-300 py-2 w-full text-left" // Text black, hover lilac
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
                  <>
                    {publicStores.map((store) => (
                      <Link
                        key={store._id as string}
                        to={`/stores/${store.slug}`}
                        className="block px-4 py-2 text-black hover:bg-gray-100 hover:text-[#796cf5] transition duration-300" // Text black, hover lilac, subtle background
                        onClick={closeAllMenus}
                      >
                        {store.name}
                      </Link>
                    ))}
                    {/* See More Stores link */}
                    <Link
                      to="/stores" // Assuming /stores lists all stores
                      className="block px-4 py-2 text-[#796cf5] hover:bg-gray-100 hover:text-[#5c4ae0] transition duration-300 font-semibold border-t border-gray-200 mt-1 pt-2" // Changed text color to lilac, hover to darker lilac
                      onClick={closeAllMenus}
                    >
                      See More Stores
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <NavLink
            to="/submit-store"
            className={({ isActive }) =>
              `block py-2 ${
                isActive ? "text-[#796cf5] font-semibold" : "text-black"
              } hover:text-[#796cf5] transition duration-300`
            }
            onClick={closeAllMenus}
          >
            Submit a store
          </NavLink>
          <NavLink
            to="/contact-us"
            className={({ isActive }) =>
              `block py-2 ${
                isActive ? "text-[#796cf5] font-semibold" : "text-black"
              } hover:text-[#796cf5] transition duration-300`
            }
            onClick={closeAllMenus}
          >
            Contact us
          </NavLink>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
