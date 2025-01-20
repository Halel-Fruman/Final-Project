import { useState, createContext, useContext } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    type: "info",
    onConfirm: null, // נוסיף פונקציה שמופעלת אם המשתמש מאשר
    onCancel: null,  // נוסיף פונקציה לביטול

  });

  const showAlert = (message, type = "info", onConfirm = null, onCancel = null) => {
    console.log("כשהולכים להציג את האלרט");

    setAlert({
      open: true,
      message,
      type,
      onConfirm,
      onCancel,
    });
  };

  const closeAlert = () => {
    setAlert((prev) => ({ ...prev, open: false }));
  };

  return (
    
    <AlertContext.Provider value={{ showAlert, closeAlert }}>
      {children}
      {alert.open && (
        <Dialog open={alert.open} onClose={closeAlert} className="fixed inset-0 z-50">
          <DialogBackdrop className="fixed inset-0 bg-gray-500/75" />
          <div className="fixed inset-0 flex items-center justify-center">
            <DialogPanel className="bg-white p-8 rounded-lg shadow-2xl max-w-md">
              <DialogTitle className="text-lg font-semibold">
                {alert.type === "success" && "✅ הצלחה"}
                {alert.type === "error" && "❌ שגיאה"}
                {alert.type === "warning" && "⚠️ אזהרה"}
                {alert.type === "info" && "ℹ️ מידע"}
              </DialogTitle>
              <p className="mt-2">{alert.message}</p>
              <div className="mt-4 flex justify-end space-x-2">
                {alert.onConfirm || alert.onCancel ? (
                  <>
                    {alert.onCancel && (
                    <button
                      className="bg-gray-300 px-4 py-2 rounded"
                      onClick={() => {
                        if (typeof alert.onCancel === "function") {
                          alert.onCancel(); // קריאה לפונקציה לביטול
                        }
                        closeAlert();
                      }}
                    >
                      ביטול
                    </button>
                    )}
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded"
                      onClick={() => {
                        if (typeof alert.onConfirm === "function") {
                          alert.onConfirm(); // מפעיל רק אם זה פונקציה
                        }
                        closeAlert();
                      }}
                    >
                      אישור
                    </button>
                    
                  </>
                ) : (
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={closeAlert}
                  >
                    סגור
                  </button>
                )}
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);
