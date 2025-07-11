// client/src/pages/HomePage.tsx
import React from "react";
import HeroSection from "../components/HeroSection"; // <--- Import HeroSection

const HomePage: React.FC = () => {
  return (
    <div>
      <div className="title">
        <h1 className="main_title text-4xl font-bold">
          Oraimo Discount Code: Up To 57% Off + Extra 5% Code 2024 - 2028
        </h1>
        <h2 className="sub_heading text-2xl font-medium">
          This page contains the best Oraimo discount codes, curated by Discount
          Center
        </h2>
      </div>
      <hr className=" " />
      {/* Hero Section */}
      {/* <HeroSection /> */}
    </div>
  );
};

export default HomePage;
