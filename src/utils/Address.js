import { fetchWithTokenRefresh } from "../utils/authHelpers";

/**
 * @function addAddress
 * @description Adds a new address for a user.
 * @param {Object} params - The parameters for the function.
 * @param {string} params.userId - The ID of the user.
 * @param {string} params.token - The authentication token.
 * @param {Object} params.address - The address to be added.
 * @returns {Promise<Object>} The response from the server.
 */
export const addAddress = async ({ userId, token, address }) => {
  const res = await fetchWithTokenRefresh(`/api/User/${userId}/add-address`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address }),
  });

  if (!res.ok) throw new Error("Failed to add address");
  return res.json();
};

/**
 * @function editAddress
 * @description Edits an existing address for a user.
 * @param {Object} params - The parameters for the function.
 * @param {string} params.userId - The ID of the user.
 * @param {string} params.token - The authentication token.
 * @param {Array} params.updated - The updated address data.
 * @returns {Promise<Object>} The response from the server.
 */
export const editAddress = async ({ userId, token, updated }) => {
  console.log("Editing address:", updated);
  const res = await fetchWithTokenRefresh(
    `/api/User/${userId}/update-addresses`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ addresses: updated }),
    }
  );

  if (!res.ok) throw new Error("Failed to update addresses");
  return res.json();
};

/** * @function deleteAddress
 * @description Deletes an address from a user's address list.
 * @param {Object} params - The parameters for the function.
 * @param {string} params.userId - The ID of the user.
 * @param {string} params.token - The authentication token.
 * @param {number} params.index - The index of the address to be deleted.
 * @returns {Promise<Object>} The response from the server.
 */
export const deleteAddress = async ({ userId, token, index }) => {
  const res = await fetchWithTokenRefresh(
    `/api/User/${userId}/delete-address`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ index }),
    }
  );

  if (!res.ok) throw new Error("Failed to delete address");
  return res.json();
};
