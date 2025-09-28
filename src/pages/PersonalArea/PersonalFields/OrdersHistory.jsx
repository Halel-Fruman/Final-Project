/**
 * @file OrderHistory.jsx
 * @description This component displays the user's order history, grouped by transaction ID.
 * It fetches transaction data and product details, allowing users to view their past orders and re-purchase items.
 */
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { fetchWithTokenRefresh } from "../../../utils/authHelpers";
import {
  FaExclamationCircle,
  FaBoxOpen,
  FaShippingFast,
  FaCheckCircle,
} from "react-icons/fa";

/**
 * @function OrderHistory
 * @description Component for displaying the user's order history.
 * @param {Object} props - Component properties.
 * @param {Object} props.user - The user object containing user information.
 * @param {function} props.addToCart - Function to add a product to the cart.
 * @return {JSX.Element} The rendered component.
 */

const OrderHistory = ({ user, addToCart }) => {
  const { t, i18n } = useTranslation();
  const [transactionGroups, setTransactionGroups] = useState([]);
  const [productDetails, setProductDetails] = useState({});
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  // Fetches grouped transactions based on the user's transaction IDs
  // It retrieves each transaction's details and groups them by transaction ID.
  useEffect(() => {
    const fetchGroupedTransactions = async () => {
      setIsLoadingTransactions(true);
      try {
        // Initialize an empty object to hold grouped transactions
        // Each key will be a transaction ID, and the value will be an array of transactions
        const groups = {};
        for (const txId of user.transactions) {
          const res = await fetchWithTokenRefresh(
            `/api/Transactions/by-transactionId/${txId}`
          );
          // If the response is OK, parse the JSON and add it to the groups object
          // If there are transactions for this ID, they will be stored in the groups object
          if (res.ok) {
            const txs = await res.json();
            if (txs?.length) {
              groups[txId] = txs;
            }
          }
        }
        // Set the grouped transactions to state
        // This will trigger a re-render of the component with the new data
        setTransactionGroups(groups);
      } catch (err) {
        console.error("Failed to fetch grouped transactions:", err);
      } finally {
        // Regardless of success or failure, we set the loading state to false
        // This ensures that the loading spinner is removed once the fetch operation is complete
        setIsLoadingTransactions(false);
      }
    };
    // If the user has transactions, fetch the grouped transactions
    // This will only run if the user.transactions array is not empty
    if (user.transactions?.length) {
      fetchGroupedTransactions();
    }
  }, [user.transactions]);

  // Fetches product details for each product in the grouped transactions
  // It creates a map of product IDs to their details, which is then used to display
  useEffect(() => {
    const fetchProductDetails = async () => {
      const allProducts = {};
      Object.values(transactionGroups)
        .flat()
        .forEach((tx) => {
          tx.products.forEach((p) => (allProducts[p.productId] = true));
        });

      const detailsMap = {};
      for (const id of Object.keys(allProducts)) {
        try {
          const res = await fetchWithTokenRefresh(`/api/Products/${id}`);
          const data = await res.json();
          detailsMap[id] = data;
        } catch {
          detailsMap[id] = null;
        }
      }
      setProductDetails(detailsMap);
    };
    // If there are transaction groups, fetch the product details for each product
    // This will only run if the transactionGroups object is not empty
    if (Object.keys(transactionGroups).length) {
      fetchProductDetails();
    }
  }, [transactionGroups]);
  const badgeColor = (s) => {
    switch (s) {
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
    <div className="lg:w-10/12 mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-5xl font-bold text-gray-900 mb-4 text-center">
        {t("orders.title")}
      </h1>
      <h2 className="text-lg text-gray-600 mb-12 text-center">
        {t("orders.subtitle")}
      </h2>

      {Object.entries(transactionGroups)
        .sort(([, aOrders], [, bOrders]) => {
          const aDate = new Date(aOrders[0]?.createdAt || 0);
          const bDate = new Date(bOrders[0]?.createdAt || 0);
          return bDate - aDate;
        })
        .map(([transactionId, orders], idx) => (
          <div
            key={idx}
            className="mb-12 bg-blue-50 border rounded-md shadow-md">
            <div className="bg-primaryColor bg-opacity-10 text-primaryColor rounded-md px-6 py-3 font-bold text-xl border-b">
              {t("orders.orderGroup")}:{" "}
              <span className="font-mono">{transactionId}</span>
            </div>
            {/* Display each order within the transaction group */}
            {orders.map((order, i) => (
              <div key={i} className="bg-white border-b">
                <div className="flex flex-col md:flex-row justify-between items-center bg-gray-100 px-6 py-3 text-lg text-gray-900 border-b">
                  <span>
                    {t("orders.store")}:{" "}
                    <strong>{order.storeName[i18n.language]}</strong>
                  </span>
                  <span>
                    {t("orders.date")}:{" "}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                  <span>
                    {t("orders.orderId")}:{" "}
                    <strong className="font-mono">{order.orderId}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    {badgeColor(order.status)}
                    <span className="text-sm font-bold">{t(`status.${order.status}`)}</span>
                  </span>
                </div>

                <div className="divide-y px-6">
                  {order.products.map((item, j) => {
                    const fullProduct = productDetails[item.productId];
                    const image =
                      fullProduct?.images?.[0] || "https://placehold.co/100";
                    const highlights =
                      fullProduct?.highlight?.[i18n.language] || [];
                    const name =
                      fullProduct?.name?.[i18n.language] || item.name;

                    return (
                      <div
                        key={j}
                        className="flex flex-col md:flex-row items-start gap-6 py-6">
                        <img
                          src={image}
                          alt={name}
                          className="w-28 h-28 object-cover rounded-md border"
                        />
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {name}
                          </h3>
                          <div className="flex flex-wrap gap-2 text-sm text-gray-700 mb-2">
                            {highlights.map((h, idx) => (
                              <span
                                key={idx}
                                className="bg-gray-100 px-3 py-1 rounded-full">
                                {h}
                              </span>
                            ))}
                          </div>
                          <p className="text-sm text-gray-700 mb-1">
                            {t("orders.quantity")}: {item.quantity}
                          </p>
                          <p className="text-lg font-medium text-gray-900">
                            ₪{item.price}
                          </p>
                        </div>
                        <div className="flex flex-col mt-6 gap-2 justify-start">
                          <button
                            onClick={() => {
                              addToCart({
                                productId: item.productId,
                                quantity: 1,
                              });
                              toast.success(t("wishlist.addToCart") + " ✅");
                            }}
                            className="bg-primaryColor text-white text-xl font-bold px-4 py-2 rounded-full hover:bg-secondaryColor">
                            {t("orders.buyAgain")}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-primaryColor font-bold text-xl pl-6 pt-2 pb-4">
                  {t("orders.subtotal")}: ₪{order.totalAmount?.toFixed(2)}
                </div>
              </div>
            ))}

            <div className=" text-xl font-bold text-primaryColor px-6 py-4 border-t rounded-md bg-secondaryColor bg-opacity-10">
              {t("orders.totalForTransaction")}: ₪
              {orders
                .reduce((sum, order) => sum + (order.totalAmount || 0), 0)
                .toFixed(2)}
            </div>
          </div>
        ))}

      {isLoadingTransactions ? (
        <div className="text-center py-10">
          <div className="inline-block w-10 h-10 border-4 border-blue-300 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-600">{t("orders.loading")}</p>
        </div>
      ) : (
        !Object.keys(transactionGroups).length && (
          <p className="text-gray-600 text-center text-lg">
            {t("orders.noOrders")}
          </p>
        )
      )}
    </div>
  );
};

export default OrderHistory;
