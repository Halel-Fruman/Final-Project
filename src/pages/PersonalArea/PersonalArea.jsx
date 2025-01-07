import React, { useEffect, useState } from "react";
import PersonalAreaEditor from "./PersonalFields/PersonalAreaEditor"; // ייבוא הקובץ החדש

const PersonalArea = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:5000/User/${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }
        const data = await response.json();
        setUser(data);
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchUser();
  }, [userId]);

  const handleSave = async (updatedUser) => {
    const response = await fetch(`http://localhost:5000/User/${userId}/edit`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updatedUser }),
    });

    if (!response.ok) {
      throw new Error("Failed to update user");
    }

    const updatedData = await response.json();
    setUser(updatedData);
    setIsEditing(false);
  };

  const handleAddressUpdate = async (updatedAddresses) => {
    const response = await fetch(`http://localhost:5000/User/${userId}/update-addresses`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addresses: updatedAddresses }),
    });

    if (!response.ok) {
      throw new Error("Failed to update addresses");
    }

    return await response.json();
  };

  return user ? (
    isEditing ? (
      <PersonalAreaEditor
      user={user}
      onSave={handleSave}
      onCancel={() => setIsEditing(false)}
      onAddressUpdate={handleAddressUpdate}
      />
    ) : (
      <div className="container mt-5">
      <h1>Welcome, {user.first_name}</h1>
      <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
      Edit Personal Area
      </button>
      </div>
    )
  ) : (
    <p>Loading...</p>
  );
};

export default PersonalArea;
