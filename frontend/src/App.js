import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import CalendarPage from "./pages/CalendarPage";
import BookingsPage from "./pages/BookingsPage";
import ServicesPage from "./pages/ServicesPage";
import ProductsPage from "./pages/ProductsPage";
import SettingsPage from "./pages/SettingsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ShareLinkPage from "./pages/ShareLinkPage";
import PublicBookingPage from "./pages/PublicBookingPage";
import MobilePreview from "./pages/MobilePreview";
import ExpoTestingPage from "./pages/ExpoTestingPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import CookiesPage from "./pages/CookiesPage";
import FounderAdminPage from "./pages/FounderAdminPage";
import ShortLinkRedirect from "./pages/ShortLinkRedirect";
import TeamPage from "./pages/TeamPage";
import SupportPage from "./pages/SupportPage";
import CookieConsent from "./components/CookieConsent";

// New Auth Flow Pages (TailAdmin style)
import SignupAuthPage from "./pages/auth/SignupAuthPage";
import SignupProfilePage from "./pages/auth/SignupProfilePage";
import SignupPhoneVerifyPage from "./pages/auth/SignupPhoneVerifyPage";
import SignupBusinessTypePage from "./pages/auth/SignupBusinessTypePage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import AuthCallbackPage from "./pages/auth/AuthCallbackPage";
import CancelBookingPage from "./pages/booking/CancelBookingPage";
import RescheduleBookingPage from "./pages/booking/RescheduleBookingPage";

// Free Tools
import ToolsHubPage from "./pages/tools/ToolsHubPage";
import QRCodeTool from "./pages/tools/QRCodeTool";
import ServiceMenuTool from "./pages/tools/ServiceMenuTool";
import NoShowReminderTool from "./pages/tools/NoShowReminderTool";
import PricingCalculatorTool from "./pages/tools/PricingCalculatorTool";
import KeywordDensityTool from "./pages/tools/KeywordDensityTool";
import ClientIntakeTool from "./pages/tools/ClientIntakeTool";
import ReviewReplyTool from "./pages/tools/ReviewReplyTool";
import SocialPostTool from "./pages/tools/SocialPostTool";
import OpeningHoursTool from "./pages/tools/OpeningHoursTool";
import BookingLinkTool from "./pages/tools/BookingLinkTool";
import MetaTagTool from "./pages/tools/MetaTagTool";
import RobotsTxtTool from "./pages/tools/RobotsTxtTool";
import UrlExtractorTool from "./pages/tools/UrlExtractorTool";
import SitemapTool from "./pages/tools/SitemapTool";
import BrokenLinkTool from "./pages/tools/BrokenLinkTool";
import DomainSeoTool from "./pages/tools/DomainSeoTool";
import MarkdownTool from "./pages/tools/MarkdownTool";

import "./App.css";

// Protected Route wrapper for business owners
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Admin-only route wrapper
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect non-admins to dashboard
  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Business owner route wrapper (redirects admins to admin panel)
const BusinessRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect admins to admin panel
  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  
  return children;
};

// Helper to get default redirect based on role
const getDefaultRoute = (user) => {
  if (!user) return '/login';
  return user.role === 'admin' ? '/admin' : '/dashboard';
};

function AppRoutes() {
  const { user } = useAuth();
  
  // CRITICAL: Check URL fragment for session_id synchronously during render
  // This prevents race conditions by processing new session_id FIRST before checking existing session
  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  if (typeof window !== 'undefined' && window.location.hash?.includes('session_id=')) {
    return <AuthCallbackPage />;
  }
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={user ? <Navigate to={getDefaultRoute(user)} replace /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to={getDefaultRoute(user)} replace /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to={getDefaultRoute(user)} replace /> : <SignupAuthPage />} />
      
      {/* New Signup Flow Routes (TailAdmin style) */}
      <Route path="/signup/profile" element={<SignupProfilePage />} />
      <Route path="/signup/verify-phone" element={<SignupPhoneVerifyPage />} />
      <Route path="/signup/business-type" element={<ProtectedRoute><SignupBusinessTypePage /></ProtectedRoute>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth-callback" element={<AuthCallbackPage />} />
      
      {/* Legacy routes - redirect to new flow */}
      <Route path="/welcome" element={<Navigate to="/signup" replace />} />
      <Route path="/get-started" element={<Navigate to="/signup" replace />} />
      <Route path="/verify-phone" element={<Navigate to="/signup/verify-phone" replace />} />
      
      <Route path="/book/:businessId" element={<PublicBookingPage />} />
      <Route path="/booking/cancel/:token" element={<CancelBookingPage />} />
      <Route path="/booking/reschedule/:token" element={<RescheduleBookingPage />} />
      <Route path="/b/:shortCode" element={<ShortLinkRedirect />} />
      <Route path="/mobile-preview" element={<MobilePreview />} />
      <Route path="/expo-test" element={<ExpoTestingPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/cookies" element={<CookiesPage />} />

      {/* Free Tools Suite */}
      <Route path="/tools" element={<ToolsHubPage />} />
      <Route path="/tools/qr-code-generator" element={<QRCodeTool />} />
      <Route path="/tools/service-menu-generator" element={<ServiceMenuTool />} />
      <Route path="/tools/no-show-reminder" element={<NoShowReminderTool />} />
      <Route path="/tools/pricing-calculator" element={<PricingCalculatorTool />} />
      <Route path="/tools/keyword-density" element={<KeywordDensityTool />} />
      
      {/* Protected Routes - Business Owners Only */}
      <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
      <Route path="/dashboard" element={<BusinessRoute><DashboardPage /></BusinessRoute>} />
      <Route path="/calendar" element={<BusinessRoute><CalendarPage /></BusinessRoute>} />
      <Route path="/bookings" element={<BusinessRoute><BookingsPage /></BusinessRoute>} />
      <Route path="/team" element={<BusinessRoute><TeamPage /></BusinessRoute>} />
      <Route path="/services" element={<BusinessRoute><ServicesPage /></BusinessRoute>} />
      <Route path="/products" element={<BusinessRoute><ProductsPage /></BusinessRoute>} />
      <Route path="/settings" element={<BusinessRoute><SettingsPage /></BusinessRoute>} />
      <Route path="/analytics" element={<BusinessRoute><AnalyticsPage /></BusinessRoute>} />
      <Route path="/share" element={<BusinessRoute><ShareLinkPage /></BusinessRoute>} />
      <Route path="/support" element={<BusinessRoute><SupportPage /></BusinessRoute>} />
      
      {/* Admin Only Route */}
      <Route path="/admin" element={<AdminRoute><FounderAdminPage /></AdminRoute>} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <CookieConsent />
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              color: '#0A1626',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
