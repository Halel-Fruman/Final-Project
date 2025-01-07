import React, { useState } from "react";

const EditableField = ({ title, field, value, userId, onSave }) => {
  const [editing, setEditing] = useState(false); // מצב העריכה
  const [newValue, setNewValue] = useState(value); // ערך חדש לשדה

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:5000/User/${userId}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, value: newValue }),
      });

      if (!response.ok) {
        throw new Error("Failed to update field");
      }

      onSave(field, newValue); // עדכון השדה ברמת המשתמש
      setEditing(false); // סיום מצב העריכה
    } catch (err) {
      console.error(err.message);
      alert("Failed to save changes.");
    }
  };

  const handleCancel = () => {
    setEditing(false); // יציאה ממצב עריכה
    setNewValue(value); // איפוס הערך החדש לערך הנוכחי
  };

  return (
    <div className="mb-3">
      <h5>{title}</h5>
      {editing ? (
        <>
          <input
            type="text"
            className="form-control mb-2"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
          <button className="btn btn-success me-2" onClick={handleSave}>
            Save
          </button>
          <button className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
        </>
      ) : (
        <>
          <p>{value}</p>
          <button className="btn btn-link" onClick={() => setEditing(true)}>
            Edit
          </button>
        </>
      )}
    </div>
  );
};

export default EditableField;
