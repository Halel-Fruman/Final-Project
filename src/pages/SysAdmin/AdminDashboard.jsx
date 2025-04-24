// File: src/pages/SysAdmin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { FaStar } from "react-icons/fa";

const AdminDashboard = () => {
  const { t, i18n } = useTranslation();
  const [storeStats, setStoreStats] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const query = [];
      if (fromDate) query.push(`from=${fromDate}`);
      if (toDate) query.push(`to=${toDate}`);
      const queryString = query.length ? `?${query.join("&")}` : "";

      const [storeRes, productRes] = await Promise.all([
        axios.get(`/api/analytics/store-sales${queryString}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`/api/analytics/top-products${queryString}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const formattedStores = storeRes.data.map((store) => ({
        ...store,
        name:
          store.storeName?.[i18n.language] || store.storeName?.he || "Unnamed",
      }));

      setStoreStats(formattedStores);
      setTopProducts(productRes.data);
    } catch (err) {
      console.error("Failed to load statistics:", err);
      setError(t("sysadmin.errors.fetchFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [i18n.language]);

  return (
    <div className="p-6 bg-gray-50 h-fit">
      <h1 className="text-3xl font-bold text-primaryColor mb-6 text-center">
        {t("sysadmin.dashboard.title")}
      </h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6 items-end">
        <div className="flex flex-col text-right">
          <label className="mb-1 text-sm font-medium text-gray-700">
            {t("sysadmin.dashboard.fromDate")}
          </label>
          <input
            name="fromDate"
            id="fromDate"
            aria-label="fromDate"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border px-3 py-2 rounded shadow"
          />
        </div>

        <div className="flex flex-col text-right">
          <label className="mb-1 text-sm font-medium text-gray-700">
            {t("sysadmin.dashboard.toDate")}
          </label>
          <input
            name="toDate"
            type="date"
            aria-label="toDate"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border px-3 py-2 rounded shadow"
          />
        </div>

        <button
          onClick={fetchStats}
          className="bg-primaryColor text-white  text-xl font-bold px-4 py-2 rounded mt-1 sm:mt-6 hover:bg-secondaryColor">
          {t("sysadmin.dashboard.filter")}
        </button>
      </div>

      {error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : isLoading ? (
        <div className="space-y-8">
          {/* Skeleton for Filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6 items-end">
            <div className="w-40 h-10 bg-gray-200 rounded animate-pulse" />
            <div className="w-40 h-10 bg-gray-200 rounded animate-pulse" />
            <div className="w-24 h-10 bg-gray-300 rounded animate-pulse" />
          </div>

          {/* Skeleton for Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded shadow space-y-4">
              <div className="w-1/2 h-6 bg-gray-300 rounded animate-pulse" />
              <div className="w-full h-64 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="bg-white p-6 rounded shadow space-y-4">
              <div className="w-1/2 h-6 bg-gray-300 rounded animate-pulse" />
              <div className="w-full h-64 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>

          {/* Skeleton for Top Products Table */}
          <div className="bg-white mt-8 p-6 rounded shadow space-y-4">
            <div className="w-1/3 h-6 bg-gray-300 rounded animate-pulse" />
            <div className="overflow-x-auto">
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between gap-4 text-sm">
                    <div className="h-5 bg-gray-200 rounded w-1/4 animate-pulse" />
                    <div className="h-5 bg-gray-200 rounded w-1/4 animate-pulse" />
                    <div className="h-5 bg-gray-200 rounded w-1/6 animate-pulse" />
                    <div className="h-5 bg-gray-200 rounded w-1/6 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className=" grid grid-cols-1 lg:grid-cols-2 gap-8 ">
            {/* Total Revenue Chart */}
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-lg font-semibold mb-4 text-right">
                {t("sysadmin.dashboard.totalRevenue")}
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={storeStats}
                  margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    interval={0}
                    angle={0}
                    textAnchor="middle"
                  />
                  <YAxis
                    orientation="left"
                    tick={{ dx: -5, textAnchor: "start" }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="totalRevenue"
                    fill="#82ca9d"
                    name={t("sysadmin.dashboard.totalRevenue")}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Total Orders Chart */}
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-lg font-semibold mb-4 text-right">
                {t("sysadmin.dashboard.ordersCount")}
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={storeStats}
                  margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    interval={0}
                    angle={0}
                    textAnchor="middle"
                  />
                  <YAxis
                    orientation="left"
                    tick={{ dx: -5, textAnchor: "start" }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="totalOrders"
                    fill="#8884d8"
                    name={t("sysadmin.dashboard.ordersCount")}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products Section */}
          {/* Top Products Section */}
          <div className="bg-white mt-8 p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaStar className="text-yellow-500" />
              {t("sysadmin.dashboard.topProducts")}
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border border-gray-200">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-right">
                      {t("sysadmin.dashboard.productName")}
                    </th>
                    <th className="px-4 py-2 text-right">
                      {t("sysadmin.dashboard.storeName")}
                    </th>
                    <th className="px-4 py-2 text-right">
                      {t("sysadmin.dashboard.price")}
                    </th>
                    <th className="px-4 py-2 text-right">
                      {t("sysadmin.dashboard.sold")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, idx) => (
                    <tr
                      key={idx}
                      className="border-t text-gray-800 hover:bg-gray-50">
                      <td className="px-4 py-2">{product.name}</td>
                      <td className="px-4 py-2">
                        {product.storeName?.[i18n.language] ||
                          product.storeName?.he ||
                          "—"}
                      </td>
                      <td className="px-4 py-2">
                        ₪{product.price?.toFixed(2) || "—"}
                      </td>
                      <td className="px-4 py-2">{product.totalSold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
