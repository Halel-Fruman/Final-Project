import { useState, createContext, useContext } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
// The AlertContext is a context object that provides the showAlert and closeAlert functions
const AlertContext = createContext();
// The AlertProvider component is a custom provider component that takes the children as props
export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    type: "info",
    onConfirm: null, // add a function for confirmation
    onCancel: null, // add a function for cancel
  });
  // The showAlert function is used to display an alert dialog with the specified message and type
  const showAlert = (
    message,
    type = "info",
    onConfirm = null,
    onCancel = null
  ) => {
    console.log("כשהולכים להציג את האלר");
    // Set the alert state with the specified message and type
    setAlert({
      open: true,
      message,
      type,
      onConfirm,
      onCancel,
    });
  };
  // The closeAlert function is used to close the alert dialog
  const closeAlert = () => {
    setAlert((prev) => ({ ...prev, open: false }));
  };
  // The AlertProvider component provides the showAlert and closeAlert functions to the AlertContext
  return (
    <AlertContext.Provider value={{ showAlert, closeAlert }}>
      {children}
      {alert.open && (
        <Dialog
          open={alert.open}
          onClose={closeAlert}
          className="fixed inset-0 z-50">
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
                            alert.onCancel(); //call the function only if it is a function
                          }
                          closeAlert();
                        }}>
                        ביטול
                      </button>
                    )}
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded"
                      onClick={() => {
                        if (typeof alert.onConfirm === "function") {
                          alert.onConfirm(); // call the function only if it is a function
                        }
                        closeAlert();
                      }}>
                      אישור
                    </button>
                  </>
                ) : (
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={closeAlert}>
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
// The useAlert hook is used to access the showAlert and closeAlert functions from the AlertContext
export const useAlert = () => useContext(AlertContext);
