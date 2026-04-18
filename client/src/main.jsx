import React from "react";
import ReactDOM from "react-dom/client";
import "leaflet/dist/leaflet.css";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Toaster position="top-right" />
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
