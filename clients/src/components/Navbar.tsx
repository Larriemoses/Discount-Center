// client/src/components/Navbar.tsx

import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
// import axios from "axios"; // Remove this line
import axiosInstance from "../utils/axiosInstance"; // Add this line
import type { IStore } from "@common/interfaces/IStore";

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const [publicStores, setPublicStores] = useState<IStore[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [storesError, setStoresError] = useState("");

  // This Cloudinary URL is fine as it's an external asset, not served by your backend
  const LOGO_URL =
    "https://res.cloudinary.com/dvl2r3bdw/image/upload/v1752540945/image-removebg-preview_uyqjbj.png";

  useEffect(() => {
    const fetchPublicStores = async () => {
      try {
        // --- UPDATED: Use axiosInstance instead of direct axios call ---
        const response = await axiosInstance.get("/stores/public");
        setPublicStores(response.data.data);
      } catch (err: any) {
        // Use 'any' for simpler error handling
        console.error("Failed to fetch public stores for navbar:", err);
        setStoresError("Failed to load stores.");
      } finally {
        setLoadingStores(false);
      }
    };
    fetchPublicStores();
  }, []);

  const closeAllMenus = () => {
    setIsMobileMenuOpen(false);
    setIsStoreDropdownOpen(false);
  };

  const getNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `transition duration-300 ${
      isActive ? "text-[#796cf5] font-semibold" : "text-black"
    } hover:text-[#796cf5]`;

  // Define a common class for the Today Deals link, as it won't use NavLink's isActive
  const getTodayDealsLinkClasses =
    "transition duration-300 text-black hover:text-[#796cf5]";

  const navClasses = "relative w-full z-30 bg-white py-1 shadow-md";

  // Function to handle "Today Deals" click for scrolling
  const handleTodayDealsClick = (
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    closeAllMenus();
    event.preventDefault(); // Prevent default Link navigation immediately

    // Manually set the hash to trigger the browser's scroll behavior.
    // If already on the homepage with the #top-deals hash, this will force a re-scroll.
    if (
      window.location.pathname === "/" &&
      window.location.hash === "#top-deals"
    ) {
      const targetElement = document.getElementById("top-deals");
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // If not on the homepage or not at the #top-deals hash, navigate and set hash
      window.location.href = "/#top-deals";
    }
  };

  return (
    <nav className={navClasses}>
      <div className="container mx-auto flex justify-between items-center px-4 sm:px-8 lg:px-20">
        <Link to="/" className="flex items-center" onClick={closeAllMenus}>
          <img
            src={LOGO_URL}
            alt="Discount Center Logo"
            className="h-20 w-auto"
          />
        </Link>
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-[#796cf5] focus:outline-none hover:text-[#5c4ae0] transition duration-300"
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
        <div className="hidden md:flex space-x-6 items-center">
          <NavLink
            to="/"
            className={getNavLinkClasses}
            onClick={closeAllMenus}
            end
          >
            Home
          </NavLink>
          {/* Changed to Link for custom scroll handling */}
          <Link
            to="/#top-deals" // Retain for semantic meaning, but onClick handles navigation
            className={getTodayDealsLinkClasses} // Use the specific class for this link
            onClick={handleTodayDealsClick}
          >
            Today Deals
          </Link>

          <div className="relative">
            <button
              onClick={() => setIsStoreDropdownOpen(!isStoreDropdownOpen)}
              className="text-black hover:text-[#796cf5] transition duration-300 flex items-center focus:outline-none"
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
                        className="block px-4 py-2 text-black hover:bg-gray-100 hover:text-[#796cf5] transition duration-300"
                        onClick={closeAllMenus}
                      >
                        {store.name}
                      </Link>
                    ))}
                    {/* See More Stores link */}
                    <Link
                      to="/stores" // Correctly directs to /stores
                      className="block px-4 py-2 text-[#796cf5] hover:bg-gray-100 hover:text-[#5c4ae0] transition duration-300 font-semibold border-t border-gray-200 mt-1 pt-2"
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
            className={getNavLinkClasses}
            onClick={closeAllMenus}
          >
            Submit a store
          </NavLink>
          <NavLink
            to="/contact-us"
            className={getNavLinkClasses}
            onClick={closeAllMenus}
          >
            Contact us
          </NavLink>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 space-y-2 bg-white/90 p-4 rounded-md shadow-xl backdrop-blur-sm">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `block py-2 ${
                isActive ? "text-[#796cf5] font-semibold" : "text-black"
              } hover:text-[#796cf5] transition duration-300`
            }
            onClick={closeAllMenus}
            end
          >
            Home
          </NavLink>
          {/* Changed to Link for custom scroll handling in mobile menu */}
          <Link
            to="/#top-deals"
            className="block py-2 text-black hover:text-[#796cf5] transition duration-300"
            onClick={handleTodayDealsClick}
          >
            Today Deals
          </Link>

          <div className="relative">
            <button
              onClick={() => setIsStoreDropdownOpen(!isStoreDropdownOpen)}
              className="block text-black hover:text-[#796cf5] transition duration-300 py-2 w-full text-left"
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
                        className="block px-4 py-2 text-black hover:bg-gray-100 hover:text-[#796cf5] transition duration-300"
                        onClick={closeAllMenus}
                      >
                        {store.name}
                      </Link>
                    ))}
                    {/* See More Stores link */}
                    <Link
                      to="/stores" // Correctly directs to /stores
                      className="block px-4 py-2 text-[#796cf5] hover:bg-gray-100 hover:text-[#5c4ae0] transition duration-300 font-semibold border-t border-gray-200 mt-1 pt-2"
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
