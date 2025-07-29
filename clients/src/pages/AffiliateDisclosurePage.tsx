// src/pages/AffiliateDisclosurePage.tsx
import React from "react";
import PageWrapper from "../components/PageWrapper"; // Assuming you have a wrapper for pt-[7rem]

const AffiliateDisclosurePage: React.FC = () => {
  return (
    <PageWrapper>
      {" "}
      {/* This wrapper should apply the pt-[7rem] */}
      <div className="container mx-auto px-4 py-8 sm:px-[30rem]">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Affiliate Disclosure
        </h1>

        <p className="mb-4 text-gray-700 leading-relaxed">
          At Discount Center, some of the links on our site are affiliate links.
          This means that if you make a purchase through one of these links, we
          may earn a small commission. This comes at no extra cost to you. The
          commissions we receive help support and maintain the website, allowing
          us to continue providing you with great deals and useful information.
        </p>
        <p className="mb-4 text-gray-700 leading-relaxed">
          We want to be transparent with you—our recommendations are based on
          our genuine belief in the products and services we feature. We only
          promote what we truly believe will benefit our audience. Your support
          through these links helps us keep improving and delivering the best
          possible deals.
        </p>
      </div>
    </PageWrapper>
  );
};

export default AffiliateDisclosurePage;
