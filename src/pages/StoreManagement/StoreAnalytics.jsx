/**
 * @file StoreAnalytics.jsx
 * @description Displays analytics for a store including monthly revenue and product category breakdowns.
 */

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { FaChartLine } from "react-icons/fa";
import { fetchWithTokenRefresh } from "../../utils/authHelpers";

const COLORS = [
  "#4CAF50",
  "#2196F3",
  "#FFC107",
  "#FF5722",
  "#9C27B0",
  "#00BCD4",
];

/**
 * StoreAnalytics component shows revenue by month and products breakdown by category.
 * @param {Object} props - Component props.
 * @param {string} props.storeId - Store ID to fetch analytics for.
 */
const StoreAnalytics = ({ storeId }) => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const transactionRes = await fetchWithTokenRefresh(
          `/api/Transactions/transactions/${storeId}`
        );
        const transactions = await transactionRes.json();

        // Extract all unique product IDs from all transactions
        const allProductIds = [
          ...new Set(
            transactions.flatMap((tx) => tx.products.map((p) => p.productId))
          ),
        ];

        // Fetch all product details in batch
        const productRes = await fetchWithTokenRefresh("/api/Products/batch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids: allProductIds }),
        });
        const allProducts = await productRes.json();

        // Create map for quick product lookup
        const productMap = {};
        allProducts.forEach((p) => {
          productMap[p._id] = p;
        });

        // Fetch all categories for ID to name mapping
        const categoriesRes = await fetchWithTokenRefresh("/api/Category");
        const categories = await categoriesRes.json();
        const categoryMap = {};
        categories.forEach((c) => {
          categoryMap[c._id] = c.name?.he || "לא ידוע";
        });

        // Process and group data
        setMonthlyData(groupTransactionsByMonth(transactions));
        setCategoryData(
          groupProductsByCategory(transactions, productMap, categoryMap)
        );
      } catch (err) {
        console.error("Failed to load analytics data:", err);
      }
    };

    fetchData();
  }, [storeId]);

  /**
   * Groups transactions by month and calculates total revenue per month.
   * @param {Array} transactions - List of store transactions.
   * @returns {Array} Monthly revenue data.
   */
  const groupTransactionsByMonth = (transactions) => {
    const monthsMap = {};
    transactions.forEach((tx) => {
      const date = new Date(tx.createdAt);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      if (!monthsMap[monthKey]) {
        monthsMap[monthKey] = 0;
      }
      monthsMap[monthKey] += tx.totalAmount;
    });

    const sortedKeys = Object.keys(monthsMap).sort();
    return sortedKeys.map((key) => ({
      month: key,
      revenue: monthsMap[key],
    }));
  };

  /**
   * Groups all products in transactions by category and counts quantities.
   * @param {Array} transactions - List of store transactions.
   * @param {Object} productMap - Map of productId to product details.
   * @param {Object} categoryMap - Map of categoryId to category name.
   * @returns {Array} Pie chart compatible data.
   */
  const groupProductsByCategory = (transactions, productMap, categoryMap) => {
    const categoryCount = {};

    transactions.forEach((tx) => {
      tx.products.forEach(({ productId, quantity }) => {
        const product = productMap[productId];
        if (!product || !Array.isArray(product.categories)) return;

        product.categories.forEach((catId) => {
          const name = categoryMap[catId] || "לא ידוע";
          if (!categoryCount[name]) categoryCount[name] = 0;
          categoryCount[name] += quantity;
        });
      });
    });

    return Object.entries(categoryCount).map(([name, value]) => ({
      name,
      value,
    }));
  };

  return (
    <div className="p-6 w-full space-y-10">
      <h1 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
        <FaChartLine className="text-primaryColor" /> ניתוח הכנסות לפי חודשים
      </h1>

      <div className="bg-white rounded shadow p-4">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={monthlyData}
            margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              angle={-30}
              textAnchor="end"
              height={80}
              interval={0}
              dy={30}
              dx={-20}
            />

            <YAxis
              // dx ={-50}
            tickMargin={50}
              alignmentBaseline="middle"
            />
            <Tooltip formatter={(value) => `${value.toFixed(2)} ₪`} />
            <Bar dataKey="revenue" fill="#4CAF50" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h2 className="text-xl font-bold text-center">פילוח לפי קטגוריות</h2>
      <div className="bg-white rounded shadow p-4">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={categoryData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={130}
              labelLine={false}
              label>
              {categoryData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value} מוצרים`} />
            <Legend verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StoreAnalytics;
