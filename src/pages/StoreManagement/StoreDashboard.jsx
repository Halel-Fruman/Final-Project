// קובץ: StoreDashboard.jsx - מציג סטטיסטיקות לחנות
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaChartBar,
  FaMoneyBillWave,
  FaUsers,
  FaBox,
  FaClock,
  FaExclamationTriangle,
  FaTruck,
  FaSync,
  FaExclamationCircle,
  FaBoxOpen,
  FaShippingFast,
  FaCheckCircle,
} from "react-icons/fa";
import { useAlert } from "../../components/AlertDialog.jsx";

const StoreDashboard = ({ storeId }) => {
  const [transactions, setTransactions] = useState([]);
  const { showAlert } = useAlert();
  const [stats, setStats] = useState({});
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showAllTimeRevenue, setShowAllTimeRevenue] = useState(false);
  const [customRangeRevenue, setCustomRangeRevenue] = useState(0); // משתנה חדש

  useEffect(() => {
    axios
      .get(`/api/Transactions/transactions/${storeId}`)
      .then((res) => {
        setTransactions(res.data);
        calculateStats(res.data);
        const currentMonthStart = new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1
        )
          .toISOString()
          .split("T")[0];
        const currentDate = new Date().toISOString().split("T")[0];
        calculateRevenueByDateRange(
          res.data,
          currentMonthStart,
          currentDate,
          setMonthlyRevenue
        );

        calculateRevenueByDateRange(
          res.data,
          startDate,
          endDate,
          setCustomRangeRevenue
        );
      })
      .catch(() => showAlert("שגיאה בקבלת נתוני העסקאות", "error"));
  }, [storeId]);

  useEffect(() => {
    calculateRevenueByDateRange(
      transactions,
      startDate,
      endDate,
      setCustomRangeRevenue
    );
  }, [startDate, endDate]);

  const calculateStats = (transactions) => {
    const totals = {
      totalRevenue: 0,
      totalOrders: transactions.length,
      totalProductsSold: 0,
      customers: new Set(),
      byStatus: {},
      lastOrderDate: null,
      pendingCount: 0,
      overdueCount: 0,
      deliveryOverdueCount: 0,
    };

    transactions.forEach((tx) => {
      totals.totalRevenue += tx.totalAmount;
      tx.products.forEach((p) => (totals.totalProductsSold += p.quantity));
      totals.customers.add(tx.buyerDetails.email);
      totals.byStatus[tx.status] = (totals.byStatus[tx.status] || 0) + 1;
      if (
        !totals.lastOrderDate ||
        new Date(tx.createdAt) > new Date(totals.lastOrderDate)
      ) {
        totals.lastOrderDate = tx.createdAt;
      }

      if (tx.status === "pending") {
        totals.pendingCount += 1;
        if (isOverdue(tx.createdAt)) totals.overdueCount += 1;
      }

      if (tx.delivery?.estimatedDelivery && !tx.delivery?.deliveryDate) {
        const now = new Date();
        const estimated = new Date(tx.delivery.estimatedDelivery);
        if (estimated < now) totals.deliveryOverdueCount += 1;
      }
    });

    setStats({
      totalRevenue: totals.totalRevenue,
      totalOrders: totals.totalOrders,
      totalProductsSold: totals.totalProductsSold,
      uniqueCustomers: totals.customers.size,
      byStatus: totals.byStatus,
      lastOrderDate: totals.lastOrderDate,
      pendingCount: totals.pendingCount,
      overdueCount: totals.overdueCount,
      deliveryOverdueCount: totals.deliveryOverdueCount,
    });
  };

  const calculateRevenueByDateRange = (transactions, from, to, setter) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const total = transactions
      .filter((tx) => {
        const date = new Date(tx.createdAt);
        return date >= fromDate && date <= toDate;
      })
      .reduce((sum, tx) => sum + tx.totalAmount, 0);
    setter(total);
  };

  const isOverdue = (createdAt) => {
    const now = new Date();
    const createdDate = new Date(createdAt);
    const diffInDays = (now - createdDate) / (1000 * 60 * 60 * 24);
    return diffInDays >= 7;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FaExclamationCircle className="text-yellow-600 text-lg" />;
      case "packed":
        return <FaBoxOpen className="text-blue-600 text-lg" />;
      case "shipped":
        return <FaShippingFast className="text-green-600 text-lg" />;
      case "completed":
        return <FaCheckCircle className="text-green-600 text-lg" />;
      case "canceled":
        return <FaExclamationCircle className="text-red-600 text-lg" />;
      default:
        return <FaCheckCircle className="text-gray-500 text-lg" />;
    }
  };

  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold text-center mb-6">לוח מחוונים לחנות</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={<FaChartBar />}
          title='סה"כ עסקאות'
          value={stats.totalOrders}
        />
        <StatCard
          icon={<FaMoneyBillWave />}
          title={
            showAllTimeRevenue
              ? 'סה"כ הכנסות (כל הזמנים)'
              : 'סה"כ הכנסות (החודש האחרון)'
          }
          value={
            (showAllTimeRevenue ? stats.totalRevenue : monthlyRevenue)?.toFixed(
              2
            ) + " ₪"
          }
        />{" "}
        <StatCard
          icon={<FaUsers />}
          title="לקוחות ייחודיים"
          value={stats.uniqueCustomers}
        />
        <StatCard
          icon={<FaBox />}
          title='סה"כ מוצרים שנמכרו'
          value={stats.totalProductsSold}
        />
        <StatCard
          icon={<FaClock />}
          title="הזמנה אחרונה"
          value={
            stats.lastOrderDate
              ? new Date(stats.lastOrderDate).toLocaleDateString("he-IL")
              : "-"
          }
        />
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => setShowAllTimeRevenue((prev) => !prev)}
          className="flex items-center gap-2 px-4 py-2 bg-primaryColor text-white rounded shadow hover:bg-opacity-90"
          aria-label="Toggle Revenue Display"
          aria-describedby="revenue-toggle"
          >
          <FaSync />
          {showAllTimeRevenue ? "הצג הכנסות לחודש האחרון" : 'הצג סה"כ הכנסות'}
        </button>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">התראות:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded shadow bg-yellow-100 border border-yellow-400">
            <div className="flex items-center gap-2">
              <FaClock className="text-yellow-600 text-xl" />
              <div>
                <p className="font-semibold">הזמנות ממתינות לאריזה:</p>
                <p className="text-lg font-bold">{stats.pendingCount}</p>
              </div>
            </div>
          </div>

          {stats.overdueCount > 0 && (
            <div className="p-4 rounded shadow bg-red-100 border border-red-400">
              <div className="flex items-center gap-2">
                <FaExclamationTriangle className="text-red-600 text-xl" />
                <div>
                  <p className="font-semibold">הזמנות שממתינות מעל שבוע:</p>
                  <p className="text-lg font-bold text-red-900">
                    {stats.overdueCount}
                  </p>
                </div>
              </div>
            </div>
          )}

          {stats.deliveryOverdueCount > 0 && (
            <div className="p-4 rounded shadow bg-orange-100 border border-orange-400">
              <div className="flex items-center gap-2">
                <FaTruck className="text-orange-600 text-xl" />
                <div>
                  <p className="font-semibold">
                    הזמנות שלא נמסרו אחרי מועד ההגעה:
                  </p>
                  <p className="text-lg font-bold text-orange-700">
                    {stats.deliveryOverdueCount}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-8 flex flex-col lg:flex-row gap-8 items-start">
        {/* טבלת סטטוסים */}
        <div className="w-full lg:w-1/2">
          <h2 className="text-xl font-bold mb-2">סטטוסים של עסקאות:</h2>
          <table className="w-fit text-sm border border-gray-300 bg-white rounded shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-right">סטטוס</th>
                <th className="p-2 text-right">כמות</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats.byStatus || {}).map(([status, count]) => (
                <tr key={status} className="border-t">
                  <td className="p-2 whitespace-nowrap flex items-center gap-2">
                    {getStatusIcon(status)} {status}
                  </td>
                  <td className="p-2 font-bold">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* טווח תאריכים */}
        <div className="w-full lg:w-1/2">
          <h2 className="text-xl font-bold mb-4">הכנסות לפי טווח תאריכים</h2>
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <div>
              <label className="block text-sm">מתאריך:</label>
              <input
                aria-label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-sm">עד תאריך:</label>
              <input
                aria-label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded px-2 py-1"
              />
            </div>
          </div>
          <div className="bg-white border p-4 rounded shadow w-fit">
            סה"כ הכנסות בטווח:{" "}
            <span className="font-bold text-green-800">
              {customRangeRevenue.toFixed(2)} ₪
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value }) => (
  <div className="bg-white rounded shadow p-4 flex items-center gap-4">
    <div className="text-primaryColor text-2xl">{icon}</div>
    <div>
      <div className="text-gray-600 text-sm">{title}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  </div>
);

export default StoreDashboard;
