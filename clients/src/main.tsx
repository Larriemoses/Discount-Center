// client/src/main.tsx (or index.tsx)

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Your Tailwind CSS import
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom"; // <--- IMPORTANT: Ensure this import is here

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {/* The App component MUST be wrapped inside the Router */}
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
