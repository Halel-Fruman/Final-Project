import  { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { addAddress, editAddress, deleteAddress } from "../../../utils/Address";

const AddressManager = ({ addresses, userId, onUpdate, token }) => {
  const { t } = useTranslation();
  const [newCity, setNewCity] = useState("");
  const [newStreetAddress, setNewStreetAddress] = useState("");
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingCity, setEditingCity] = useState("");
  const [editingStreetAddress, setEditingStreetAddress] = useState("");

  // Function to handle adding a new address
  // This function is called when the user submits the new address form
  const handleAddAddress = async () => {
    try {
      const updatedAddresses = await addAddress({
        userId,
        token,
        address: { city: newCity, streetAddress: newStreetAddress },
      });
      onUpdate(updatedAddresses);
      setNewCity("");
      setNewStreetAddress("");
      setShowAddAddress(false);
      toast.success(t("personal_area.alerts.addressAdded"));
    } catch (err) {
      console.error(err.message);
      toast.error(t("personal_area.alerts.addError"));
    }
  };

  // Function to handle editing an existing address
  // This function is called when the user submits the edited address form
  const handleEditAddress = async () => {
    try {
      const updated = [...addresses];
      updated[editingIndex] = {
        city: editingCity,
        streetAddress: editingStreetAddress,
      };
      const updatedAddresses = await editAddress({ userId, token, updated });
      onUpdate(updatedAddresses);
      setEditingIndex(null);
      setEditingCity("");
      setEditingStreetAddress("");
      toast.success(t("personal_area.alerts.saveSuccess"));
    } catch (err) {
      console.error(err.message);
      toast.error(t("personal_area.alerts.saveError"));
    }
  };

  // Function to handle deleting an address
  // This function is called when the user clicks the delete button for an address
  const handleDeleteAddress = async (index) => {
    try {
      const updatedAddresses = await deleteAddress({ userId, token, index });
      onUpdate(updatedAddresses);
      toast.success(t("personal_area.alerts.deleteSuccess"));
    } catch (err) {
      console.error(err.message);
      toast.error(t("personal_area.alerts.deleteError"));
    }
  };

  // Render the address manager component
  // This component displays the list of addresses and allows the user to add, edit, or delete addresses
  return (
    <div className="mb-4">
      <div className="card">
        <div className="card-body">
          <label htmlFor="address">
            <h2 className="text-xl font-bold mb-4">
              {t("personal_area.fields.addresses")}
            </h2>
          </label>
          {/* Display the list of addresses If there are no addresses, display a message*/}
          {addresses?.length > 0 ? (
            addresses.map((address, index) => (
              <div key={index} className="card mb-3 p-2">
                <div className="flex flex-col lg:flex-row text-lg justify-between  gap-3">
                  {editingIndex === index ? (
                    <>
                      <input
                        type="text"
                        className="w-full lg:w-2/4 bg-gray-100 p-4 rounded-md shadow-sm"
                        placeholder={t("addAddress.city")}
                        value={editingCity}
                        onChange={(e) => setEditingCity(e.target.value)}
                      />
                      <input
                        type="text"
                        className="w-full lg:w-2/4 bg-gray-100 p-4 rounded-md shadow-sm"
                        placeholder={t("addAddress.address")}
                        value={editingStreetAddress}
                        onChange={(e) =>
                          setEditingStreetAddress(e.target.value)
                        }
                      />
                      <div className="flex gap-2 mt-2 lg:mt-0 w-full ">
                        <button
                          className="self-center bg-white text-primaryColor rounded-full hover:bg-primaryColor hover:text-white "
                          aria-label={t("personal_area.actions.save")}
                          onClick={handleEditAddress}>
                          <Icon
                            icon="material-symbols:check-circle-outline-rounded"
                            width="32"
                            height="32"
                          />
                        </button>
                        <button
                          className="self-center bg-white text-gray-600 rounded-full hover:bg-gray-600 hover:text-white "
                          aria-label={t("personal_area.actions.cancel")}
                          onClick={() => setEditingIndex(null)}>
                          <Icon
                            icon="material-symbols:cancel-outline-rounded"
                            width="32"
                            height="32"
                          />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="w-full lg:w-2/4 bg-gray-100 p-4 rounded-md shadow-sm text-center lg:text-start">
                        {address.city}, {address.streetAddress}
                      </span>
                      <div className="flex gap-2 mt-2 lg:mt-0">
                        <button
                          className="self-center bg-white text-primaryColor border-primaryColor rounded hover:bg-primaryColor hover:text-white p-2"
                          aria-label="Edit"
                          onClick={() => {
                            setEditingIndex(index);
                            setEditingCity(address.city);
                            setEditingStreetAddress(address.streetAddress);
                          }}>
                          <Icon
                            icon="tabler:home-edit"
                            width="32"
                            height="32"
                          />
                        </button>
                        <button
                          className="self-center bg-white text-deleteC rounded hover:bg-deleteC hover:text-white p-2"
                          aria-label="Delete"
                          onClick={() => handleDeleteAddress(index)}>
                          <Icon
                            icon="material-symbols:delete-outline"
                            width="32"
                            height="32"
                          />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>{t("personal_area.alerts.noAddresses")}</p>
          )}

          {showAddAddress ? (
            <div className="card text-lg mt-3 flex flex-col lg:flex-row gap-4">
              <input
                type="text"
                className="w-full  lg:w-1/4 bg-gray-100 p-4 rounded-md shadow-sm"
                placeholder={t("addAddress.city")}
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
              />
              <input
                type="text"
                className="w-full  lg:w-1/4 bg-gray-100 p-4 rounded-md shadow-sm"
                placeholder={t("addAddress.address")}
                value={newStreetAddress}
                onChange={(e) => setNewStreetAddress(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  className="self-center bg-white  text-primaryColor rounded-full hover:bg-primaryColor hover:text-white  "
                  onClick={handleAddAddress}
                  aria-label={t("personal_area.actions.add")}>
                  <Icon
                    icon="material-symbols:check-circle-outline-rounded"
                    width="32"
                    height="32"
                  />
                </button>
                <button
                  className="self-center bg-white text-gray-600  rounded-full rounded hover:bg-gray-600 hover:text-white "
                  aria-label={t("personal_area.actions.cancel")}
                  onClick={() => setShowAddAddress(false)}>
                  <Icon
                    icon="material-symbols:cancel-outline-rounded"
                    width="32"
                    height="32"
                  />
                </button>
              </div>
            </div>
          ) : (
            <button
              className="bg-white text-primaryColor border-primaryColor rounded hover:bg-primaryColor hover:text-white mt-3"
              aria-label={t("personal_area.actions.add")}
              onClick={() => setShowAddAddress(true)}>
              <Icon
                icon="material-symbols:add-home-outline-rounded"
                width="36"
                height="36"
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressManager;
