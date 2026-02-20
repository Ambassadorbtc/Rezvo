import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { TierProvider } from './contexts/TierContext'

import PublicLayout from './components/layout/PublicLayout'
import AppLayout from './components/layout/AppLayout'

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

import Onboarding from './pages/onboarding/Onboarding'

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <TierProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/:category/:location/:slug" element={<BusinessListing />} />
              <Route path="/:category/:location" element={<CategoryHub />} />
              <Route path="/:category" element={<CategoryHub />} />
            </Route>

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/onboarding" element={<Onboarding />} />

            <Route path="/dashboard" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="floor-plan" element={<FloorPlan />} />
              <Route path="staff" element={<Staff />} />
              <Route path="services" element={<Services />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </TierProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
