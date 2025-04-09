import React, { useState } from "react";

const EditableField = ({ title, field, value, userId, onSave }) => {
  const [editing, setEditing] = useState(false); // editing state to manage the editing mode
  const [newValue, setNewValue] = useState(value); // newValue state to store the new value

  // handleSave function to save the changes
  const handleSave = async () => {
    // send a PUT request to the server with the updated field value
    try {
      const response = await fetch(
        `/api/User/${userId}/edit`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ field, value: newValue }),
        }
      );
      // if the response is not ok, throw an error
      if (!response.ok) {
        throw new Error("Failed to update field");
      }

      onSave(field, newValue); // call the onSave function with the updated field and value
      setEditing(false); // exit the editing mode
    } catch (err) {
      console.error(err.message);
      alert("Failed to save changes.");
    }
  };
  // handleCancel function to cancel the editing
  const handleCancel = () => {
    setEditing(false); // exit the editing mode
    setNewValue(value); // reset the new value
  };
  // return the JSX for the EditableField component
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
