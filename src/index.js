import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./i18n";
import "@fontsource/rubik";
import "@fontsource/rubik/500.css";
import "@fontsource/rubik/700.css";
import "./index.css";
import "@fortawesome/fontawesome-svg-core"


const lang = localStorage.getItem("i18nextLng") || "he";
document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
document.documentElement.lang = lang;

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
