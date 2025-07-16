// client/src/pages/HomePage.tsx

import React from "react";
import TopDealsSection from "../components/TopDealsSection";

const HomePage: React.FC = () => {
  return (
    <>
      <div className="pt-[4rem] sm:pt-[5rem] sm:px-[7rem] px-[1rem] min-h-[calc(50vh-7rem)] bg-white flex flex-col items-start justify-start">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-5xl lg:text-5xl font-medium text-purple-800 mb-3 sm:mb-6 leading-tight">
            Oraimo Discount Code: Up To 57% Off + Extra 5% Code 2024 - 2028
          </h1>
          {/* Removed mx-auto from p tag to ensure left alignment */}
          <p className="text-sm sm:text-lg md:text-xl text-gray-700 max-w-3xl">
            This page contains the best Oraimo discount codes, curated by
            Discount Center
          </p>

          <hr className="mt-5 sm:mt-10 border-t border-purple-400 shadow-2xl bg-amber-100" />
          {/* You can add more homepage content here */}
        </div>
      </div>
      <TopDealsSection />

      {/* You can add more sections here if needed for the homepage */}
      <div className="py-12 bg-white text-center">
        <h3 className="text-2xl font-bold text-gray-800">
          More exciting content coming soon!
        </h3>
      </div>
    </>
  );
};

export default HomePage;
