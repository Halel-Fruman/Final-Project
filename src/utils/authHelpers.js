import toast from "react-hot-toast";

let logoutTriggered = false; // מונע הפעלה כפולה

export function forceLogout() {
  if (logoutTriggered) return; // מניעת קריאות כפולות
  logoutTriggered = true;

  toast.error("פג תוקף ההתחברות, נא התחבר מחדש");

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("role");

  setTimeout(() => {
    window.location.href = "/shop"; // הפניה לדף הבית
  }, 1500);
}

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    forceLogout();
    return null;
  }

  try {
    const res = await fetch("/api/User/refresh-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      forceLogout();
      return null;
    }

    const data = await res.json();
    localStorage.setItem("accessToken", data.token);
    return data.token;
  } catch (err) {
    console.error("Token refresh failed:", err);
    forceLogout();
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
    let response = await fetch(url, { ...options, headers });

    if (response.status !== 401) {
      return response;
    }

    const newToken = await refreshAccessToken();
    if (!newToken) {
      return new Response(null, { status: 401 });
    }

    const retryHeaders = {
      ...options.headers,
      Authorization: `Bearer ${newToken}`,
      "Content-Type": "application/json",
    };

    response = await fetch(url, { ...options, headers: retryHeaders });

    if (response.status === 401) {
      forceLogout();
    }

    return response;
  } catch (err) {
    console.error("fetchWithTokenRefresh error:", err);
    forceLogout();
    throw err;
  }
}

window.fetchWithTokenRefresh = fetchWithTokenRefresh;
