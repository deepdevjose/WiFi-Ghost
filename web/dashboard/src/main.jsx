import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const appModule = import.meta.env.VITE_EMBEDDED === "true"
  ? import("./EmbeddedApp.jsx")
  : import("./App.jsx");

appModule.then(({ default: App }) => {
  createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
