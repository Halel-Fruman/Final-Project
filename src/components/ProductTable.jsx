// File: src/components/ProductTable.jsx
import { Icon } from "@iconify/react";

const ProductTable = ({ products, onEdit, onDelete }) => {
  return (
    <div className="hidden md:block">
      <table className="w-full table-fixed text-sm text-right">
        <thead className="bg-gray-100 font-bold block w-full">
          <tr className="table w-full">
            <th className="p-2 border w-[8%]">תמונה</th>
            <th className="p-2 border w-[18%]">שם</th>
            <th className="p-2 border w-[10%]">מחיר</th>
            <th className="p-2 border w-[10%]">עלות ייצור</th>
            <th className="p-2 border w-[10%]">רווח</th>
            <th className="p-2 border w-[10%]">מלאי</th>
            <th className="p-2 border w-[10%]">משלוח לחו"ל</th>
            <th className="p-2 border w-[10%]">מבצע</th>
            <th className="p-2 border w-[14%]">פעולות</th>
          </tr>
        </thead>
        <tbody className="block max-h-[400px] overflow-y-auto w-full">
          {(products || []).map((product) => {
            const firstImage = product.images?.[0];
            const discount = product.discounts?.find((d) => {
              const now = new Date();
              return new Date(d.startDate) <= now && now <= new Date(d.endDate);
            });
            const profit = product.price - (product.manufacturingCost || 0);

            return (
              <tr
                key={product._id}
                className="table w-full border-t hover:bg-gray-50">
                <td className="p-2 border w-[8%]">
                  {firstImage ? (
                    <img
                      src={firstImage}
                      alt="product"
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <span className="text-gray-400">ללא תמונה</span>
                  )}
                </td>
                <td className="p-2 border w-[18%]">
                  {product.name.he} / {product.name.en}
                </td>
                <td className="p-2 border w-[10%]">{product.price}₪</td>
                <td className="p-2 border w-[10%]">
                  {product.manufacturingCost ? (
                    <span className="text-red-900">
                      {product.manufacturingCost}₪
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="p-2 border w-[10%]">
                  <span
                    className={profit > 0 ? "text-green-900" : "text-red-600"}>
                    {profit}₪
                  </span>
                </td>
                <td className="p-2 border w-[10%]">{product.stock}</td>
                <td className="p-2 border w-[10%]">
                  {product.internationalShipping ? (
                    <span className="text-purple-600 text-lg">✔</span>
                  ) : (
                    <span className="text-pink-600 text-lg">✖</span>
                  )}
                </td>
                <td className="p-2 border w-[10%] text-sm">
                  {discount ? (
                    <div className="flex flex-col">
                      <span
                        className={
                          new Date(discount.endDate) < new Date()
                            ? "text-red-500"
                            : "text-green-900"
                        }>
                        {discount.percentage}%
                      </span>
                      <span className="text-gray-800 text-xs">
                        עד{" "}
                        {new Date(discount.endDate).toLocaleDateString("he-IL")}
                      </span>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="p-2 border w-[14%]">
                  <div className="flex justify-center gap-3">
                    <button title="ערוך" onClick={() => onEdit(product)}>
                      <Icon
                        icon="material-symbols:edit"
                        className="text-blue-600 text-xl"
                      />
                    </button>
                    <button title="מחק" onClick={() => onDelete(product._id)}>
                      <Icon
                        icon="material-symbols:delete-outline"
                        className="text-red-600 text-xl"
                      />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
