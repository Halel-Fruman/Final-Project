import React, { useState } from 'react';
import axios from 'axios';

const AddStorePage = () => {
  // סטייט לאחסון פרטי החנות
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [managerName, setManagerName] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [managers, setManagers] = useState([]);
  
  // פונקציה להוספת מנהל
  const handleAddManager = () => {
    setManagers([...managers, { name: managerName, email: managerEmail }]);
    setManagerName('');
    setManagerEmail('');
  };

  // פונקציה לשליחה של הטופס להוספת החנות
  const handleAddStore = () => {
    const storeData = {
      name: storeName,
      address: storeAddress,
      managers: managers
    };

    // שליחת בקשה POST לשרת להוספת החנות
    axios.post('/api/stores', storeData)
      .then((res) => {
        // טיפול בתגובה מוצלחת
        console.log('החנות נוספה:', res.data);
        // אפשרות לאפס את הטופס
        setStoreName('');
        setStoreAddress('');
        setManagers([]);
      })
      .catch((err) => console.log(err)); // רישום שגיאות
  };

  return (
    <div>
      <h1>הוספת חנות חדשה</h1>
      <form onSubmit={(e) => { e.preventDefault(); handleAddStore(); }}>
        <div>
          <label>שם החנות:</label>
          <input 
            type="text" 
            value={storeName} 
            onChange={(e) => setStoreName(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>כתובת החנות:</label>
          <input 
            type="text" 
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
            value={managerName} 
            onChange={(e) => setManagerName(e.target.value)} 
          />
        </div>
        <div>
          <label>דוא"ל המנהל:</label>
          <input 
            type="email" 
            value={managerEmail} 
            onChange={(e) => setManagerEmail(e.target.value)} 
          />
        </div>
        <button type="button" onClick={handleAddManager}>הוסף מנהל</button>
        
        <h4>המנהלים שהוספת:</h4>
        <ul>
          {managers.map((manager, index) => (
            <li key={index}>{manager.name} - {manager.email}</li>
          ))}
        </ul>
        
        <button type="submit">הוסף חנות</button>
      </form>
    </div>
  );
};

export default AddStorePage;
