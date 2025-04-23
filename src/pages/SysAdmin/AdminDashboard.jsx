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
} from "recharts";

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

      const [salesRes, topRes] = await Promise.all([
        axios.get(`/api/analytics/store-sales${queryString}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`/api/analytics/top-products${queryString}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const formattedSales = salesRes.data.map((store) => ({
        ...store,
        name:
          store.storeName?.[i18n.language] || store.storeName?.he || "Unnamed",
      }));

      setStoreStats(formattedSales);
      setTopProducts(topRes.data);
    } catch (err) {
      console.error("Failed to load statistics:", err);
      setError(t("sysadmin.errors.fetchFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  return (
    <div className="p-6 bg-gray-50 h-full">
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
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border px-3 py-2 rounded shadow"
          />
        </div>

        <button
          onClick={fetchStats}
          className="bg-primaryColor text-white px-4 py-2 rounded mt-1 sm:mt-6 hover:bg-secondaryColor">
          {t("sysadmin.dashboard.filter")}
        </button>
      </div>

      {error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : isLoading ? (
        <p className="text-center text-gray-600">{t("loading")}</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Total Revenue Chart */}
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold mb-4 text-right">
              {t("sysadmin.dashboard.totalRevenue")}
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={storeStats}
                margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
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

          {/* Top Products Card */}
          <div className="bg-white p-6 rounded shadow col-span-1 lg:col-span-1">
            <h2 className="text-lg font-semibold mb-4 text-right">
              {t("sysadmin.dashboard.topProducts")}
            </h2>
            <ol className="list-decimal pr-4 space-y-2 text-right text-sm text-gray-700">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <li key={index}>
                    {product.name} — {t("sysadmin.dashboard.sold")}:{" "}
                    {product.totalSold}
                  </li>
                ))
              ) : (
                <p className="text-gray-500">
                  {t("sysadmin.dashboard.noProducts")}
                </p>
              )}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
