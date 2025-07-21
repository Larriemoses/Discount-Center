// client/src/pages/AdminAnalyticsPage.tsx

import { useState, useEffect, useCallback } from "react";
// import axios from "axios"; // <--- REMOVE this import
import axiosInstance from "../utils/axiosInstance"; // <--- ADD this import
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import type { IProductApi } from "@common/types/IProductTypes";

interface AnalyticsData {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  totalLikes: number;
  totalDislikes: number;
  totalUsesAcrossAllProducts: number;
}

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A2D9CE",
  "#F5B7B1",
  "#D7BDE2",
];

const AdminAnalyticsPage: React.FC = () => {
  const [overallStats, setOverallStats] = useState<AnalyticsData | null>(null);
  const [topByUses, setTopByUses] = useState<IProduct[]>([]);
  const [topBySuccessRate, setTopBySuccessRate] = useState<IProduct[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<IProduct[]>([]);
  const [dailyUsageSummary, setDailyUsageSummary] = useState<{
    totalTodayUses: number;
    data: IProduct[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const adminToken = localStorage.getItem("adminToken");

  const fetchAnalytics = useCallback(async () => {
    const commonHeaders = {
      headers: { Authorization: `Bearer ${adminToken}` },
    };

    setLoading(true);
    setError("");
    try {
      const [
        overallRes,
        topUsesRes,
        topSuccessRes,
        lowStockRes,
        dailyUsageRes,
      ] = await Promise.all([
        // Use axiosInstance and relative paths
        axiosInstance.get("/products/analytics/overall-stats", commonHeaders),
        axiosInstance.get("/products/analytics/top-by-uses", commonHeaders),
        axiosInstance.get(
          "/products/analytics/top-by-success-rate",
          commonHeaders
        ),
        axiosInstance.get(
          "/products/analytics/low-stock?threshold=5",
          commonHeaders
        ),
        axiosInstance.get("/products/analytics/daily-summary", commonHeaders),
      ]);

      setOverallStats(overallRes.data.data);
      setTopByUses(topUsesRes.data.data);
      setTopBySuccessRate(topSuccessRes.data.data);
      setLowStockProducts(lowStockRes.data.data);
      setDailyUsageSummary(dailyUsageRes.data);
    } catch (err: any) {
      console.error("Failed to fetch analytics:", err);
      setError(
        "Failed to load analytics data. " +
          (err.response?.data?.message || "Server error.")
      );
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  }, [adminToken, navigate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // ... (rest of your component remains the same, no changes needed below this line)

  // Data for Active vs Inactive Products Pie Chart
  const pieChartData = overallStats
    ? [
        { name: "Active Products", value: overallStats.activeProducts },
        { name: "Inactive Products", value: overallStats.inactiveProducts },
      ]
    : [];

  if (loading)
    return <div className="text-center p-8">Loading analytics...</div>;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6 flex-col sm:flex-row gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left">
            Analytics & Reports
          </h1>
          <Link
            to="/admin/dashboard"
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 text-center"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Overall Product Statistics */}
        <section className="mb-10 p-4 border rounded-lg bg-gray-50 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-6 border-b pb-2">
            Overall Product Statistics
          </h2>
          {overallStats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-5 rounded-lg shadow-md text-center">
                <p className="text-3xl font-extrabold text-blue-800">
                  {overallStats.totalProducts}
                </p>
                <p className="text-sm text-blue-600 font-medium mt-1">
                  Total Products
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-100 to-green-200 p-5 rounded-lg shadow-md text-center">
                <p className="text-3xl font-extrabold text-green-800">
                  {overallStats.activeProducts}
                </p>
                <p className="text-sm text-green-600 font-medium mt-1">
                  Active Products
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-100 to-red-200 p-5 rounded-lg shadow-md text-center">
                <p className="text-3xl font-extrabold text-red-800">
                  {overallStats.inactiveProducts}
                </p>
                <p className="text-sm text-red-600 font-medium mt-1">
                  Inactive Products
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-5 rounded-lg shadow-md text-center">
                <p className="text-3xl font-extrabold text-purple-800">
                  {overallStats.totalUsesAcrossAllProducts}
                </p>
                <p className="text-sm text-purple-600 font-medium mt-1">
                  Total All-Time Uses
                </p>
              </div>
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-5 rounded-lg shadow-md text-center">
                <p className="text-3xl font-extrabold text-yellow-800">
                  {overallStats.totalLikes}
                </p>
                <p className="text-sm text-yellow-600 font-medium mt-1">
                  Total Likes
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-5 rounded-lg shadow-md text-center">
                <p className="text-3xl font-extrabold text-orange-800">
                  {overallStats.totalDislikes}
                </p>
                <p className="text-sm text-orange-600 font-medium mt-1">
                  Total Dislikes
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center">
              No overall stats available.
            </p>
          )}

          {/* Active vs Inactive Products Pie Chart */}
          {overallStats &&
            (overallStats.activeProducts > 0 ||
              overallStats.inactiveProducts > 0) && (
              <div className="mt-8 p-4 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
                  Active vs. Inactive Products
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                    >
                      {pieChartData.map((entry, index) => (
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
            )}
        </section>

        {/* Daily Usage Summary */}
        <section className="mb-10 p-4 border rounded-lg bg-gray-50 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-6 border-b pb-2">
            Daily Usage Summary
          </h2>
          {dailyUsageSummary && dailyUsageSummary.totalTodayUses > 0 ? (
            <>
              <p className="mb-4 text-lg text-gray-700">
                <span className="font-bold text-xl text-blue-700">
                  {dailyUsageSummary.totalTodayUses}
                </span>{" "}
                total product interactions today.
              </p>
              <div className="overflow-x-auto rounded-lg shadow-md">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-200 text-gray-600 uppercase text-xs sm:text-sm leading-normal">
                      <th className="py-3 px-6 text-left">Product Name</th>
                      <th className="py-3 px-6 text-left">Today's Uses</th>
                      <th className="py-3 px-6 text-left">Store</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700 text-sm font-light">
                    {dailyUsageSummary.data.map((product) => (
                      <tr
                        key={product._id as string}
                        className="border-b border-gray-200 hover:bg-gray-100"
                      >
                        <td className="py-3 px-6">{product.name}</td>
                        <td className="py-3 px-6">{product.todayUses || 0}</td>
                        <td className="py-3 px-6">
                          {typeof product.store === "object" &&
                          "name" in product.store
                            ? (product.store as { name: string }).name
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center">
              No product uses recorded today yet.
            </p>
          )}
        </section>

        {/* Top 10 Products by Total Uses */}
        <section className="mb-10 p-4 border rounded-lg bg-gray-50 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-6 border-b pb-2">
            Top 10 Products by Total Uses
          </h2>
          {topByUses.length > 0 ? (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/2 overflow-x-auto rounded-lg shadow-md">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-200 text-gray-600 uppercase text-xs sm:text-sm leading-normal">
                      <th className="py-3 px-6 text-left">Product Name</th>
                      <th className="py-3 px-6 text-left">Store</th>
                      <th className="py-3 px-6 text-left">Total Uses</th>
                      <th className="py-3 px-6 text-left">Success Rate</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700 text-sm font-light">
                    {topByUses.map((product) => (
                      <tr
                        key={product._id as string}
                        className="border-b border-gray-200 hover:bg-gray-100"
                      >
                        <td className="py-3 px-6">{product.name}</td>
                        <td className="py-3 px-6">
                          {typeof product.store === "object" &&
                          "name" in product.store
                            ? (product.store as { name: string }).name
                            : "N/A"}
                        </td>
                        <td className="py-3 px-6">{product.totalUses || 0}</td>
                        <td className="py-3 px-6">
                          {product.successRate || 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="w-full md:w-1/2 p-4 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
                  Total Uses Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={topByUses.map((p) => ({
                      name: p.name,
                      uses: p.totalUses || 0,
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="uses" fill="#8884d8" name="Total Uses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center">
              No top products by uses yet.
            </p>
          )}
        </section>

        {/* Top 10 Products by Success Rate */}
        <section className="mb-10 p-4 border rounded-lg bg-gray-50 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-6 border-b pb-2">
            Top 10 Products by Success Rate
          </h2>
          {topBySuccessRate.length > 0 ? (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/2 overflow-x-auto rounded-lg shadow-md">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-200 text-gray-600 uppercase text-xs sm:text-sm leading-normal">
                      <th className="py-3 px-6 text-left">Product Name</th>
                      <th className="py-3 px-6 text-left">Store</th>
                      <th className="py-3 px-6 text-left">Success Rate</th>
                      <th className="py-3 px-6 text-left">Total Uses</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700 text-sm font-light">
                    {topBySuccessRate.map((product) => (
                      <tr
                        key={product._id as string}
                        className="border-b border-gray-200 hover:bg-gray-100"
                      >
                        <td className="py-3 px-6">{product.name}</td>
                        <td className="py-3 px-6">
                          {typeof product.store === "object" &&
                          "name" in product.store
                            ? (product.store as { name: string }).name
                            : "N/A"}
                        </td>
                        <td className="py-3 px-6">
                          {product.successRate || 0}%
                        </td>
                        <td className="py-3 px-6">{product.totalUses || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="w-full md:w-1/2 p-4 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
                  Success Rate Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={topBySuccessRate.map((p) => ({
                      name: p.name,
                      rate: p.successRate || 0,
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="rate"
                      fill="#82ca9d"
                      name="Success Rate (%)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center">
              No top products by success rate yet.
            </p>
          )}
        </section>

        {/* Low Stock Products */}
        <section className="mb-8 p-4 border rounded-lg bg-gray-50 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-6 border-b pb-2">
            Products with Low Stock ( &lt;= 5)
          </h2>
          {lowStockProducts.length > 0 ? (
            <div className="overflow-x-auto rounded-lg shadow-md">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-200 text-gray-600 uppercase text-xs sm:text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Product Name</th>
                    <th className="py-3 px-6 text-left">Store</th>
                    <th className="py-3 px-6 text-left">Current Stock</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 text-sm font-light">
                  {lowStockProducts.map((product) => (
                    <tr
                      key={product._id as string}
                      className="border-b border-gray-200 hover:bg-gray-100"
                    >
                      <td className="py-3 px-6">{product.name}</td>
                      <td className="py-3 px-6">
                        {typeof product.store === "object" &&
                        "name" in product.store
                          ? (product.store as { name: string }).name
                          : "N/A"}
                      </td>
                      <td className="py-3 px-6">{product.stock || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center">
              No products with low stock.
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
