// client/src/components/HeroSection.tsx

import React from "react";

const HeroSection: React.FC = () => {
  const imageUrl =
    "https://res.cloudinary.com/dvl2r3bdw/image/upload/v1752169744/expressive-african-american-woman-with-copy-space_h8ascj.jpg";

  return (
    <section
      className="relative bg-cover bg-center min-h-[90vh] flex items-center justify-center text-center px-4 pt-24 md:pt-32"
      style={{
        backgroundImage: `url('${imageUrl}')`,
        backgroundPosition: "top center",
        backgroundSize: "cover",
      }}
    >
      {/* Adjusted purplish overlay for dark, medium, and lilac tones */}
      {/* Changed `opacity-120` to `opacity-100` as 120 is an invalid Tailwind value */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-purple-700 to-purple-300 opacity-60 mix-blend-colorBurn"></div>

      {/* Content */}
      <div className="relative z-10 text-white max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 drop-shadow-lg">
          Top Discount Codes, Coupon Codes & Deals With Exclusive Offers
        </h1>
        {/* You can add a call to action button here if desired */}
      </div>
    </section>
  );
};

export default HeroSection;
