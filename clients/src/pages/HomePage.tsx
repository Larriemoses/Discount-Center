// src/pages/HomePage.tsx
import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import TopDealsSection from "../components/TopDealsSection.tsx";
import WhyChooseUsSection from "../components/WhyChooseUsSection.tsx";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import PageWrapper from "../components/PageWrapper"; // Import PageWrapper

const HomePage: React.FC = () => {
  const location = useLocation();
  const topDealsRef = useRef<HTMLDivElement>(null);

  // Scroll to top on path change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  // Scroll to #top-deals if hash matches
  useEffect(() => {
    if (location.hash === "#top-deals") {
      const timer = setTimeout(() => {
        topDealsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  // Animated variants
  const headerVariants: Variants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const, // Corrected: Use 'as const'
      },
    },
  };

  const hrVariants: Variants = {
    hidden: { width: "0%" },
    visible: {
      width: "100%",
      transition: {
        duration: 1.2,
        ease: "easeOut" as const, // Corrected: Use 'as const'
        delay: 0.5,
      },
    },
  };

  return (
    <PageWrapper>
      {" "}
      {/* Wrap HomePage content in PageWrapper */}
      {/* Header animation */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={headerVariants}
        // Removed pt-[4rem] sm:pt-[5rem] from here as PageWrapper handles it
        className="sm:px-[7rem] px-[1rem] min-h-[calc(50vh-7rem)] bg-white flex flex-col items-start justify-start"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-5xl lg:text-5xl font-medium text-purple-800 mb-3 sm:mb-6 leading-tight">
            Oraimo Discount Code: Up To 57% Off + Extra 5% Code 2025 - 2028
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-gray-700 max-w-3xl">
            This page contains the best Oraimo discount codes, curated by
            Discount Center.
          </p>

          <motion.hr
            initial="hidden"
            animate="visible"
            variants={hrVariants}
            className="mt-5 sm:mt-10 border-t border-purple-400 shadow-2xl bg-amber-100"
          />
        </div>
      </motion.div>
      {/* Top Deals Section */}
      <div
        id="top-deals"
        ref={topDealsRef}
        className="mt-8 sm:mt-12 justify-center"
      >
        <TopDealsSection />
      </div>
      {/* Why Choose Us Section */}
      <WhyChooseUsSection className="mt-12 sm:mt-16" />
    </PageWrapper>
  );
};

export default HomePage;
