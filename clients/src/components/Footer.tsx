// client/src/components/Footer.tsx

import React from "react";
import { Link } from "react-router-dom"; // Import Link for internal navigation

const Footer: React.FC = () => {
  const LOGO_URL =
    "https://res.cloudinary.com/dvl2r3bdw/image/upload/v1752540945/image-removebg-preview_uyqjbj.png";

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center space-y-6">
        {/* Logo */}
        <div className="flex-shrink-0 mb-4">
          <img
            src={LOGO_URL}
            alt="Discount Center Logo"
            className="h-20 w-auto"
          />
        </div>

        {/* Navigation Links - Updated for CSS Grid layout */}
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-gray-400 w-full max-w-lg mb-4">
          <Link
            to="/privacy-policy" // Corrected route
            className="text-center hover:text-white transition-colors duration-300"
          >
            Privacy Policy
          </Link>

          <Link
            to="/contact-us" // Assuming you have a /contact-us page
            className="text-center hover:text-white transition-colors duration-300"
          >
            Contact Us
          </Link>
          <Link
            to="/affiliate-disclosure" // Corrected route
            className="text-center hover:text-white transition-colors duration-300"
          >
            Affiliate Disclosure
          </Link>
          <Link
            to="/terms-of-use" // Corrected route to match App.tsx
            className="text-center hover:text-white transition-colors duration-300"
          >
            Terms of Use
          </Link>
        </nav>

        {/* Copyright Information - Corrected branding */}
        <p className="text-sm text-gray-400 text-center mb-4">
          Copyright &copy; {currentYear} Discount Center.
          <br /> All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
