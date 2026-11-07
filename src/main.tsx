import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import AdminApp from "./cms/AdminApp";
import "./index.css";

const isAdminRoute =
  window.location.pathname.startsWith("/gestao-restrita") ||
  window.location.hash.startsWith("#/gestao-restrita");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {isAdminRoute ? <AdminApp /> : <App />}
  </React.StrictMode>,
);
