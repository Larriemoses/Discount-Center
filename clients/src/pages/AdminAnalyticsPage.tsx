// src/pages/AdminAnalyticsPage.tsx
import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { Link, useNavigate } from "react-router-dom";
// Removed unused IProductApi import
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { IProductApi } from "@common/types/IProductTypes"; // <--- ADD 'type' keyword and use IProductApi

const AdminAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const adminToken = localStorage.getItem("adminToken");

  const [totalProducts, setTotalProducts] = useState(0);
  const [totalStores, setTotalStores] = useState(0);
  const [totalUsesToday, setTotalUsesToday] = useState(0);
  const [totalLikesDislikes, setTotalLikesDislikes] = useState({
    likes: 0,
    dislikes: 0,
  });
  const [averageSuccessRate, setAverageSuccessRate] = useState(0);

  const [topByUses, setTopByUses] = useState<IProductApi[]>([]); // <--- Use IProductApi
  const [topBySuccessRate, setTopBySuccessRate] = useState<IProductApi[]>([]); // <--- Use IProductApi
  const [lowStockProducts, setLowStockProducts] = useState<IProductApi[]>([]); // <--- Use IProductApi

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interface for common API response structure
  interface ApiResponse<T> {
    success: boolean;
    count?: number;
    data: T;
  }

  // Define specific response interfaces for clarity
  interface ProductsResponseData {
    totalProducts: number;
    topByUses: IProductApi[];
    topBySuccessRate: IProductApi[];
    lowStockProducts: IProductApi[];
  }

  interface StoresResponseData {
    totalStores: number;
  }

  interface UsesResponseData {
    totalUsesToday: number;
  }

  interface LikesDislikesResponseData {
    totalLikes: number;
    totalDislikes: number;
  }

  interface AverageSuccessRateResponseData {
    averageSuccessRate: number;
  }

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!adminToken) {
          navigate("/admin/login");
          return;
        }

        const headers = { Authorization: `Bearer ${adminToken}` };

        // Fetch all data concurrently
        const [
          productsRes,
          storesRes,
          usesRes,
          likesDislikesRes,
          successRateRes,
        ] = await Promise.all([
          axiosInstance.get<ApiResponse<ProductsResponseData>>(
            "/products/analytics",
            { headers }
          ),
          axiosInstance.get<ApiResponse<StoresResponseData>>(
            "/stores/analytics",
            { headers }
          ),
          axiosInstance.get<ApiResponse<UsesResponseData>>(
            "/products/analytics/uses-today",
            { headers }
          ),
          axiosInstance.get<ApiResponse<LikesDislikesResponseData>>(
            "/products/analytics/likes-dislikes",
            { headers }
          ),
          axiosInstance.get<ApiResponse<AverageSuccessRateResponseData>>(
            "/products/analytics/average-success-rate",
            { headers }
          ),
        ]);

        setTotalProducts(productsRes.data.data.totalProducts);
        setTopByUses(productsRes.data.data.topByUses);
        setTopBySuccessRate(productsRes.data.data.topBySuccessRate);
        setLowStockProducts(productsRes.data.data.lowStockProducts);

        setTotalStores(storesRes.data.data.totalStores);
        setTotalUsesToday(usesRes.data.data.totalUsesToday);
        setTotalLikesDislikes({
          likes: likesDislikesRes.data.data.totalLikes,
          dislikes: likesDislikesRes.data.data.totalDislikes,
        });
        setAverageSuccessRate(successRateRes.data.data.averageSuccessRate);
      } catch (err: any) {
        console.error("Failed to fetch analytics data:", err);
        setError(
          "Failed to load analytics: " +
            (err.response?.data?.message || err.message)
        );
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate("/admin/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [adminToken, navigate]);

  if (loading) {
    return (
      <div className="pt-[7rem] min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-700">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-[7rem] min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <p className="text-lg text-red-600 mb-4">{error}</p>
        <Link to="/admin/dashboard" className="text-purple-600 hover:underline">
          Go back to Dashboard
        </Link>
      </div>
    );
  }

  const pieChartData = [
    { name: "Likes", value: totalLikesDislikes.likes },
    { name: "Dislikes", value: totalLikesDislikes.dislikes },
  ];

  const COLORS = ["#82ca9d", "#ffc658"]; // Green for likes, Orange for dislikes

  return (
    <div className="pt-[2rem] min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Admin Analytics Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Products */}
          <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-blue-800">
              Total Products
            </h2>
            <p className="text-3xl font-bold text-blue-600">{totalProducts}</p>
          </div>

          {/* Total Stores */}
          <div className="bg-green-50 p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-green-800">
              Total Stores
            </h2>
            <p className="text-3xl font-bold text-green-600">{totalStores}</p>
          </div>

          {/* Total Uses Today */}
          <div className="bg-yellow-50 p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-yellow-800">
              Uses Today
            </h2>
            <p className="text-3xl font-bold text-yellow-600">
              {totalUsesToday}
            </p>
          </div>

          {/* Average Success Rate */}
          <div className="bg-purple-50 p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-purple-800">
              Avg. Success Rate
            </h2>
            <p className="text-3xl font-bold text-purple-600">
              {averageSuccessRate.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Charts and Top Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Likes vs Dislikes Chart */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Likes vs Dislikes
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  // --- FIX HERE ---
                  // Option 1: Nullish Coalescing Operator (Recommended)
                  label={({ name, percent }) =>
                    `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  // Option 2: Conditional Check
                  // label={({ name, percent }) => `${name}: ${percent !== undefined ? (percent * 100).toFixed(0) : 'N/A'}%`}
                >
                  {pieChartData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Products by Uses */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Top 5 Products by Uses
            </h2>
            {topByUses.length === 0 ? (
              <p className="text-gray-600">No data available.</p>
            ) : (
              <ul className="list-disc pl-5 space-y-2">
                {topByUses.map((product) => (
                  <li key={product._id} className="text-gray-700">
                    {product.name} - {product.totalUses} uses
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Top Products by Success Rate */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Top 5 Products by Success Rate
            </h2>
            {topBySuccessRate.length === 0 ? (
              <p className="text-gray-600">No data available.</p>
            ) : (
              <ul className="list-disc pl-5 space-y-2">
                {topBySuccessRate.map((product) => (
                  <li key={product._id} className="text-gray-700">
                    {product.name} - {product.successRate?.toFixed(2)}%
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Low Stock Products */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Low Stock Products ( &lt; 10)
            </h2>
            {lowStockProducts.length === 0 ? (
              <p className="text-gray-600">No low stock products.</p>
            ) : (
              <ul className="list-disc pl-5 space-y-2">
                {lowStockProducts.map((product) => (
                  <li key={product._id} className="text-gray-700">
                    {product.name} - Stock: {product.stock}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
