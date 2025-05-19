import React from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
//  Modal component
const Modal = ({ isOpen, onClose, children }) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Overlay */}
      <div className="fixed h-screen inset-0 bg-black bg-opacity-50" />

      {/* Modal Content */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
          <button
            onClick={onClose}
            aria-label="Close Modal"
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">
            ✕
          </button>
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default Modal;
