import React, { useState, useEffect } from 'react'; // Importing necessary React hooks
import { useTranslation } from 'react-i18next'; // Importing the translation hook for multi-language support
import axios from 'axios'; // Importing axios for making HTTP requests
import './SysAdmin.css'; // Importing the CSS for the SysAdmin page

const SysAdmin = () => {
  const { t } = useTranslation(); // Initializing translation function

  // State hooks for storing stores and new store name
  const [stores, setStores] = useState([]); // To store the list of stores

  const [editedStores, setEditedStores] = useState({});
  const [managers, setManagers] = useState([]);
  const [editedManagers, setEditedManagers] = useState({});
  const [managerName, setManagerName] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [isEditingManagers, setIsEditingManagers] = useState(false); // מצב אם המנהלים בעריכה


  // Modified new store state to include manager fields
  const [newStore, setNewStore] = useState({
    name: '',
    address: '',
    managers: [{ name: '', emailAdrress: '' }]  // Initialize with one empty manager
  });

  // Fetching stores from the database using axios when the component is mounted
  useEffect(() => {
    axios.get('http://localhost:5000/Stores/') // שליחה לבקשה לשלוף את החנויות
      .then((res) => {
        console.log("Stores fetched:", res.data); // הדפס את הנתונים שהתקבלו
        setStores(res.data); // עדכון הסטייט של החנויות
        const managers = {};
        res.data.forEach(store => {
          managers[store._id] = store.manager || [];
        });
        setEditedManagers(managers);  // עדכון הסטייט של המנהלים


      })
      .catch((err) => console.log(err)); // טיפול בשגיאות
  }, []); // Empty dependency array means it runs once when the component mounts




  const handleFieldChange = (storeId, field, value) => {
    setEditedStores({
      ...editedStores,
      [storeId]: { ...editedStores[storeId], [field]: value }
    });
  };


  const handleSaveField = (storeId) => {
    if (editedStores[storeId]) {
      axios.put(`http://localhost:5000/Stores/${storeId}`, editedStores[storeId])
        .then((res) => {
          setStores(stores.map((store) => store._id === storeId ? res.data : store));
          setEditedStores((prev) => {
            const updated = { ...prev };
            delete updated[storeId];
            return updated;
          });
        })
        .catch((err) => console.log(err));
    }
  };


  ////////////// managers area/////////////
  const handleAddManagerField = (storeId) => {


    setEditedManagers({
      ...editedManagers,
      [storeId]: [
        ...(editedManagers[storeId] || []),
        { name: managerName, emailAdrress: managerEmail },
      ],
    });
    // הפוך את המנהל לערוך מיד לאחר ההוספה
    setIsEditingManagers({
      ...isEditingManagers,
      [storeId]: true, // קבע שסטור זה במצב עריכה
    });
    setManagerName('');
    setManagerEmail('');
  };

  const handleEditManagers = (storeId) => {
    setIsEditingManagers({
      ...isEditingManagers,
      [storeId]: true, // הופכים את המנהלים לעריכה
    });
  };


  const handleManagerFieldChange = (storeId, index, field, value) => {
    if (field === 'emailAdrress' && !validateEmail(value)) {
      alert(t('sysadmin.invalid_email')); // הודעה אם המייל לא תקני
      return; // לא לעדכן את השדה אם המייל לא תקני
    }

    const updatedManagers = [...(editedManagers[storeId] || [])];
    updatedManagers[index][field] = value;
    setEditedManagers({ ...editedManagers, [storeId]: updatedManagers });
  };

  const handleDeleteManager = (storeId, index) => {
    const updatedManagers = [...(editedManagers[storeId] || [])];
    updatedManagers.splice(index, 1);
    setEditedManagers({ ...editedManagers, [storeId]: updatedManagers });
  };

  const handleSaveManagers = (storeId) => {
    const invalidEmail = editedManagers[storeId]?.some(
      (mgr) => !validateEmail(mgr.emailAdrress)
    );

    if (invalidEmail) {
      alert(t('sysadmin.invalid_email')); // הודעה אם יש מייל לא תקני
      return; // לא לשמור אם יש מייל לא תקני
    }

    // עדכון בבסיס הנתונים
    axios
      .put(`http://localhost:5000/Stores/${storeId}`, {
        manager: editedManagers[storeId],
      })
      .then((res) => {
        setStores(stores.map((store) => (store._id === storeId ? res.data : store)));
        setIsEditingManagers((prev) => {
          const updated = { ...prev };
          delete updated[storeId];
          return updated;
        });
        setEditedManagers((prev) => {
          const updated = { ...prev };
          delete updated[storeId];
          return updated;
        });
      })
      .catch((err) => console.log(err));

    setIsEditingManagers({
      ...isEditingManagers,
      [storeId]: false, // קבע שסטור זה במצב עריכה
    });
    <window className="location reloed"></window>
  };


  const validateEmail = (email) => {
    // Regular expression for validating email format
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  
  };

  //////////////////////////


  // בהוספת חנות חדשה
  const handleAddStore = () => {
    axios.post('http://localhost:5000/Stores/', {
      name: newStore.name,
      address: newStore.address,
      manager: newStore.managers,  // הוספת המנהלים מה-state החדש
    })
      .then((res) => {
        setStores([...stores, res.data]);
        setNewStore({ name: '', address: '', managers: [{ name: '', emailAdrress: '' }] });  // לאפס את הסטייט
      })
      .catch((err) => console.log(err));
  };
  ;





  // Function to handle deleting a store
  const handleDeleteStore = (storeId) => {
    axios.delete(`http://localhost:5000/Stores/${storeId}`) // HTTP DELETE request to delete the store
      .then(() => {
        setStores(stores.filter((store) => store._id !== storeId)); // Remove the deleted store from state
      })
      .catch((err) => console.log(err)); // Log any errors
  };

  return (

    <div className="sysadmin-page container">
      <header className="bg-custom text-white text-center py-5 mb-4 rounded">
        <h1>{t('sysadmin.admin_management')}</h1>
      </header>

      <section className="my-5">
        <h2 className="text-center mb-4">{t('sysadmin.stores')}</h2>
        <div className="text-center mb-4">
          <div className="input-group mb-3 w-50 mx-auto">
            <input
              type="text"
              className="form-control"
              value={newStore.name}  // השתמש ב-name של newStore
              onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}  // עדכון השם של החנות
              placeholder={t('sysadmin.store_name')}
            />
            <input
              type="text"
              className="form-control"
              value={newStore.address}  // השתמש ב-address של newStore
              onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}  // עדכון הכתובת של החנות
              placeholder={t('sysadmin.store_address')}
            />
            {/* שדה שם המנהל */}
            <input
              type="text"
              className="form-control"
              value={newStore.managers[0].name}  // השתמש ב-name של המנהל הראשון במערך managers
              onChange={(e) => setNewStore({
                ...newStore,
                managers: [{ ...newStore.managers[0], name: e.target.value }]
              })}  // עדכון שם המנהל
              placeholder={t('sysadmin.manager_name')}
            />
            {/* שדה המייל של המנהל */}
            <input
              type="email"
              className="form-control"
              value={newStore.managers[0].emailAdrress}  // השתמש ב-emailAdrress של המנהל הראשון במערך managers
              onChange={(e) => setNewStore({
                ...newStore,
                managers: [{ ...newStore.managers[0], emailAdrress: e.target.value }]
              })}  // עדכון המייל של המנהל
              placeholder={t('sysadmin.manager_email')}
            />
          </div>
          {/* כפתור הוסף חנות */}
          <button className="btn btn-success" onClick={handleAddStore}>
            {t('sysadmin.add_store')}
          </button>
        </div>
        {/* // טבלת חנויות */}

        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead>
              <tr>
                <th>{t('sysadmin.store_name')}</th>
                <th>{t('sysadmin.store_address')}</th>
                <th>{t('sysadmin.managers')}</th>
                <th>{t('sysadmin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store._id}>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      value={editedStores[store._id]?.name || store.name}
                      onChange={(e) =>
                        handleFieldChange(store._id, 'name', e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      value={editedStores[store._id]?.address || store.address}
                      onChange={(e) =>
                        handleFieldChange(store._id, 'address', e.target.value)
                      }
                    />
                  </td>
                  <td>
                    {editedManagers[store._id]?.map((mgr, index) => (
                      <div key={index} className="mb-2">
                        <input
                          type="text"
                          className="form-control d-inline-block me-2"
                          style={{ width: '40%' }}
                          value={mgr.name}
                          placeholder={t('sysadmin.manager_name')}
                          onChange={(e) =>
                            handleManagerFieldChange(
                              store._id,
                              index,
                              'name',
                              e.target.value
                            )
                          }
                          readOnly={!isEditingManagers[store._id]} // אם לא במצב עריכה, השדה יהיה readOnly

                        />
                        <input
                          type="email"
                          className="form-control d-inline-block me-2"
                          style={{ width: '40%' }}
                          value={mgr.emailAdrress}
                          placeholder={t('sysadmin.manager_email')}
                          onChange={(e) =>
                            handleManagerFieldChange(
                              store._id,
                              index,
                              'emailAdrress',
                              e.target.value
                            )
                          }
                          readOnly={!isEditingManagers[store._id]} // אם לא במצב עריכה, השדה יהיה readOnly

                        />
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteManager(store._id, index)}
                        >
                          {t('sysadmin.delete_manager')}
                        </button>
                      </div>
                    ))}
                    {isEditingManagers ? (
                      <>
                        <button
                          className="btn btn-primary mt-2"
                          onClick={() => handleAddManagerField(store._id)}
                        >
                          {t('sysadmin.add_manager')}
                        </button>
                        <button
                          className="btn btn-success mt-2"
                          onClick={() => handleSaveManagers(store._id)}
                        >
                          {t('sysadmin.save_managers')}
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-primary mt-2"
                        onClick={() => handleEditManagers(store._id)}
                      >
                        {t('sysadmin.edit_manager')}
                      </button>
                    )}


                  </td>
                  <td>
                    <button
                      className="btn btn-success me-2"
                      onClick={() => handleSaveField(store._id)}
                    >
                      {t('sysadmin.save')}
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteStore(store._id)}
                    >
                      {t('sysadmin.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="my-5">
        <h2 className="text-center mb-4">{t('sysadmin.statistics')}</h2>
        <div className="alert alert-info">{t('sysadmin.statistics_info')}</div>
      </section>
    </div>
  );
}

export default SysAdmin;
