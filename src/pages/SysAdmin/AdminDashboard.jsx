import  { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { fetchWithTokenRefresh } from "../../utils/authHelpers";

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

      setStoreStats(
        storeData.map((store) => ({
          ...store,
          name:
            store.storeName?.[i18n.language] ||
            store.storeName?.he ||
            "Unnamed",
        }))
      );
      setTopProducts(productData);
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
          className="bg-primaryColor text-white  text-xl font-bold px-4 py-2 rounded mt-1 sm:mt-6 hover:bg-secondaryColor">
          {t("sysadmin.dashboard.filter")}
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
              <h2 className="text-lg font-semibold mb-4 text-right">
                {t("sysadmin.dashboard.totalRevenue")}
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={storeStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={<CustomTick />} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalRevenue" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-lg font-semibold mb-4 text-right">
                {t("sysadmin.dashboard.ordersCount")}
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={storeStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={<CustomTick />} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalOrders" fill="#8884d8" />
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
