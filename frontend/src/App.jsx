import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { TierProvider } from './contexts/TierContext'
import { BusinessProvider } from './contexts/BusinessContext'

import PublicLayout from './components/layout/PublicLayout'
import DashboardLayout from './layouts/DashboardLayout'
import RedirectToMarketing from './components/RedirectToMarketing'
import { isRezvoApp } from './utils/domain'

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

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

import Dashboard from './pages/dashboard/Dashboard'
import Bookings from './pages/dashboard/Bookings'
import Calendar from './pages/dashboard/Calendar'
import FloorPlan from './pages/dashboard/FloorPlan'
import Staff from './pages/dashboard/Staff'
import Services from './pages/dashboard/Services'
import Reviews from './pages/dashboard/Reviews'
import Analytics from './pages/dashboard/Analytics'
import Settings from './pages/dashboard/Settings'
import BookingLink from './pages/dashboard/BookingLink'
import OnlineBooking from './pages/dashboard/OnlineBooking'
import Orders from './pages/dashboard/Orders'
import Clients from './pages/dashboard/Clients'
import Marketing from './pages/dashboard/Marketing'
import Payments from './pages/dashboard/Payments'
import Help from './pages/dashboard/Help'

import Onboarding from './pages/onboarding/Onboarding'
import BookingFlow from './pages/booking/BookingFlow'
import BookingConfirmation from './pages/booking/BookingConfirmation'
import BookingManage from './pages/booking/BookingManage'

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <TierProvider>
          <Routes>
            <Route path="/" element={isRezvoApp() ? <RedirectToMarketing /> : <DirectoryLanding />} />
            <Route path="/search" element={isRezvoApp() ? <RedirectToMarketing /> : <SearchPage />} />
            <Route path="/restaurant/:slug" element={isRezvoApp() ? <RedirectToMarketing /> : <ListingPage />} />
            <Route path="/venue/:slug" element={isRezvoApp() ? <RedirectToMarketing /> : <ListingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/faqs" element={isRezvoApp() ? <RedirectToMarketing /> : <FaqsPage />} />

            <Route element={<PublicLayout />}>
              <Route path="/old-home" element={<HomePage />} />
              <Route path="/old-search" element={<SearchResults />} />
              <Route path="/:category/:location/:slug" element={<BusinessListing />} />
              <Route path="/:category/:location" element={<CategoryHub />} />
              <Route path="/:category" element={<CategoryHub />} />
            </Route>

            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />

            <Route path="/onboarding" element={<Onboarding />} />

            {/* Run 2: Public booking flow — no auth */}
            <Route path="/book/:businessSlug" element={<BookingFlow />} />
            <Route path="/book/:businessSlug/confirm/:bookingId" element={<BookingConfirmation />} />
            <Route path="/book/:businessSlug/manage/:bookingId" element={<BookingManage />} />

            <Route path="/dashboard" element={
              <BusinessProvider>
                <DashboardLayout />
              </BusinessProvider>
            }>
              <Route index element={<Dashboard />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="booking-link" element={<BookingLink />} />
              <Route path="floor-plan" element={<FloorPlan />} />
              <Route path="staff" element={<Staff />} />
              <Route path="services" element={<Services />} />
              <Route path="online-booking" element={<OnlineBooking />} />
              <Route path="orders" element={<Orders />} />
              <Route path="clients" element={<Clients />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="payments" element={<Payments />} />
              <Route path="marketing" element={<Marketing />} />
              <Route path="settings" element={<Settings />} />
              <Route path="help" element={<Help />} />
            </Route>
          </Routes>
        </TierProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
