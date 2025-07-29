// src/pages/TermsOfUsePage.tsx
import React from "react";
import PageWrapper from "../components/PageWrapper"; // Assuming you have a wrapper for pt-[7rem]

const TermsOfUsePage: React.FC = () => {
  return (
    <PageWrapper>
      {" "}
      {/* This wrapper should apply the pt-[7rem] */}
      <div className="container mx-auto px-4 py-8 sm:px-[30rem]">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">
          Terms of Use
        </h1>

        <p className="mb-4 text-gray-700 leading-relaxed">
          At Discount Center, our goal is to bring you the best discounts and
          deals available. We may earn a commission if you click on one of our
          affiliate links and make a purchase. This commission is paid by the
          brand at no additional cost to you. The commissions we earn help us
          maintain and improve our website, allowing us to continue offering
          useful information and amazing deals.
        </p>
        <p className="mb-4 text-gray-700 leading-relaxed">
          Rest assured, the income we receive has no impact on the integrity of
          our content, reviews, or recommendations. We pride ourselves on being
          transparent and honest. We only promote products and services that we
          truly believe in.
        </p>
        <p className="mb-4 text-gray-700 leading-relaxed">
          Additionally, the discount codes and deals we share are always valid,
          so you can take advantage of the savings whenever you shop. Discount
          Center collaborates with top reputable brands like Oraimo, Shop
          Inverse, FundedNext, Maven Trading, FTMO, and others. When you make a
          purchase through one of our affiliate links, we may earn a commission
          at no extra cost to you.
        </p>
        <p className="mb-4 text-gray-700 leading-relaxed">
          Thank you for supporting Discount Center!
        </p>
      </div>
    </PageWrapper>
  );
};

export default TermsOfUsePage;
