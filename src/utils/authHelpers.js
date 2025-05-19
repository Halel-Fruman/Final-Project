export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const res = await fetch("/api/User/refresh-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) throw new Error("Failed to refresh token");

    const data = await res.json();
    localStorage.setItem("accessToken", data.token);
    return data.token;
  } catch (err) {
    console.error("Token refresh failed:", err);
    return null;
  }
}

export async function fetchWithTokenRefresh(url, options = {}) {
  const token = localStorage.getItem("accessToken");

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(url, { ...options, headers });
    if (response.status !== 401) return response;

    const newToken = await refreshAccessToken();
    if (!newToken) throw new Error("Failed to refresh token");

    const retryHeaders = {
      ...options.headers,
      Authorization: `Bearer ${newToken}`,
      "Content-Type": "application/json",
    };
    return await fetch(url, { ...options, headers: retryHeaders });
  } catch (err) {
    console.error("fetchWithTokenRefresh error:", err);
    throw err;
  }
}
