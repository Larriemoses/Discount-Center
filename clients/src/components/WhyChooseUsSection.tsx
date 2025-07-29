// src/components/WhyChooseUsSection.tsx

import React from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

// Import icons from react-icons
import { BsWhatsapp, BsFacebook, BsInstagram } from "react-icons/bs";

interface WhyChooseUsSectionProps {
  className?: string;
}

const WhyChooseUsSection: React.FC<WhyChooseUsSectionProps> = ({
  className,
}) => {
  const LOGO_URL =
    "https://res.cloudinary.com/dvl2r3bdw/image/upload/v1752540945/image-removebg-preview_uyqjbj.png";

  // Framer Motion Variants for animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Stagger children animations by 0.1 seconds
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const buttonVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    hover: { scale: 1.05, boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)" },
    tap: { scale: 0.95 },
  };

  return (
    <section
      className={`${className || ""} bg-white py-12 px-4 sm:px-6 lg:px-8`}
    >
      {/* Main container for content, controlling overall width and centering */}
      <div className="max-w-4xl mx-auto w-[100%] sm:w-full">
        {/* Section Title - centered */}
        <motion.h2
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: "easeOut" as const }} // Added 'as const' for TypeScript
          className="text-2xl md:text-4xl font-extrabold text-gray-800 mb-8 text-center"
        >
          Why Choose Discount Center
        </motion.h2>

        {/* Introductory Paragraph - animated */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" as const }} // Added 'as const' for TypeScript
          className="text-base sm:text-lg text-gray-700 leading-relaxed mb-8 max-w-3xl mx-auto text-center"
        >
          Discount Center is your premier destination for the best deals,
          discount codes, and special offers. Here's why you should choose us:
        </motion.p>

        {/* List of Reasons - Staggered animation for each paragraph */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible" // Animate when the component comes into view
          viewport={{ once: true, amount: 0.2 }} // Only animate once, when 20% visible
          className="text-left text-gray-700 text-base sm:text-lg leading-relaxed space-y-4 max-w-2xl mx-auto"
        >
          <motion.p variants={itemVariants}>
            <strong>1. Curated for You:</strong> We meticulously handpick the
            top discounts and deals, ensuring you get access to genuine savings
            on products and services that matter.
          </motion.p>
          <motion.p variants={itemVariants}>
            <strong>2. Best Deals, Real Savings:</strong> Our mission is to help
            you save money. We constantly update our platform with the latest
            and most impactful discount codes and promotions.
          </motion.p>
          <motion.p variants={itemVariants}>
            <strong>3. Verified & Valid Codes:</strong> Say goodbye to expired
            codes! We strive to verify every discount to ensure you can
            confidently use them and enjoy your savings.
          </motion.p>
          <motion.p variants={itemVariants}>
            <strong>4. Easy Access to Discounts:</strong> Our user-friendly
            platform makes finding the perfect deal simple and quick, saving you
            time and effort.
          </motion.p>
          <motion.p variants={itemVariants}>
            <strong>5. Partnering with Reputable Brands:</strong> We collaborate
            with trusted brands to bring you exclusive offers and ensure the
            quality of the products and services featured.
          </motion.p>
          <motion.p variants={itemVariants}>
            <strong>6. Wide Range of Offers:</strong> From Oraimo tech
            accessories to various other categories, we aim to cover a broad
            spectrum of deals to meet diverse needs.
          </motion.p>
          <motion.p variants={itemVariants}>
            <strong>7. Stay Updated with New Deals:</strong> Our platform is
            regularly refreshed with new discounts, ensuring you never miss out
            on an opportunity to save.
          </motion.p>
        </motion.div>

        {/* Discount Center Logo - centered with animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.5,
            duration: 0.8,
            type: "spring",
            stiffness: 100,
            damping: 10,
          }}
          viewport={{ once: true, amount: 0.5 }}
          className="mt-12 flex justify-center"
        >
          <img
            src={LOGO_URL}
            alt="Discount Center Logo"
            className="h-20 w-auto"
          />
        </motion.div>

        {/* Horizontal line - centered */}
        <hr className="border-t-2 border-purple-400 w-full max-w-4xl mx-auto mt-8" />

        {/* Connect With Us Section */}
        <div className="mt-8">
          {/* Title - centered with animation */}
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" as const }} // Added 'as const' for TypeScript
            viewport={{ once: true, amount: 0.5 }}
            className="text-2xl md:text-4xl font-extrabold text-gray-800 mb-8 text-center"
          >
            Connect With Us
          </motion.h2>
          {/* Buttons - centered as a group with staggered animation and hover effects */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            {/* WhatsApp Button */}
            <motion.a
              href="https://wa.me/2349160403499" // Corrected WhatsApp link
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#00c56c] text-white py-3 px-8 rounded-lg shadow-md hover:opacity-90 transition-opacity flex items-center justify-center w-full sm:w-auto min-w-[120px]"
              variants={buttonVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              whileTap="tap"
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <BsWhatsapp className="w-6 h-6 mr-2" /> {/* React Icon */}
              WhatsApp
            </motion.a>
            {/* Facebook Button */}
            <motion.a
              href="https://www.facebook.com/share/1EbNL4B2Db/?mibextid=wwXIfr" // Corrected Facebook link
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1877F2] text-white py-3 px-8 rounded-lg shadow-md hover:opacity-90 transition-opacity flex items-center justify-center w-full sm:w-auto min-w-[120px]"
              variants={buttonVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              whileTap="tap"
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <BsFacebook className="w-6 h-6 mr-2" /> {/* React Icon */}
              Facebook
            </motion.a>
            {/* Instagram Button */}
            <motion.a
              href="https://www.instagram.com/labels_green?igsh=cmM5cGRkODI5cW5l&utm_source=qr" // Corrected Instagram link
              target="_blank"
              rel="noopener noreferrer"
              className="bg-pink-600 text-white py-3 px-8 rounded-lg shadow-md hover:opacity-90 transition-opacity flex items-center justify-center w-full sm:w-auto min-w-[120px]"
              variants={buttonVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              whileTap="tap"
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <BsInstagram className="w-6 h-6 mr-2" /> {/* React Icon */}
              Instagram
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
