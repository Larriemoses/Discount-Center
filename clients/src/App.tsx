// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Import Router components
import StoreList from "./components/StoreList"; // Your existing component
import StoreProducts from "./components/StoreProducts"; // We'll create this next!

function App() {
  return (
    <Router>
      {" "}
      {/* Wrap your entire app with BrowserRouter */}
      <div className="min-h-screen flex flex-col bg-gray-100 text-gray-800">
        <header className="bg-purple-700 text-white p-4 shadow-md">
          <h1 className="text-3xl font-bold text-center">Discount Center</h1>
          {/* You can add a navigation bar here later, potentially with a Link back to home */}
        </header>

        <main className="flex-grow container mx-auto p-4">
          <Routes>
            {" "}
            {/* Define your routes here */}
            <Route path="/" element={<StoreList />} />{" "}
            {/* Route for displaying all stores */}
            <Route path="/stores/:storeId" element={<StoreProducts />} />{" "}
            {/* Route for a single store's products */}
            {/* Add more routes here as your app grows */}
          </Routes>
        </main>

        <footer className="bg-gray-800 text-white p-4 text-center">
          <p>&copy; 2025 Discount Center. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
