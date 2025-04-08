import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAlert } from '../../components/AlertDialog.jsx';
import { Icon } from '@iconify/react';

// The UserManagement component is a functional component that takes the token as a prop
const UserManagement = (token) => {
  const [users, setUsers] = useState([]); // The users state is used to store the list of users
  const [selectedUser, setSelectedUser] = useState(null); // The selectedUser state is used to store the selected user
  const { showAlert } = useAlert(); // The useAlert hook is used to show an alert dialog

  // The useEffect hook is used to fetch the list of users when the component mounts
  useEffect(() => {
    const storedToken = localStorage.getItem("token"); // Get the token from localStorage
    if (!storedToken) { // If there is no token, show an alert
      showAlert("אין הרשאה. התחבר מחדש.", "error"); // Show an alert dialog
      return;
    }
    // Send a GET request to the server to fetch the list of users
    axios
      .get("/api/User/", {
        headers: { Authorization: `Bearer ${storedToken}` }
      })
      .then((res) => {
        const formattedUsers = res.data.map(user => ({
          _id: user._id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          phone: user.phoneNumber,
          address: user.addresses?.[0] || "לא צוינה כתובת",
          role: user.role
        }));
        setUsers(formattedUsers);
      })
      .catch((err) => {
        console.log(err);
        showAlert("אירעה שגיאה בעת קבלת פרטי המשתמשים", "error");
      });
  }, []);

  // The handleEditUser function takes a userId as an argument and sets the selected user
  const handleEditUser = (userId) => {
    const userToEdit = users.find(user => user._id === userId);
    setSelectedUser(userToEdit);
  };

  // The handleFieldChange function takes a field and value as arguments and updates the selected user
  const handleFieldChange = (field, value) => {
    setSelectedUser((prev) => ({ ...prev, [field]: value }));
  };
  // The handleSave function is an async function that handles the save operation
  const handleSave = () => {
    if (!selectedUser.firstName || !selectedUser.lastName || !selectedUser.email) {
      showAlert("יש להזין את כל השדות.", "error");
      return;
    }

    const updatedUser = {
      first_name: selectedUser.firstName,
      last_name: selectedUser.lastName,
      email: selectedUser.email,
      phoneNumber: selectedUser.phone,
      addresses: [selectedUser.address],
      role: selectedUser.role
    };

    const storedToken2 = localStorage.getItem("token"); // Get the token from localStorage
    // If there is no token, show an alert
    if (!storedToken2) {
      showAlert("אין הרשאה. התחבר מחדש.", "error");
      return;
    }
    // Send a PUT request to the server to update the user
    axios.put(`/api/User/${selectedUser._id}/edit`, updatedUser, {
      headers: { Authorization: `Bearer ${storedToken2}` }
    })
      .then((res) => {
        setUsers(users.map(user => (user._id === selectedUser._id ? {
          ...user,
          firstName: res.data.first_name,
          lastName: res.data.last_name,
          email: res.data.email,
          phone: res.data.phoneNumber,
          address: res.data.addresses?.[0] || "לא צוינה כתובת",
          role: res.data.role
        } : user)));

        showAlert("המשתמש עודכן בהצלחה!", "success");
        setSelectedUser(null);
      })
      .catch((err) => {
        console.log(err);
        showAlert("אירעה שגיאה בעת עדכון פרטי המשתמש", "error");
      });
  };
  // The handleCancelEdit function resets the selected user
  const handleCancelEdit = () => {
    setSelectedUser(null);
  };

  return (
    <div className="container mx-auto p-5">
      <h1 className="text-center mb-8 text-2xl font-bold">ניהול משתמשים</h1>

      <table className="table-auto w-full border border-gray-300">
        <thead>
          <tr className="bg-primaryColor text-white">
            <th className="border px-4 py-2">שם פרטי</th>
            <th className="border px-4 py-2">שם משפחה</th>
            <th className="border px-4 py-2">כתובת מייל</th>
            <th className="border px-4 py-2">טלפון</th>
            <th className="border px-4 py-2">כתובת</th>
            <th className="border px-4 py-2">תפקיד</th>
            <th className="border px-4 py-2">פעולות</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td className="border px-4 py-2">{user.firstName}</td>
              <td className="border px-4 py-2">{user.lastName}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">{user.phone}</td>
              <td className="border px-4 py-2">{user.address}</td>
              <td className="border px-4 py-2">{user.role}</td>
              <td className="border px-4 py-2">
                <button
                  className="bg-white text-primaryColor px-2 py-2 border-primaryColor rounded hover:bg-primaryColor hover:text-white"
                  onClick={() => handleEditUser(user._id)}
                >
                  <Icon icon="tabler:edit" width="24" height="24" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedUser && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-10">
          <div className="bg-white p-6 rounded shadow-lg w-1/3 max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">ערוך את פרטי המשתמש</h2>

            {["firstName", "lastName", "email", "phone", "address"].map((field) => (
              <div key={field} className="mb-4">
                <label className="block mb-1">{field}</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2"
                  value={selectedUser[field] || ""}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                />
              </div>
            ))}

            {/* Dropdown for role selection */}
            <div className="mb-4">
              <label className="block mb-1">תפקיד</label>
              <select
                className="w-full border px-3 py-2"
                value={selectedUser.role || ""}
                onChange={(e) => handleFieldChange("role", e.target.value)}
              >
                <option value="user">User</option>
                <option value="storeManager">Store Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>


            <div className="flex justify-end items-center mt-6">
              <button
                className="bg-white text-gray-600 px-2 py-2 border-primaryColor rounded mr-2 hover:bg-gray-600 hover:text-gray-300"
                onClick={handleCancelEdit}
              >
                <Icon icon="material-symbols:cancel-outline-rounded" width="36" height="36" />
              </button>
              <button
                className="bg-white text-primaryColor px-2 py-2 border-primaryColor rounded hover:bg-primaryColor hover:text-gray-300"
                onClick={handleSave}
              >
                <Icon icon="material-symbols:check-circle-outline-rounded" width="36" height="36" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
