/**
 * Rezvo Directory — rezvo.co.uk
 * Consumer-facing: search, discover, and book local businesses
 * 
 * Static marketing pages (UX Pilot designs) are served from /public/*.html
 * React handles the SPA routes (search, listing, booking, auth)
 */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ScrollToTop from './components/ScrollToTop'
import ChatWidget from './components/ChatWidget'

import PublicLayout from './components/layout/PublicLayout'

/* External redirect helper — sends to rezvo.app for auth */
const ExternalRedirect = ({ to }) => {
  window.location.href = to
  return null
}

/* Directory pages */
import DirectoryLanding from './pages/directory/DirectoryLanding'
import SearchPage from './pages/directory/SearchPage'
import ListingPage from './pages/directory/ListingPage'
import FaqsPage from './pages/directory/FaqsPage'

/* Public SEO pages */
import HomePage from './pages/public/HomePage'
import SearchResults from './pages/public/SearchResults'
import BusinessListing from './pages/public/BusinessListing'
import CategoryHub from './pages/public/CategoryHub'

/* Static pages (React fallbacks — primary versions are UX Pilot HTML in /public/) */
import AboutPage from './pages/static/AboutPage'
import ForBusinessPage from './pages/static/ForBusinessPage'
import ContactPage from './pages/static/ContactPage'
import PrivacyPage from './pages/static/PrivacyPage'
import TermsPage from './pages/static/TermsPage'
import CookiesPage from './pages/static/CookiesPage'
import NotFoundPage from './pages/static/NotFoundPage'

/* Booking flow */
import BookingFlow from './pages/booking/BookingFlow'
import BookingConfirmation from './pages/booking/BookingConfirmation'
import BookingManage from './pages/booking/BookingManage'

const App = () => {
  return (
    <>
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <Routes>
          {/* Core directory */}
          <Route path="/" element={<DirectoryLanding />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/restaurant/:slug" element={<ListingPage />} />
          <Route path="/venue/:slug" element={<ListingPage />} />
          {/* Auth — redirect to rezvo.app */}
          <Route path="/login" element={<ExternalRedirect to="https://rezvo.app/login" />} />
          <Route path="/signup" element={<ExternalRedirect to="https://rezvo.app/register" />} />
          <Route path="/faqs" element={<FaqsPage />} />

          {/* React fallback pages (nginx will serve .html versions first in production) */}
          <Route path="/about" element={<ExternalRedirect to="https://rezvo.app/about.html" />} />
          <Route path="/for-business" element={<ExternalRedirect to="https://rezvo.app/for-business" />} />
          <Route path="/contact" element={<ExternalRedirect to="https://rezvo.app/contact.html" />} />
          <Route path="/privacy" element={<ExternalRedirect to="https://rezvo.app/privacy.html" />} />
          <Route path="/terms" element={<ExternalRedirect to="https://rezvo.app/terms.html" />} />
          <Route path="/cookies" element={<ExternalRedirect to="https://rezvo.app/cookies.html" />} />

          {/* Public SEO pages */}
          <Route element={<PublicLayout />}>
            <Route path="/discover" element={<HomePage />} />
            <Route path="/results" element={<SearchResults />} />
            <Route path="/:category/:location/:slug" element={<BusinessListing />} />
            <Route path="/:category/:location" element={<CategoryHub />} />
            <Route path="/:category" element={<CategoryHub />} />
          </Route>

          {/* Consumer booking flow */}
          <Route path="/book/:businessSlug" element={<BookingFlow />} />
          <Route path="/book/:businessSlug/confirm/:bookingId" element={<BookingConfirmation />} />
          <Route path="/book/:businessSlug/manage/:bookingId" element={<BookingManage />} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </Router>
    <ChatWidget />
    </>
  )
}

export default App
