import React from "react";
import { motion } from "framer-motion"; // Import motion from framer-motion
import type { Variants } from "framer-motion";
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
      <div className="max-w-4xl mx-auto w-[90%] sm:w-full">
        {/* Section Title - centered */}
        <motion.h2
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-2xl md:text-4xl font-extrabold text-gray-800 mb-8 text-center"
        >
          Why Choose Discount Center
        </motion.h2>

        {/* Introductory Paragraph - animated */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          className="text-base sm:text-lg text-gray-700 leading-relaxed mb-8 max-w-3xl mx-auto text-center"
        >
          Why choose Oraimo Nigeria? Oraimo Nigeria is the go-to brand for
          high-quality tech accessories designed for the Nigerian market. Here's
          what makes it stand out:
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
            <strong>1. Built for Nigerians</strong> Oraimo's products are
            designed with Nigerians' unique needs in mind, providing
            long-lasting and dependable solutions that function smoothly in our
            environment.
          </motion.p>
          <motion.p variants={itemVariants}>
            <strong>2. Affordable Premium Quality</strong> Oraimo blends cost
            and high quality, guaranteeing you receive the most value for your
            money without sacrificing performance.
          </motion.p>
          <motion.p variants={itemVariants}>
            <strong>3. Long-Lasting Durability</strong> Oraimo devices, from
            power banks to earbuds, are designed to withstand the rigorous
            circumstances of Nigeria's lifestyle and electricity challenges.
          </motion.p>
          <motion.p variants={itemVariants}>
            <strong>4. Local Availability and Delivery</strong> Oraimo has a
            solid presence in Nigeria, with fast and dependable delivery
            choices, ensuring that you receive your accessories swiftly and
            without fuss.
          </motion.p>
          <motion.p variants={itemVariants}>
            <strong>5. Trusted Warranty</strong> All Oraimo devices include an
            extended warranty, providing peace of mind with each purchase. If
            there is an issue, you are covered!
          </motion.p>
          <motion.p variants={itemVariants}>
            <strong>6. Innovative Designs</strong> Oraimo offers beautiful and
            sophisticated tech accessories that complement your own style while
            providing outstanding performance.
          </motion.p>
          <motion.p variants={itemVariants}>
            <strong>7. Broad Product Range</strong> Whether you need: -{" "}
            <strong>Wireless Earbuds</strong> for high-quality sound, -{" "}
            <strong>Power Banks</strong> to stay charged while on the go, -{" "}
            <strong>Smartwatches</strong> to track your fitness. - Or{" "}
            <strong>Fast Chargers</strong> for speedy and dependable charging,
            Oraimo Nigeria has you covered.
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
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
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
              href="#" // Placeholder link
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
              <svg
                className="w-6 h-6 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12.04 2c-5.46 0-9.92 4.46-9.92 9.92s4.46 9.92 9.92 9.92c1.85 0 3.6-.53 5.12-1.5l3.87 1.02-1.05-3.79c1-.9 1.76-2.1 2.2-3.48.96-3.78-1.07-7.66-4.85-8.62C15.9 2.05 14 2 12.04 2zM17 15.65c-.1.2-.23.23-.42.23-.19 0-.58-.1-.9-.23-.33-.14-1.26-.6-1.57-.65-.3-.06-.52-.02-.73.2-.2.22-.8.8-.97.97-.18.18-.34.2-.63.09s-1.2-.44-2.29-1.42c-.85-.75-1.42-1.68-1.57-1.95-.15-.26 0-.4-.1-.58s-.2-.3-.3-.47c-.1-.18-.2-.3-.2-.48s0-.3.1-.47c.07-.15.2-.23.3-.4.1-.18.45-.4.58-.6s.25-.3.38-.47c.13-.18.06-.3-.06-.47-.13-.18-.6-.6-.8-.8s-.36-.2-.55-.2c-.2 0-.4-.02-.6-.02-.2 0-.55.1-.8.4C6.3 9.4 5.5 10.2 5.5 11.2s.8 1.2.9 1.35c.1.18 1.6 2.45 3.88 3.32.5.18.9.27 1.2.35.3.08.7.06.96-.06.27-.12.8-.32.96-.52.17-.2.2-.3.3-.47.1-.18.23-.4.32-.57.1-.18.2-.3.4-.3.16 0 .4.06.58.15.18.1.37.2.5.3.1.07.27.18.37.2.1.02.18.02.3 0 .1-.02.4-.15.8-.32.4-.2.7-.37.76-.43.06-.06.2-.2.4-.4s.3-.4.4-.6c.1-.2.2-.4.2-.6 0-.2-.1-.4-.2-.5l-.3-.5c-.1-.18-.3-.4-.4-.5-.1-.1-.3-.2-.4-.3-.1-.1-.2-.1-.3-.2-.1-.02-.1-.02-.2-.02h-.4c-.2 0-.5.1-.8.4l-.5.5c-.1.18-.2.2-.2.4s0 .3.1.5c.07.15.2.3.4.47s.4.3.47.4.1.2.2.3c.07.1.1.2.18.3.06.1.1.18.15.2s.07.1.1.1z" />
              </svg>
              WhatsApp
            </motion.a>
            {/* Facebook Button */}
            <motion.a
              href="#" // Placeholder link
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
              <svg
                className="w-6 h-6 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M14 13.5h2.8l.7-3.6H14V7.9c0-1.2.3-2.1 2.1-2.1H18V2.1C17.7 2.1 16.7 2 15.4 2c-3.1 0-5.2 1.9-5.2 5.3v3.1H7.4v3.6h2.8V22h4V13.5z" />
              </svg>
              Facebook
            </motion.a>
            {/* Instagram Button */}
            <motion.a
              href="#" // Placeholder link
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-white py-3 px-8 rounded-lg shadow-md hover:opacity-90 transition-opacity flex items-center justify-center w-full sm:w-auto min-w-[120px]"
              variants={buttonVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              whileTap="tap"
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <svg
                className="w-6 h-6 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M7.8 2h8.4C18.1 2 20 3.9 20 6.2v8.4c0 2.3-1.9 4.2-4.2 4.2H7.8C5.5 18.8 3.6 16.9 3.6 14.6V6.2C3.6 3.9 5.5 2 7.8 2zm10.7 2.6H6.2c-1.3 0-2.4 1.1-2.4 2.4v8.4c0 1.3 1.1 2.4 2.4 2.4h10.3c1.3 0 2.4-1.1 2.4-2.4V6.2c0-1.3-1.1-2.4-2.4-2.4zM12 7.5c-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5 4.5-2 4.5-4.5-2-4.5-4.5-4.5zm0 7.4c-1.6 0-2.9-1.3-2.9-2.9s1.3-2.9 2.9-2.9 2.9 1.3 2.9 2.9-1.3 2.9-2.9 2.9zM16.9 5.8c-.6 0-1.1.5-1.1 1.1s.5 1.1 1.1 1.1c.6 0 1.1-.5 1.1-1.1s-.5-1.1-1.1-1.1z" />
              </svg>
              Instagram
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
