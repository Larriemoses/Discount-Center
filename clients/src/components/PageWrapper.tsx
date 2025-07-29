// src/components/PageWrapper.tsx
import React from "react";

interface PageWrapperProps {
  children: React.ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  return (
    <div className="pt-[2rem] min-h-screen px-[2rem]  text-justify">
      {children}
    </div>
  );
};

export default PageWrapper;
