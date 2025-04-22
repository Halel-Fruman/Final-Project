// קובץ: UserManagement.jsx - גרסה משודרגת מלאה
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAlert } from "../../components/AlertDialog.jsx";
import { Icon } from "@iconify/react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortKey, setSortKey] = useState("firstName");
  const [sortAsc, setSortAsc] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const { showAlert } = useAlert();

  const currentUserId = localStorage.getItem("userId"); // נניח שזה מגיע מה-auth

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) return showAlert("אין הרשאה. התחבר מחדש.", "error");

    axios
      .get("/api/User/", {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
      .then((res) => {
        const formattedUsers = res.data.map((user) => ({
          _id: user._id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          phone: user.phoneNumber,
          address: user.addresses?.[0]
            ? `${user.addresses[0].streetAddress}, ${user.addresses[0].city}`
            : "לא צוינה כתובת",
          role: user.role,
        }));
        setUsers(formattedUsers);
      })
      .catch(() => {
        showAlert("אירעה שגיאה בעת קבלת פרטי המשתמשים", "error");
      });
  }, []);

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsAdding(false);
  };

  const handleAddUser = () => {
    setSelectedUser({ firstName: "", lastName: "", email: "", phone: "", address: "", role: "user" });
    setIsAdding(true);
  };

  const handleDeleteUser = (userId) => {
    showAlert("האם אתה בטוח שברצונך למחוק את המשתמש?", "warning", () => {
      const token = localStorage.getItem("token");
      axios.delete(`/api/User/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(() => {
          setUsers(users.filter(u => u._id !== userId));
          showAlert("המשתמש נמחק.", "success");
        })
        .catch(() => showAlert("שגיאה במחיקה", "error"));
    });
  };

  const handleFieldChange = (field, value) => {
    setSelectedUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!selectedUser.firstName || !selectedUser.lastName || !selectedUser.email) {
      return showAlert("יש למלא את כל השדות", "error");
    }

    if (selectedUser._id === currentUserId && selectedUser.role !== "admin") {
      return showAlert("לא ניתן לשנות את הרשאותיך שלך", "error");
    }

    const userData = {
      first_name: selectedUser.firstName,
      last_name: selectedUser.lastName,
      email: selectedUser.email,
      phoneNumber: selectedUser.phone,
      addresses: [{
        streetAddress: selectedUser.address?.split(",")[0]?.trim() || "",
        city: selectedUser.address?.split(",")[1]?.trim() || "",
      }],
      role: selectedUser.role,
    };

    const token = localStorage.getItem("token");
    const method = isAdding ? "post" : "put";
    const url = isAdding ? "/api/User/" : `/api/User/${selectedUser._id}/edit`;

    axios[method](url, userData, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const user = {
          _id: res.data._id,
          firstName: res.data.first_name,
          lastName: res.data.last_name,
          email: res.data.email,
          phone: res.data.phoneNumber,
          address: res.data.addresses?.[0]
            ? `${res.data.addresses[0].streetAddress}, ${res.data.addresses[0].city}`
            : "לא צוינה כתובת",
          role: res.data.role,
        };
        setUsers(isAdding ? [...users, user] : users.map(u => u._id === user._id ? user : u));
        setSelectedUser(null);
        showAlert(isAdding ? "משתמש נוסף!" : "משתמש עודכן", "success");
      })
      .catch(() => showAlert("שגיאה בשמירה", "error"));
  };

  const handleExport = () => {
    const data = users.map(({ firstName, lastName, email, phone, address, role }) => ({ firstName, lastName, email, phone, address, role }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "users.xlsx");
  };

  const sortedUsers = [...users]
    .filter(user =>
      `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (roleFilter ? user.role?.toLowerCase() === roleFilter.toLowerCase() : true)
    )
    .sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return sortAsc ? -1 : 1;
      if (a[sortKey] > b[sortKey]) return sortAsc ? 1 : -1;
      return 0;
    });

  const toggleSort = (key) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">ניהול משתמשים ({users.length})</h1>
        <div className="flex gap-2">
          <input
            type="text"
            className="border px-3 py-1 rounded"
            placeholder="חיפוש..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">כל התפקידים</option>
            <option value="user">User</option>
            <option value="storeManager">Store Manager</option>
            <option value="admin">Admin</option>
          </select>
          <button
  onClick={() => setRoleFilter("")}
  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-sm rounded shadow"
>
  איפוס סינון
</button>
          <button onClick={handleAddUser} title="הוסף משתמש" className="text-blue-600 hover:text-blue-800">
            <Icon icon="mdi:account-plus" width="32" height="32" />
          </button>
          <button onClick={handleExport} title="ייצוא לאקסל" className="text-green-600 hover:text-green-800">
            <Icon icon="mdi:export" width="32" height="32" />
          </button>
        </div>
      </div>

      <table className="table-auto w-full border border-gray-300 text-right">
      <thead>
          <tr className="bg-primaryColor text-white">
            <th className="border px-3 py-3 cursor-pointer" onClick={() => toggleSort("firstName")}>שם פרטי</th>
            <th className="border px-3 py-3 cursor-pointer" onClick={() => toggleSort("lastName")}>שם משפחה</th>
            <th className="border  px-3 py-3 cursor-pointer" onClick={() => toggleSort("email")}>אימייל</th>
            <th className="border  px-3 py-3 cursor-pointer" onClick={() => toggleSort("phone")}>טלפון</th>
            <th className="border  px-3 py-3 cursor-pointer" onClick={() => toggleSort("address")}>כתובת</th>
            <th className="border  px-3 py-3 cursor-pointer" onClick={() => toggleSort("role")}>תפקיד</th>
            <th className="border  px-3 py-3">פעולות</th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map((user) => (
            <tr key={user._id}>
              <td className="border px-2 py-1">{user.firstName}</td>
              <td className="border px-2 py-1">{user.lastName}</td>
              <td className="border px-2 py-1">{user.email}</td>
              <td className="border px-2 py-1">{user.phone}</td>
              <td className="border px-2 py-1">{user.address}</td>
              <td className="border px-2 py-1">
                <span className={`px-2 py-1 text-white rounded-full text-sm ${user.role === "admin" ? "bg-red-600" : user.role === "storeManager" ? "bg-blue-600" : "bg-gray-600"}`}>{user.role === "admin" ? "מנהל" : user.role === "storeManager" ? "מנהל חנות" : "משתמש"}</span>
              </td>
              <td className="border px-2 py-1 space-x-2 flex justify-center">
                <button title="ערוך" onClick={() => handleEditUser(user)}>
                  <Icon icon="tabler:edit" width="30" />
                </button>
                <button title="מחק" onClick={() => handleDeleteUser(user._id)}>
                  <Icon icon="tabler:trash" className="text-red-600" width="30" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedUser && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg w-full max-w-md">
      <h2 className="text-xl font-bold mb-4 text-center">
        {isAdding ? "הוסף משתמש" : "ערוך משתמש"}
      </h2>

      <div className="mb-3">
        <label className="block mb-1 text-sm font-medium">שם פרטי / First Name </label>
        <input
          type="text"
          className="w-full border px-3 py-2 rounded"
          value={selectedUser.firstName || ""}
          onChange={(e) => handleFieldChange("firstName", e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="block mb-1 text-sm font-medium">שם משפחה / Last Name</label>
        <input
          type="text"
          className="w-full border px-3 py-2 rounded"
          value={selectedUser.lastName || ""}
          onChange={(e) => handleFieldChange("lastName", e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="block mb-1 text-sm font-medium">דוא"ל / Email</label>
        <input
          type="email"
          className="w-full border px-3 py-2 rounded"
          value={selectedUser.email || ""}
          onChange={(e) => handleFieldChange("email", e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="block mb-1 text-sm font-medium">טלפון / Phone Number</label>
        <input
          type="text"
          className="w-full border px-3 py-2 rounded"
          value={selectedUser.phone || ""}
          onChange={(e) => handleFieldChange("phone", e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="block mb-1 text-sm font-medium">כתובת / Address</label>
        <input
          type="text"
          className="w-full border px-3 py-2 rounded"
          value={selectedUser.address || ""}
          onChange={(e) => handleFieldChange("address", e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="block mb-1 text-sm font-medium">תפקיד / Role</label>
        <select
          className="w-full border px-3 py-2 rounded"
          value={selectedUser.role}
          onChange={(e) => handleFieldChange("role", e.target.value)}
        >
          <option value="user">משתמש / User</option>
          <option value="storeManager">מנהל חנות / Store Manager</option>
          <option value="admin">מנהל / Admin</option>
        </select>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => setSelectedUser(null)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ביטול
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-primaryColor text-white rounded hover:bg-opacity-90"
        >
          שמור
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default UserManagement;
