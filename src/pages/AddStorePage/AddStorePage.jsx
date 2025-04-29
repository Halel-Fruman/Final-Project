import React, { useState } from "react";
import axios from "axios";

const AddStorePage = () => {
  const [storeNameHe, setStoreNameHe] = useState("");
  const [storeNameEn, setStoreNameEn] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [managerName, setManagerName] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [managers, setManagers] = useState([]);

  const handleAddManager = () => {
    if (managerName && managerEmail) {
      setManagers([
        ...managers,
        { name: managerName, emailAddress: managerEmail },
      ]);
      setManagerName("");
      setManagerEmail("");
    }
  };

  const handleAddStore = () => {
    const storeData = {
      name: {
        he: storeNameHe,
        en: storeNameEn,
      },
      address: storeAddress,
      email: managers[0]?.emailAddress || "", // אפשר להוסיף שדה מייל לחנות לפי מנהל ראשון (אם רלוונטי)
      manager: managers,
    };

    axios
      .post("/api/stores", storeData)
      .then((res) => {
        console.log("החנות נוספה:", res.data);
        setStoreNameHe("");
        setStoreNameEn("");
        setStoreAddress("");
        setManagers([]);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div>
      <h1>הוספת חנות חדשה</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAddStore();
        }}>
        <div>
          <label>שם החנות בעברית:</label>
          <input
            type="text"
            aria-label="Store Name in Hebrew"
            value={storeNameHe}
            onChange={(e) => setStoreNameHe(e.target.value)}
            required
          />
        </div>
        <div>
          <label>שם החנות באנגלית:</label>
          <input
            type="text"
            aria-label="Store Name in English"
            value={storeNameEn}
            onChange={(e) => setStoreNameEn(e.target.value)}
            required
          />
        </div>
        <div>
          <label>כתובת החנות:</label>
          <input
            type="text"
            aria-label="Store Address"
            value={storeAddress}
            onChange={(e) => setStoreAddress(e.target.value)}
            required
          />
        </div>

        <h3>פרטי המנהל</h3>
        <div>
          <label>שם המנהל:</label>
          <input
            type="text"
            aria-label="Manager Name"
            value={managerName}
            onChange={(e) => setManagerName(e.target.value)}
          />
        </div>
        <div>
          <label>דוא"ל המנהל:</label>
          <input
            type="email"
            aria-label="Manager Email"
            value={managerEmail}
            onChange={(e) => setManagerEmail(e.target.value)}
          />
        </div>
        <button type="button" onClick={handleAddManager}>
          הוסף מנהל
        </button>

        <h4>המנהלים שהוספת:</h4>
        <ul>
          {managers.map((manager, index) => (
            <li key={index}>
              {manager.name} - {manager.emailAddress}
            </li>
          ))}
        </ul>

        <button type="submit">הוסף חנות</button>
      </form>
    </div>
  );
};

export default AddStorePage;
