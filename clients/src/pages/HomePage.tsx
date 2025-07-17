// client/src/pages/HomePage.tsx

import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import TopDealsSection from "../components/TopDealsSection";
import WhyChooseUsSection from "../components/WhyChooseUsSection";
import Footer from "../components/Footer"; // Import the new Footer component

const HomePage: React.FC = () => {
  const location = useLocation();
  const topDealsRef = useRef<HTMLDivElement>(null); // Ref for the Top Deals section

  // Effect to ALWAYS scroll to top on page load/refresh or path change
  useEffect(() => {
    // Scroll to the very top of the page instantly on any route change or page refresh.
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  // Effect to handle scrolling to the 'top-deals' section when its hash is present
  useEffect(() => {
    if (location.hash === "#top-deals") {
      const timer = setTimeout(() => {
        if (topDealsRef.current) {
          topDealsRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  return (
    <>
      <div className="pt-[4rem] sm:pt-[5rem] sm:px-[7rem] px-[1rem] min-h-[calc(50vh-7rem)] bg-white flex flex-col items-start justify-start">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-5xl lg:text-5xl font-medium text-purple-800 mb-3 sm:mb-6 leading-tight">
            Oraimo Discount Code: Up To 57% Off + Extra 5% Code 2024 - 2028
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-gray-700 max-w-3xl">
            This page contains the best Oraimo discount codes, curated by
            Discount Center
          </p>

          <hr className="mt-5 sm:mt-10 border-t border-purple-400 shadow-2xl bg-amber-100" />
        </div>
      </div>
      {/* TopDealsSection wrapped in a div with id and ref for scrolling */}
      <div id="top-deals" ref={topDealsRef} className="mt-8 sm:mt-12">
        <TopDealsSection />
      </div>
      {/* New WhyChooseUsSection, placed after TopDealsSection with its own top margin */}
      <WhyChooseUsSection className="mt-12 sm:mt-16" />
      {/* The "More exciting content coming soon!" section is removed as footer is added */}
    </>
  );
};

export default HomePage;
