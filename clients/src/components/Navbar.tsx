// src/components/Navbar.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import type { IStoreApi } from "@common/types/IStoreTypes"; // <--- Changed IStore to IStoreApi and added 'type'

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [stores, setStores] = useState<IStoreApi[]>([]); // <--- Use IStoreApi
  const [loadingStores, setLoadingStores] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoadingStores(true);
        const response = await axiosInstance.get<{
          success: boolean;
          data: IStoreApi[];
        }>("/stores/public");
        if (response.data && Array.isArray(response.data.data)) {
          setStores(response.data.data);
        } else {
          setError("Unexpected data format for stores.");
        }
      } catch (err: any) {
        console.error("Failed to fetch stores for navbar:", err);
        setError("Failed to load stores.");
      } finally {
        setLoadingStores(false);
      }
    };
    fetchStores();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-purple-600">
                Discount Center
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="border-transparent text-gray-900 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Home
              </Link>
              <Link
                to="/stores"
                className="border-transparent text-gray-900 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                All Stores
              </Link>
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="border-transparent text-gray-900 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium focus:outline-none"
                >
                  Stores by Category
                  <svg
                    className="-mr-1 ml-2 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div
                      className="py-1"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="options-menu"
                    >
                      {loadingStores ? (
                        <span className="block px-4 py-2 text-sm text-gray-700">
                          Loading...
                        </span>
                      ) : error ? (
                        <span className="block px-4 py-2 text-sm text-red-500">
                          {error}
                        </span>
                      ) : (
                        stores.map((store) => (
                          <Link
                            key={store._id} // <--- _id is now available on IStoreApi
                            to={`/stores/${store.slug}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            {store.name}
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="bg-indigo-50 border-indigo-500 text-indigo-700 block px-3 py-2 rounded-md text-base font-medium"
            >
              Home
            </Link>
            <Link
              to="/stores"
              className="text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block px-3 py-2 rounded-md text-base font-medium"
            >
              All Stores
            </Link>
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block px-3 py-2 rounded-md text-base font-medium w-full text-left focus:outline-none"
              >
                Stores by Category
                <svg
                  className="ml-2 -mr-1 h-5 w-5 inline-block"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {isDropdownOpen && (
                <div className="pl-4 pr-2 py-1 bg-gray-50 rounded-md shadow-inner">
                  {loadingStores ? (
                    <span className="block px-4 py-2 text-sm text-gray-700">
                      Loading...
                    </span>
                  ) : error ? (
                    <span className="block px-4 py-2 text-sm text-red-500">
                      {error}
                    </span>
                  ) : (
                    stores.map((store) => (
                      <Link
                        key={store._id} // <--- _id is now available on IStoreApi
                        to={`/stores/${store.slug}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsMenuOpen(false);
                        }}
                      >
                        {store.name}
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
