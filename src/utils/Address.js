export const addAddress = async ({ userId, token, address }) => {
    const res = await fetch(`/api/User/${userId}/add-address`, {
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

  export const editAddress = async ({ userId, token, updated }) => {
    console.log("Editing address:",  updated );
    const res = await fetch(`/api/User/${userId}/update-addresses`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({addresses: updated }),
    });

    if (!res.ok) throw new Error("Failed to update addresses");
    return res.json();
  };

  export const deleteAddress = async ({ userId, token, index }) => {
    const res = await fetch(`/api/User/${userId}/delete-address`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ index }),
    });

    if (!res.ok) throw new Error("Failed to delete address");
    return res.json();
  };
