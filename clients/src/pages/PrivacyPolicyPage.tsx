// src/pages/PrivacyPolicyPage.tsx
import React from "react";
import PageWrapper from "../components/PageWrapper"; // Assuming you have a wrapper for pt-[7rem]

const PrivacyPolicyPage: React.FC = () => {
  return (
    <PageWrapper>
      {" "}
      {/* This wrapper should apply the pt-[7rem] */}
      <div className="container mx-auto px-3 py-8 sm:px-[30rem]">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">
          Privacy Policy
        </h1>

        <p className="mb-4 text-gray-700 leading-relaxed">
          At Discount Center, your privacy is important to us. This page
          outlines our affiliate disclosure, which is a key part of our
          operations. Please note that the content below primarily details our
          use of affiliate links. A comprehensive privacy policy covering data
          collection, cookies, user information, and our full data handling
          practices will be made available soon.
        </p>
      </div>
    </PageWrapper>
  );
};

export default PrivacyPolicyPage;
