/**
 * Rezvo Directory — rezvo.co.uk
 * Consumer-facing: search, discover, and book local businesses
 */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'

import PublicLayout from './components/layout/PublicLayout'

import DirectoryLanding from './pages/directory/DirectoryLanding'
import SearchPage from './pages/directory/SearchPage'
import ListingPage from './pages/directory/ListingPage'
import LoginPage from './pages/directory/LoginPage'
import SignupPage from './pages/directory/SignupPage'
import FaqsPage from './pages/directory/FaqsPage'

import HomePage from './pages/public/HomePage'
import SearchResults from './pages/public/SearchResults'
import BusinessListing from './pages/public/BusinessListing'
import CategoryHub from './pages/public/CategoryHub'

import BookingFlow from './pages/booking/BookingFlow'
import BookingConfirmation from './pages/booking/BookingConfirmation'
import BookingManage from './pages/booking/BookingManage'

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Directory */}
          <Route path="/" element={<DirectoryLanding />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/restaurant/:slug" element={<ListingPage />} />
          <Route path="/venue/:slug" element={<ListingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/faqs" element={<FaqsPage />} />

          {/* Public SEO pages */}
          <Route element={<PublicLayout />}>
            <Route path="/discover" element={<HomePage />} />
            <Route path="/results" element={<SearchResults />} />
            <Route path="/:category/:location/:slug" element={<BusinessListing />} />
            <Route path="/:category/:location" element={<CategoryHub />} />
            <Route path="/:category" element={<CategoryHub />} />
          </Route>

          {/* Consumer booking flow — no auth required */}
          <Route path="/book/:businessSlug" element={<BookingFlow />} />
          <Route path="/book/:businessSlug/confirm/:bookingId" element={<BookingConfirmation />} />
          <Route path="/book/:businessSlug/manage/:bookingId" element={<BookingManage />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
