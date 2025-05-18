// קובץ: StoreAnalytics.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
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

const StoreAnalytics = ({ storeId }) => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchWithTokenRefresh(
          `/api/Transactions/transactions/${storeId}`
        );
        const data = await res.json();
        setMonthlyData(groupTransactionsByMonth(data));
        setCategoryData(groupProductsByCategory(data));
      } catch (err) {
        console.error("שגיאה בטעינת נתונים:", err);
      }
    };

    fetchData();
  }, [storeId]);

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

  const groupProductsByCategory = (transactions) => {
    const categoryMap = {};
    transactions.forEach((tx) => {
      tx.products.forEach((p) => {
        const category = p.categoryName || "ללא קטגוריה";
        if (!categoryMap[category]) {
          categoryMap[category] = 0;
        }
        categoryMap[category] += p.quantity;
      });
    });

    return Object.entries(categoryMap).map(([name, value]) => ({
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
            />
            <YAxis />
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
