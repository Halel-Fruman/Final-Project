/**
 * @file AdminDashboard.jsx
 * @description This file contains the AdminDashboard component which displays
 * various analytics and statistics for the admin panel.
 */
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  Cell,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { FaStar } from "react-icons/fa";
import { fetchWithTokenRefresh } from "../../utils/authHelpers";
import * as XLSX from "xlsx";

/**
 * @function AdminDashboard
 * @description This component renders the admin dashboard with store sales statistics,
 * top products, and various filters for date ranges.
 */
const AdminDashboard = () => {
  const { t, i18n } = useTranslation();
  const [storeStats, setStoreStats] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const msInDay = 24 * 60 * 60 * 1000;
  const today = new Date();
  // palette – extend / tweak as needed
  const COLORS = [
    "#82ca9d",
    "#8884d8",
    "#ffc658",
    "#ff8c94",
    "#8dd1e1",
    "#a4de6c",
    "#d0ed57",
    "#ffc0cb",
  ];

  // Function to fetch statistics from the API
  // It handles both store sales and top products data
  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const query = [];
      if (fromDate) query.push(`from=${fromDate}`);
      if (toDate) query.push(`to=${toDate}`);
      const queryString = query.length ? `?${query.join("&")}` : "";

      const [storeRes, productRes] = await Promise.all([
        fetchWithTokenRefresh(`/api/analytics/store-sales${queryString}`),
        fetchWithTokenRefresh(`/api/analytics/top-products${queryString}`),
      ]);

      if (!storeRes.ok || !productRes.ok) throw new Error("Failed to fetch");

      const storeData = await storeRes.json();
      const productData = await productRes.json();
      // Map store data to include localized names based on the current language
      // This ensures that the store names are displayed correctly in the selected language
      setStoreStats(
        storeData.map((store) => ({
          ...store,
          name:
            store.storeName?.[i18n.language] ||
            store.storeName?.he ||
            "Unnamed",
        }))
      );
      // Set the top products data directly from the API response
      // This includes product names, store names, prices, and total sold quantities
      setTopProducts(productData);
    } catch (err) {
      console.error("Failed to load statistics:", err);
      setError(t("sysadmin.errors.fetchFailed"));
    } finally {
      // Reset loading state after fetching data
      // This ensures that the loading indicator is removed once the data is fetched
      setIsLoading(false);
    }
  };
  // Fetch statistics when the component mounts or when the language changes
  // This ensures that the dashboard updates with the latest data and translations
  useEffect(() => {
    fetchStats();
  }, [i18n.language]);

  // Custom tick component for the X-axis
  // This component formats the tick labels to handle long names by splitting them into multiple lines
  const CustomTick = ({ x, y, payload }) => {
    const lines = payload.value.split(" ");
    return (
      <g transform={`translate(${x},${y})`}>
        {lines.map((line, index) => (
          <text
            key={index}
            x={0}
            y={index * 12}
            textAnchor="middle"
            fontSize={16}
            dominantBaseline="hanging">
            {line}
          </text>
        ))}
      </g>
    );
  };

  // helper – format as YYYY-MM-DD in local timezone
  const fmt = (d) => d.toLocaleDateString("en-CA");

  // previous calendar month
  const setLastMonth = () => {
    const firstThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastPrev = new Date(firstThisMonth - msInDay); // last day prev-month
    const firstPrev = new Date(lastPrev.getFullYear(), lastPrev.getMonth(), 1);
    setFromDate(fmt(firstPrev));
    setToDate(fmt(lastPrev));
  };

  // current month to today
  const setCurrentMonth = () => {
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    setFromDate(fmt(first));
    setToDate(fmt(today));
  };

  // reset date filters to empty strings
  const resetDates = () => {
    setFromDate("");
    setToDate("");
  };

  // build and download .xlsx for current storeStats
  const exportExcel = () => {
    if (!storeStats.length) return;

    const rows = storeStats.map((s) => ({
      Store: s.name,
      Revenue: s.totalRevenue, // keep as number
      Orders: s.totalOrders,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "StoreSales");

    /* set number-format “₪#,##0.00” on Revenue column (col B) */
    for (let r = 2; r <= storeStats.length + 1; r++) {
      const cell = ws[`B${r}`];
      if (cell) cell.z = "₪#,##0.00";
    }

    XLSX.writeFile(
      wb,
      `store-sales_${fromDate || "all"}_${toDate || "all"}.xlsx`
    );
  };

  return (
    <div className="p-6 bg-white h-fit">
      <h1 className="text-3xl font-bold text-primaryColor mb-6 text-center">
        {t("sysadmin.dashboard.title")}
      </h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6 items-end">
        <div className="flex flex-col ">
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
        <div className="flex flex-col ">
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
          className="bg-primaryColor text-white  text-xl font-bold px-4 py-2 rounded mt-1 sm:mt-6 hover:bg-secondaryColor">
          {t("sysadmin.dashboard.filter")}
        </button>

        <button
          onClick={resetDates}
          className="text-primaryColor border border-primaryColor bg-white  text-xl font-bold px-4 py-2 rounded mt-1 sm:mt-6 hover:bg-primaryColor hover:text-white">
          {t("sysadmin.dashboard.reset")}
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        <button
          onClick={setLastMonth}
          className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
          {t("sysadmin.dashboard.lastMonth")}
        </button>
        <button
          onClick={setCurrentMonth}
          className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">
          {t("sysadmin.dashboard.currentMonth")}
        </button>
        <button
          onClick={exportExcel}
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
          {t("sysadmin.dashboard.exportExcel")}
        </button>
      </div>

      {error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : isLoading ? (
        <p className="text-center text-gray-500">{t("loading")}</p>
      ) : (
        <>
          {/* Revenue Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-lg font-semibold mb-4 ">
                {t("sysadmin.dashboard.totalRevenue")}
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={storeStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={<CustomTick />} />
                  <YAxis
                    width={90}
                    tickMargin={10}
                    textAnchor="start"
                    tickFormatter={(v) => `₪${v.toLocaleString()}`}
                  />
                  <Tooltip
                    formatter={(v) => [
                      `₪${v.toLocaleString()}`,
                      t("sysadmin.dashboard.totalRevenue"),
                    ]}
                  />
                  <Bar dataKey="totalRevenue">
                    {storeStats.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Bar>{" "}
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-lg font-semibold mb-4 ">
                {t("sysadmin.dashboard.ordersCount")}
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={storeStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={<CustomTick />} />
                  <YAxis width={90} tickMargin={10} textAnchor="start" />
                  <Tooltip
                    formatter={(v) => [
                      v.toLocaleString(),
                      t("sysadmin.dashboard.ordersCount"),
                    ]}
                  />
                  <Bar dataKey="totalOrders">
                    {storeStats.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Bar>{" "}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white mt-8 p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaStar className="text-yellow-500" />
              {t("sysadmin.dashboard.topProducts")}
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border border-gray-200">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left">
                      {t("sysadmin.dashboard.productName")}
                    </th>
                    <th className="px-4 py-2 text-left">
                      {t("sysadmin.dashboard.storeName")}
                    </th>
                    <th className="px-4 py-2 text-left">
                      {t("sysadmin.dashboard.price")}
                    </th>
                    <th className="px-4 py-2 text-left">
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
