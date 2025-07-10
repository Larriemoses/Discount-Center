// client/src/pages/AdminProductListPage.tsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import type { IProduct } from "../../../server/src/models/Product"; // <--- ADD 'type' keyword
import type { IStore } from "../../../server/src/models/Store";

const AdminProductListPage: React.FC = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Get admin token for authenticated requests
  const adminToken = localStorage.getItem("adminToken");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      // NOTE: Your backend has /api/products/stores/:storeId/products
      // For now, let's assume we fetch ALL products for simplicity.
      // In a real app, you'd likely select a store first or fetch products for all stores.
      // If you ONLY want products for a specific store, you'd need that storeId here.
      // For demonstration, let's temporarily assume /api/products route for ALL products,
      // OR we fetch products from a known store (e.g., the first one found).

      // *** IMPORTANT: Adjust this API call based on how you want to fetch products. ***
      // Option 1: If you want to fetch ALL products (assuming a /api/products route for it)
      const response = await axios.get("http://localhost:5000/api/products", {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      setProducts(response.data.data); // Assuming response.data.data from your general getProducts controller
      // OR
      // Option 2: If you only use /api/products/stores/:storeId/products, you need a storeId.
      // This requires you to have stores first. Let's assume for now you will have one or pick one.
      // This is a common challenge. For simplicity, let's enable the general GET /api/products
      // if you haven't already in productRoutes.ts (as per my previous generic productRoutes.ts)
      // OR, we need a way to get a store ID first.
      // Let's modify the backend productRoutes.ts slightly to allow GET /api/products
    } catch (err: any) {
      console.error("Failed to fetch products:", err);
      setError(
        "Failed to load products. " +
          (err.response?.data?.message || "Server error.")
      );
      // If unauthorized, redirect to login
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // *** IMPORTANT ADJUSTMENT TO BACKEND ROUTES FOR TESTING ***
  // Your `productRoutes.ts` currently only has `getProductsByStore` and `getProductById` for GET.
  // To easily fetch all products for the admin list, let's temporarily or permanently add a general GET /api/products.
  // Open `server/src/routes/productRoutes.ts` and ensure you have this:
  /*
  // server/src/routes/productRoutes.ts
  import express from 'express';
  import {
    getProducts, // <--- Make sure this is imported and exists in your productController
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsByStore, // This is your existing one
  } from '../controllers/productController';
  import { protect, authorize } from '../middleware/authMiddleware';
  import upload from "../middleware/uploadMiddleware";

  const router = express.Router();

  // General products routes (for admin list, for example)
  router.route('/')
    .get(getProducts) // Get ALL products (you already have this function in productController)
    // You might want to make this protected for admin GET ALL
    // .get(protect, authorize(['admin']), getProducts)
    // The POST /api/products route from my previous example is handled by:
    // router.post("/stores/:storeId/products", protect, authorize(["admin"]), upload.array("images", 5), createProduct);

  router.get("/:id", getProductById); // Get a single product by its own ID

  // Routes for products associated with a specific store
  router
    .route("/stores/:storeId/products")
    .post(
      protect,
      authorize(["admin"]),
      upload.array("images", 5), // 'images' is the field name, allow up to 5 images
      createProduct
    )
    .get(getProductsByStore); // Public route to get all products for a specific store

  // Admin-only routes for updating and deleting products by their ID
  router
    .route("/:id")
    .put(
      protect,
      authorize(["admin"]),
      upload.array("images", 5), // Allow updating product images
      updateProduct
    )
    .delete(protect, authorize(["admin"]), deleteProduct);

  export default router;
  */
  // Ensure your `getProducts` function (from my previous `productController` example) is present and imported.
  // If not, use the `getProductsByStore` and select a store ID for testing.

  const handleDelete = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${productId}`, {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        });
        alert("Product deleted successfully!");
        fetchProducts(); // Refresh the list
      } catch (err: any) {
        console.error("Failed to delete product:", err);
        setError(
          "Failed to delete product. " +
            (err.response?.data?.message || "Server error.")
        );
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate("/admin/login");
        }
      }
    }
  };

  if (loading)
    return <div className="text-center p-8">Loading products...</div>;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Product Management
          </h1>
          <Link
            to="/admin/products/new" // Route to add new product
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Add New Product
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-center text-gray-600">
            No products found. Add a new one!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Image</th>
                  <th className="py-3 px-6 text-left">Name</th>
                  <th className="py-3 px-6 text-left">Store</th>
                  <th className="py-3 px-6 text-left">Price (Disc.)</th>
                  <th className="py-3 px-6 text-left">Code</th>
                  <th className="py-3 px-6 text-left">Stock</th>
                  <th className="py-3 px-6 text-left">Active</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm font-light">
                {products.map((product) => (
                  <tr
                    key={product._id as string}
                    className="border-b border-gray-200 hover:bg-gray-100"
                  >
                    <td className="py-3 px-6 text-left">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={`http://localhost:5000${product.images[0]}`} // Assumes images are served from /uploads
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded">
                          No Img
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-6 text-left font-medium">
                      {product.name}
                    </td>
                    <td className="py-3 px-6 text-left">
                      {typeof product.store === "object" &&
                      product.store !== null &&
                      "name" in product.store
                        ? (product.store as { name: string }).name
                        : "N/A"}
                    </td>{" "}
                    {/* Display store name */}
                    <td className="py-3 px-6 text-left">
                      ${product.price}
                      {product.discountedPrice
                        ? ` ($${product.discountedPrice})`
                        : ""}
                    </td>
                    <td className="py-3 px-6 text-left">
                      {product.discountCode}
                    </td>
                    <td className="py-3 px-6 text-left">{product.stock}</td>
                    <td className="py-3 px-6 text-left">
                      {product.isActive ? (
                        <span className="bg-green-200 text-green-800 py-1 px-3 rounded-full text-xs">
                          Yes
                        </span>
                      ) : (
                        <span className="bg-red-200 text-red-800 py-1 px-3 rounded-full text-xs">
                          No
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex item-center justify-center">
                        <Link
                          to={`/admin/products/edit/${product._id}`}
                          className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L7.5 21H3v-4.5L15.232 5.232z"
                            />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id as string)}
                          className="w-4 mr-2 transform hover:text-red-500 hover:scale-110"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductListPage;
