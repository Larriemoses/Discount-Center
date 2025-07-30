import { Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AdminLoginPage from "./pages/AdminLogin";
import AdminDashboardPage from "./pages/AdminDashboard";
import AdminStoreListPage from "./pages/AdminStoreListPage";
import AdminStoreFormPage from "./pages/AdminStoreFormPage";
import AdminProductListPage from "./pages/AdminProductListPage";
import AdminProductFormPage from "./pages/AdminProductFormPage";
import Navbar from "./components/Navbar";
import StoreDetailsPage from "./pages/StoreDetailsPage";
import StoreListPage from "./pages/StoreListPage";
import Footer from "./components/Footer";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import SubmitStorePage from "./pages/SubmitStorePage";
import ContactUsPage from "./pages/ContactUsPage";

// Import new pages for password reset
import ForgotPasswordPage from "./pages/ForgetPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// Import new pages and the PageWrapper
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import AffiliateDisclosurePage from "./pages/AffiliateDisclosurePage";
import TermsOfUsePage from "./pages/TermsOfUsePage";
import PageWrapper from "./components/PageWrapper"; // Import the PageWrapper

function App() {
  const location = useLocation();
  // Update isAdminRoute to also hide Navbar/Footer on password reset pages
  const isAdminRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname === "/forgot-password" ||
    location.pathname.startsWith("/reset-password/");

  return (
    <>
      {/* Conditionally render Navbar only if it's NOT an admin-related route */}
      {!isAdminRoute && <Navbar />}

      <Routes>
        {/* Public Routes - All these pages now need a wrapper with pt-[7rem] to clear the fixed Navbar */}
        {/* HomePage is already wrapped internally with PageWrapper */}
        <Route path="/" element={<HomePage />} />

        {/* Password Reset Routes - No Navbar/Footer for these */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/reset-password/:resettoken"
          element={<ResetPasswordPage />}
        />

        {/* SubmitStorePage and ContactUsPage also need PageWrapper */}
        <Route
          path="/submit-store"
          element={
            <PageWrapper>
              <SubmitStorePage />
            </PageWrapper>
          }
        />
        <Route
          path="/contact-us"
          element={
            <PageWrapper>
              <ContactUsPage />
            </PageWrapper>
          }
        />

        {/* New public routes, already using PageWrapper internally */}
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route
          path="/affiliate-disclosure"
          element={<AffiliateDisclosurePage />}
        />
        <Route path="/terms-of-use" element={<TermsOfUsePage />} />

        {/* Admin Routes (no Navbar, no Footer - handled by isAdminRoute check) */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/stores" element={<AdminStoreListPage />} />
        <Route path="/admin/stores/new" element={<AdminStoreFormPage />} />
        <Route path="/admin/stores/edit/:id" element={<AdminStoreFormPage />} />
        <Route path="/admin/products" element={<AdminProductListPage />} />
        <Route path="/admin/products/new" element={<AdminProductFormPage />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        <Route
          path="/admin/products/edit/:id"
          element={<AdminProductFormPage />}
        />

        {/* Public Routes - Ensure these pages use the PageWrapper internally */}
        <Route
          path="/today-deals"
          element={
            <PageWrapper>
              <div>Today Deals Page Content (Coming Soon)</div>
            </PageWrapper>
          }
        />
        {/* StoreListPage and StoreDetailsPage also need PageWrapper */}
        <Route
          path="/stores"
          element={
            <PageWrapper>
              <StoreListPage />
            </PageWrapper>
          }
        />
        <Route
          path="/stores/:slug"
          element={
            <PageWrapper>
              <StoreDetailsPage />
            </PageWrapper>
          }
        />
      </Routes>

      {/* Conditionally render Footer only if it's NOT an admin-related route */}
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App;
