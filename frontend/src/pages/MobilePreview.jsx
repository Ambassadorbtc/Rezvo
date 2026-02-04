import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Home, Search, Calendar, User, LayoutDashboard, Settings, Scissors, Bell, Star, MapPin, Clock, Check } from 'lucide-react';

// Mobile App Preview Component - Shows the React Native app in a phone frame
const MobilePreview = () => {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [userType, setUserType] = useState('client'); // 'client' or 'business'
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const screens = userType === 'client' 
    ? ['welcome', 'login', 'home', 'search', 'business-detail', 'booking', 'bookings', 'profile']
    : ['welcome', 'login', 'dashboard', 'calendar', 'bookings-biz', 'services', 'settings'];

  const currentIndex = screens.indexOf(currentScreen);

  const nextScreen = () => {
    if (currentIndex < screens.length - 1) {
      setCurrentScreen(screens[currentIndex + 1]);
      if (screens[currentIndex + 1] !== 'welcome' && screens[currentIndex + 1] !== 'login') {
        setIsLoggedIn(true);
      }
    }
  };

  const prevScreen = () => {
    if (currentIndex > 0) {
      setCurrentScreen(screens[currentIndex - 1]);
    }
  };

  // Welcome Screen
  const WelcomeScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7]">
      <div className="h-[55%] relative rounded-b-3xl overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80" 
          alt="Salon"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>
      <div className="flex-1 px-6 pt-8 flex flex-col">
        <h1 className="text-2xl font-bold text-[#0A1626] text-center mb-2">
          Book Your Appointments Effortlessly
        </h1>
        <p className="text-sm text-[#627D98] text-center mb-6">
          Find skilled professionals near you and book with just a few taps.
        </p>
        <div className="flex justify-center gap-1 mb-6">
          <div className="w-6 h-2 rounded-full bg-[#00BFA5]" />
          <div className="w-2 h-2 rounded-full bg-[#00BFA5]/40" />
          <div className="w-2 h-2 rounded-full bg-[#00BFA5]/40" />
        </div>
        <button 
          onClick={nextScreen}
          className="w-full py-3 bg-[#00BFA5] text-white rounded-full font-semibold mb-3"
        >
          Get Started
        </button>
        <p className="text-center text-sm text-[#627D98]">
          Already have an account? <span className="text-[#00BFA5] font-semibold">Log in</span>
        </p>
        <div className="flex gap-2 mt-4">
          <button 
            onClick={() => { setUserType('client'); nextScreen(); }}
            className="flex-1 py-2 rounded-xl border border-[#E2E8F0] text-sm font-medium"
          >
            Book Appointments
          </button>
          <button 
            onClick={() => { setUserType('business'); nextScreen(); }}
            className="flex-1 py-2 rounded-xl bg-[#1A2B3C] text-white text-sm font-medium"
          >
            Manage Business
          </button>
        </div>
      </div>
    </div>
  );

  // Login Screen
  const LoginScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7] px-6 pt-4">
      <button onClick={prevScreen} className="w-10 h-10 flex items-center justify-center mb-4">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#00BFA5] flex items-center justify-center">
          <span className="text-white font-bold text-lg">R</span>
        </div>
        <span className="text-xl font-bold">Rezvo</span>
      </div>
      <h1 className="text-3xl font-bold text-[#0A1626] mb-1">Welcome back</h1>
      <p className="text-[#627D98] mb-6">Log in to {userType === 'client' ? 'book appointments' : 'manage your business'}</p>
      
      <div className="flex bg-[#F5F0E8] rounded-xl p-1 mb-6">
        <button 
          onClick={() => setUserType('client')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${userType === 'client' ? 'bg-white shadow' : ''}`}
        >
          Client
        </button>
        <button 
          onClick={() => setUserType('business')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${userType === 'business' ? 'bg-white shadow' : ''}`}
        >
          Business
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="text-sm font-semibold text-[#0A1626] mb-1 block">Email</label>
          <input 
            type="email" 
            placeholder="Enter your email"
            className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl bg-white"
            defaultValue="testuser@example.com"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-[#0A1626] mb-1 block">Password</label>
          <input 
            type="password" 
            placeholder="Enter your password"
            className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl bg-white"
            defaultValue="password123"
          />
        </div>
        <p className="text-right text-sm text-[#00BFA5] font-medium">Forgot password?</p>
      </div>

      <button 
        onClick={() => { setIsLoggedIn(true); nextScreen(); }}
        className="w-full py-3 bg-[#00BFA5] text-white rounded-full font-semibold"
      >
        Log in
      </button>
    </div>
  );

  // Client Home Screen
  const ClientHomeScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7]">
      <div className="px-4 pt-4 pb-2">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-[#627D98]">Good morning</p>
            <p className="text-xl font-bold">testuser</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
        </div>
        
        <div className="flex items-center bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 mb-4">
          <Search className="w-4 h-4 text-[#627D98] mr-2" />
          <input placeholder="Search services or businesses..." className="flex-1 text-sm bg-transparent outline-none" />
        </div>

        <div className="bg-[#00BFA5] rounded-2xl p-4 flex mb-4">
          <div className="flex-1">
            <p className="text-xl font-bold text-white">Get 20% Off</p>
            <p className="text-white/80 text-sm mb-2">Your first booking</p>
            <button className="bg-white text-[#00BFA5] text-sm font-semibold px-4 py-1.5 rounded-full">
              Book Now
            </button>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=150&q=80" 
            className="w-24 h-20 rounded-lg object-cover"
            alt="Promo"
          />
        </div>
      </div>

      <div className="px-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <p className="font-semibold">Popular Categories</p>
          <p className="text-sm text-[#00BFA5] font-medium">See All</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['✂️ Haircut', '💅 Nails', '💪 Fitness', '💄 Beauty', '💆 Massage'].map((cat, i) => (
            <div key={i} className="flex-shrink-0 w-16 bg-white rounded-xl py-2 px-1 text-center shadow-sm">
              <p className="text-lg">{cat.split(' ')[0]}</p>
              <p className="text-xs">{cat.split(' ')[1]}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 flex-1 overflow-auto">
        <div className="flex justify-between items-center mb-2">
          <p className="font-semibold">Top Rated</p>
          <p className="text-sm text-[#00BFA5] font-medium">See All</p>
        </div>
        {[
          { name: "Sarah's Hair Studio", desc: 'Professional hairdressing', rating: 4.9, price: '£25' },
          { name: 'FitLife PT', desc: 'Personal training sessions', rating: 4.8, price: '£50' },
        ].map((biz, i) => (
          <div key={i} onClick={nextScreen} className="flex bg-white rounded-xl shadow-sm mb-2 overflow-hidden cursor-pointer">
            <img 
              src={`https://images.unsplash.com/photo-${i === 0 ? '1560066984-138dadb4c035' : '1571019614242-c5c5dee9f50b'}?w=200&q=80`}
              className="w-20 h-20 object-cover"
              alt={biz.name}
            />
            <div className="flex-1 p-2">
              <p className="font-medium text-sm">{biz.name}</p>
              <p className="text-xs text-[#627D98]">{biz.desc}</p>
              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs ml-1 font-medium">{biz.rating}</span>
                </div>
                <span className="text-xs font-semibold text-[#00BFA5]">From {biz.price}</span>
              </div>
            </div>
            <div className="bg-[#00BFA5] px-3 flex items-center">
              <span className="text-white text-xs font-semibold">Book</span>
            </div>
          </div>
        ))}
      </div>

      <BottomNav active="home" />
    </div>
  );

  // Business Detail Screen
  const BusinessDetailScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7]">
      <div className="relative h-48">
        <img 
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80"
          className="w-full h-full object-cover"
          alt="Business"
        />
        <button onClick={prevScreen} className="absolute top-4 left-4 w-8 h-8 bg-white rounded-full flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 -mt-6 bg-white rounded-t-3xl px-4 pt-4 overflow-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold">Sarah's Hair Studio</h2>
            <p className="text-sm text-[#627D98]">Professional hairdressing in Manchester</p>
          </div>
          <div className="flex items-center bg-[#F5F0E8] px-2 py-1 rounded-lg">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-bold ml-1">4.9</span>
            <span className="text-xs text-[#627D98] ml-1">(127)</span>
          </div>
        </div>

        <p className="text-sm font-semibold mb-2">Services</p>
        {[
          { name: 'Classic Haircut', duration: '30 min', price: '£25.00' },
          { name: 'Haircut & Style', duration: '45 min', price: '£35.00' },
          { name: 'Hair Colouring', duration: '90 min', price: '£75.00' },
        ].map((service, i) => (
          <div key={i} className="flex items-center bg-[#FDFBF7] p-3 rounded-xl mb-2 border border-[#E2E8F0]">
            <div className="w-5 h-5 rounded-full border-2 border-[#E2E8F0] mr-3" />
            <div className="flex-1">
              <p className="font-medium text-sm">{service.name}</p>
              <p className="text-xs text-[#627D98]">{service.duration}</p>
            </div>
            <p className="font-semibold text-[#00BFA5]">{service.price}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border-t border-[#E2E8F0] px-4 py-3 flex items-center">
        <div className="flex-1">
          <p className="text-xs text-[#627D98]">Haircut & Style</p>
          <p className="text-xl font-bold">£35.00</p>
        </div>
        <button onClick={nextScreen} className="bg-[#00BFA5] text-white px-6 py-2.5 rounded-full font-semibold">
          Book Now
        </button>
      </div>
    </div>
  );

  // Booking Flow Screen
  const BookingScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7]">
      <div className="px-4 pt-4 pb-2 flex items-center">
        <button onClick={prevScreen} className="w-10 h-10 flex items-center justify-center">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="flex-1 text-center font-semibold">Book Appointment</h2>
        <div className="w-10" />
      </div>

      <div className="flex justify-center gap-6 py-2">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step <= 2 ? 'bg-[#00BFA5] text-white' : 'bg-[#F5F0E8] text-[#627D98]'}`}>
              {step}
            </div>
            <span className={`text-xs mt-1 ${step <= 2 ? 'text-[#00BFA5]' : 'text-[#627D98]'}`}>
              {step === 1 ? 'Date' : step === 2 ? 'Time' : 'Confirm'}
            </span>
          </div>
        ))}
      </div>

      <div className="flex-1 px-4 overflow-auto">
        <div className="bg-white rounded-xl p-3 shadow-sm mb-4">
          <p className="font-semibold">Haircut & Style</p>
          <p className="text-sm text-[#627D98]">45 min • £35.00</p>
        </div>

        <p className="font-semibold text-sm mb-2">Select Date</p>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
            <div key={i} className={`flex-shrink-0 w-14 py-2 rounded-xl text-center border ${i === 1 ? 'bg-[#00BFA5] border-[#00BFA5] text-white' : 'bg-white border-[#E2E8F0]'}`}>
              <p className="text-xs">{day}</p>
              <p className="text-lg font-bold">{10 + i}</p>
            </div>
          ))}
        </div>

        <p className="font-semibold text-sm mb-2">Select Time</p>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30'].map((time, i) => (
            <div key={i} className={`py-2 rounded-lg text-center text-sm border ${i === 2 ? 'bg-[#00BFA5] border-[#00BFA5] text-white font-semibold' : 'bg-white border-[#E2E8F0]'}`}>
              {time}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="font-semibold mb-3">Booking Summary</p>
          <div className="flex justify-between text-sm py-1 border-b border-[#F5F0E8]">
            <span className="text-[#627D98]">Service</span>
            <span>Haircut & Style</span>
          </div>
          <div className="flex justify-between text-sm py-1 border-b border-[#F5F0E8]">
            <span className="text-[#627D98]">Date & Time</span>
            <span>Tue 11 at 10:00</span>
          </div>
          <div className="flex justify-between py-2 mt-2">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold text-[#00BFA5]">£35.00</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 bg-white border-t border-[#E2E8F0]">
        <button onClick={nextScreen} className="w-full py-3 bg-[#00BFA5] text-white rounded-full font-semibold">
          Confirm Booking
        </button>
      </div>
    </div>
  );

  // Client Bookings Screen
  const ClientBookingsScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7]">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-xl font-bold mb-3">My Bookings</h2>
        <div className="flex gap-2">
          {['Upcoming', 'Past', 'Cancelled'].map((tab, i) => (
            <button key={i} className={`px-4 py-1.5 rounded-full text-sm font-medium ${i === 0 ? 'bg-[#1A2B3C] text-white' : 'bg-white'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 overflow-auto">
        {[
          { name: "Sarah's Hair Studio", service: 'Haircut & Style', date: 'Tue 11', time: '10:00', status: 'confirmed', price: '£35' },
          { name: 'FitLife PT', service: 'Personal Training', date: 'Thu 13', time: '14:00', status: 'pending', price: '£50' },
        ].map((booking, i) => (
          <div key={i} className="bg-white rounded-xl p-3 shadow-sm mb-3">
            <div className="flex">
              <div className="w-12 h-12 bg-[#00BFA5] rounded-xl flex flex-col items-center justify-center mr-3">
                <span className="text-white font-bold">{booking.date.split(' ')[1]}</span>
                <span className="text-white/80 text-xs">{booking.date.split(' ')[0]}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{booking.name}</p>
                <p className="text-xs text-[#627D98]">{booking.service}</p>
                <p className="text-xs font-medium">{booking.time}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-0.5 rounded ${booking.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                  {booking.status}
                </span>
                <p className="font-semibold mt-1">{booking.price}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-[#F5F0E8]">
              <button className="flex-1 py-1.5 bg-[#00BFA5] text-white rounded-lg text-sm font-medium">Reschedule</button>
              <button className="flex-1 py-1.5 border border-[#E2E8F0] rounded-lg text-sm font-medium text-[#627D98]">Cancel</button>
            </div>
          </div>
        ))}
      </div>

      <BottomNav active="bookings" />
    </div>
  );

  // Client Profile Screen
  const ClientProfileScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7]">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-xl font-bold mb-4">Profile</h2>
        
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#00BFA5] flex items-center justify-center mb-2">
            <span className="text-2xl font-bold text-white">T</span>
          </div>
          <p className="font-semibold">testuser</p>
          <p className="text-sm text-[#627D98]">testuser@example.com</p>
          <button className="mt-2 px-4 py-1.5 bg-[#F5F0E8] rounded-full text-sm font-medium">Edit Profile</button>
        </div>

        <div className="bg-[#1A2B3C] rounded-xl p-4 mb-4 flex items-center">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mr-3">
            <span className="text-lg">💼</span>
          </div>
          <div className="flex-1">
            <p className="text-white font-medium text-sm">Switch to Business Mode</p>
            <p className="text-white/70 text-xs">Manage your bookings</p>
          </div>
          <ChevronRight className="w-5 h-5 text-white/50" />
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {[
            { icon: '👤', label: 'Account Settings' },
            { icon: '🔔', label: 'Notifications' },
            { icon: '💳', label: 'Payment Methods' },
            { icon: '❤️', label: 'Favorites' },
            { icon: '❓', label: 'Help & Support' },
          ].map((item, i) => (
            <div key={i} className="flex items-center px-4 py-3 border-b border-[#F5F0E8] last:border-0">
              <div className="w-8 h-8 rounded-lg bg-[#F5F0E8] flex items-center justify-center mr-3">
                <span>{item.icon}</span>
              </div>
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-[#627D98]" />
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="profile" />
    </div>
  );

  // Business Dashboard Screen
  const BusinessDashboardScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7]">
      <div className="px-4 pt-4 pb-2">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-[#627D98]">Welcome back</p>
            <p className="text-xl font-bold">Test Business</p>
          </div>
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {[
            { label: 'Today', value: '3', sub: 'bookings', icon: '📅' },
            { label: 'This Week', value: '£420', sub: 'revenue', icon: '💷' },
            { label: 'Pending', value: '2', sub: 'confirm', icon: '⏳' },
          ].map((stat, i) => (
            <div key={i} className="flex-1 bg-white rounded-xl p-3 shadow-sm text-center">
              <span className="text-xl">{stat.icon}</span>
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-xs text-[#627D98]">{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#00BFA5] rounded-xl p-4 flex items-center mb-4">
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Share Your Booking Link</p>
            <p className="text-white/80 text-xs">Let clients book directly</p>
          </div>
          <button className="bg-white text-[#00BFA5] text-sm font-semibold px-4 py-1.5 rounded-full">
            Share
          </button>
        </div>

        <p className="font-semibold mb-2">Today's Schedule</p>
        {[
          { client: 'Emma Watson', service: 'Haircut & Style', time: '10:00', status: 'confirmed' },
          { client: 'John Smith', service: 'Beard Trim', time: '11:30', status: 'pending' },
          { client: 'Sarah Connor', service: 'Colouring', time: '14:00', status: 'confirmed' },
        ].map((booking, i) => (
          <div key={i} className="flex items-center bg-white rounded-xl p-2 shadow-sm mb-2">
            <div className="bg-[#F5F0E8] px-2 py-1 rounded-lg mr-3">
              <span className="text-sm font-semibold">{booking.time}</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{booking.client}</p>
              <p className="text-xs text-[#627D98]">{booking.service}</p>
            </div>
            <div className={`w-2 h-2 rounded-full ${booking.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
          </div>
        ))}
      </div>

      <BusinessBottomNav active="dashboard" />
    </div>
  );

  // Business Calendar Screen
  const BusinessCalendarScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7]">
      <div className="px-4 pt-4 pb-2 flex justify-between items-center">
        <h2 className="text-xl font-bold">Calendar</h2>
        <div className="flex bg-[#F5F0E8] rounded-lg p-1">
          <button className="px-3 py-1 bg-white rounded text-sm font-medium shadow-sm">Week</button>
          <button className="px-3 py-1 text-sm font-medium text-[#627D98]">Day</button>
        </div>
      </div>

      <div className="px-4 flex items-center justify-center gap-4 py-2">
        <ChevronLeft className="w-5 h-5 text-[#627D98]" />
        <span className="font-semibold">February 2026</span>
        <ChevronRight className="w-5 h-5 text-[#627D98]" />
      </div>

      <div className="flex px-2 py-2 border-b border-[#E2E8F0]">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
          <div key={i} className="flex-1 text-center">
            <p className="text-xs text-[#627D98]">{day}</p>
            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${i === 2 ? 'bg-[#00BFA5] text-white' : ''}`}>
              <span className="text-sm font-semibold">{9 + i}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 flex overflow-auto">
        <div className="w-12 flex-shrink-0">
          {[9, 10, 11, 12, 13, 14, 15, 16, 17].map((hour) => (
            <div key={hour} className="h-12 text-right pr-2 text-xs text-[#627D98]">
              {hour}:00
            </div>
          ))}
        </div>
        <div className="flex-1 relative">
          <div className="absolute top-3 left-[14%] w-[13%] bg-[#00BFA5] rounded p-1" style={{ height: '48px' }}>
            <p className="text-white text-xs font-semibold truncate">Emma</p>
            <p className="text-white/80 text-[10px] truncate">Haircut</p>
          </div>
          <div className="absolute top-[108px] left-[28%] w-[13%] bg-[#00BFA5] rounded p-1" style={{ height: '96px' }}>
            <p className="text-white text-xs font-semibold truncate">Sarah</p>
            <p className="text-white/80 text-[10px] truncate">Colour</p>
          </div>
        </div>
      </div>

      <button className="absolute bottom-24 right-4 w-12 h-12 bg-[#00BFA5] rounded-full shadow-lg flex items-center justify-center">
        <span className="text-white text-2xl">+</span>
      </button>

      <BusinessBottomNav active="calendar" />
    </div>
  );

  // Business Bookings Screen
  const BusinessBookingsScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7]">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-xl font-bold mb-3">Bookings</h2>
        <div className="flex gap-2">
          {['Upcoming', 'Pending', 'Past'].map((tab, i) => (
            <button key={i} className={`px-4 py-1.5 rounded-full text-sm font-medium ${i === 0 ? 'bg-[#1A2B3C] text-white' : 'bg-white'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 overflow-auto">
        {[
          { client: 'Emma Watson', service: 'Haircut & Style', date: '11', month: 'Feb', time: '10:00', status: 'confirmed', price: '£35' },
          { client: 'John Smith', service: 'Beard Trim', date: '11', month: 'Feb', time: '11:30', status: 'pending', price: '£15' },
          { client: 'Sarah Connor', service: 'Hair Colouring', date: '12', month: 'Feb', time: '14:00', status: 'confirmed', price: '£75' },
        ].map((booking, i) => (
          <div key={i} className="bg-white rounded-xl p-3 shadow-sm mb-3 flex items-center">
            <div className="w-12 h-12 bg-[#00BFA5] rounded-xl flex flex-col items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">{booking.date}</span>
              <span className="text-white/80 text-[10px]">{booking.month}</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{booking.client}</p>
              <p className="text-xs text-[#627D98]">{booking.service}</p>
              <p className="text-xs font-medium">{booking.time}</p>
            </div>
            <div className="text-right">
              <span className={`text-xs px-2 py-0.5 rounded ${booking.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                {booking.status}
              </span>
              <p className="font-semibold mt-1">{booking.price}</p>
            </div>
          </div>
        ))}
      </div>

      <BusinessBottomNav active="bookings" />
    </div>
  );

  // Business Services Screen
  const BusinessServicesScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7]">
      <div className="px-4 pt-4 pb-2 flex justify-between items-center">
        <h2 className="text-xl font-bold">Services</h2>
        <button className="bg-[#00BFA5] text-white text-sm font-semibold px-4 py-1.5 rounded-full">
          + Add
        </button>
      </div>

      <div className="flex-1 px-4 pt-2 overflow-auto">
        {[
          { name: 'Classic Haircut', duration: '30 min', price: '£25.00', deposit: false },
          { name: 'Haircut & Style', duration: '45 min', price: '£35.00', deposit: true, depositAmount: '£10' },
          { name: 'Hair Colouring', duration: '90 min', price: '£75.00', deposit: true, depositAmount: '£25' },
          { name: 'Beard Trim', duration: '20 min', price: '£15.00', deposit: false },
        ].map((service, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm mb-3">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-xl bg-[#00BFA5]/10 flex items-center justify-center mr-3">
                <Scissors className="w-6 h-6 text-[#00BFA5]" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{service.name}</p>
                <p className="text-sm text-[#627D98]">{service.duration}</p>
              </div>
              <p className="text-lg font-bold text-[#00BFA5]">{service.price}</p>
            </div>
            {service.deposit && (
              <div className="mt-2 bg-yellow-50 text-yellow-700 text-xs px-3 py-1.5 rounded-lg">
                Deposit required: {service.depositAmount}
              </div>
            )}
            <div className="flex gap-2 mt-3 pt-3 border-t border-[#F5F0E8]">
              <button className="flex-1 py-1.5 bg-[#F5F0E8] rounded-lg text-sm font-medium">Edit</button>
              <button className="flex-1 py-1.5 bg-red-50 text-red-500 rounded-lg text-sm font-medium">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <BusinessBottomNav active="services" />
    </div>
  );

  // Business Settings Screen
  const BusinessSettingsScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7]">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-xl font-bold mb-4">Settings</h2>
        
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4 flex items-center">
          <div className="w-14 h-14 rounded-2xl bg-[#00BFA5] flex items-center justify-center mr-3">
            <span className="text-xl font-bold text-white">T</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold">Test Business</p>
            <p className="text-sm text-[#627D98]">testuser@example.com</p>
          </div>
          <button className="w-8 h-8 bg-[#F5F0E8] rounded-full flex items-center justify-center">
            <span className="text-sm">✏️</span>
          </button>
        </div>

        <div className="bg-[#1A2B3C] rounded-xl p-4 mb-4 flex items-center">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mr-3">
            <span className="text-lg">📱</span>
          </div>
          <div className="flex-1">
            <p className="text-white font-medium text-sm">Switch to Client Mode</p>
            <p className="text-white/70 text-xs">Book appointments as customer</p>
          </div>
          <ChevronRight className="w-5 h-5 text-white/50" />
        </div>

        <p className="text-xs font-semibold text-[#627D98] uppercase tracking-wide mb-2 ml-1">Business</p>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
          {[
            { icon: '🏪', label: 'Business Profile' },
            { icon: '⏰', label: 'Availability' },
            { icon: '💳', label: 'Payment Setup' },
          ].map((item, i) => (
            <div key={i} className="flex items-center px-4 py-3 border-b border-[#F5F0E8] last:border-0">
              <div className="w-8 h-8 rounded-lg bg-[#F5F0E8] flex items-center justify-center mr-3">
                <span>{item.icon}</span>
              </div>
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-[#627D98]" />
            </div>
          ))}
        </div>

        <button className="w-full py-3 border border-red-500 text-red-500 rounded-xl font-semibold">
          Log out
        </button>
      </div>

      <BusinessBottomNav active="settings" />
    </div>
  );

  // Bottom Navigation for Client
  const BottomNav = ({ active }) => (
    <div className="bg-white border-t border-[#E2E8F0] px-4 py-2 flex justify-around">
      {[
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'search', icon: Search, label: 'Search' },
        { id: 'bookings', icon: Calendar, label: 'Bookings' },
        { id: 'profile', icon: User, label: 'Profile' },
      ].map(({ id, icon: Icon, label }) => (
        <button 
          key={id} 
          onClick={() => setCurrentScreen(id)}
          className={`flex flex-col items-center py-1 ${active === id ? 'text-[#00BFA5]' : 'text-[#627D98]'}`}
        >
          <Icon className="w-5 h-5" />
          <span className="text-xs mt-0.5">{label}</span>
        </button>
      ))}
    </div>
  );

  // Bottom Navigation for Business
  const BusinessBottomNav = ({ active }) => (
    <div className="bg-white border-t border-[#E2E8F0] px-2 py-2 flex justify-around">
      {[
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'calendar', icon: Calendar, label: 'Calendar' },
        { id: 'bookings', icon: Calendar, label: 'Bookings' },
        { id: 'services', icon: Scissors, label: 'Services' },
        { id: 'settings', icon: Settings, label: 'Settings' },
      ].map(({ id, icon: Icon, label }) => (
        <button 
          key={id} 
          onClick={() => setCurrentScreen(id === 'bookings' ? 'bookings-biz' : id)}
          className={`flex flex-col items-center py-1 ${active === id ? 'text-[#00BFA5]' : 'text-[#627D98]'}`}
        >
          <Icon className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{label}</span>
        </button>
      ))}
    </div>
  );

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome': return <WelcomeScreen />;
      case 'login': return <LoginScreen />;
      case 'home': return <ClientHomeScreen />;
      case 'search': return <ClientHomeScreen />;
      case 'business-detail': return <BusinessDetailScreen />;
      case 'booking': return <BookingScreen />;
      case 'bookings': return <ClientBookingsScreen />;
      case 'profile': return <ClientProfileScreen />;
      case 'dashboard': return <BusinessDashboardScreen />;
      case 'calendar': return <BusinessCalendarScreen />;
      case 'bookings-biz': return <BusinessBookingsScreen />;
      case 'services': return <BusinessServicesScreen />;
      case 'settings': return <BusinessSettingsScreen />;
      default: return <WelcomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#0A1626] font-display">Rezvo Mobile App Preview</h1>
          <p className="text-[#627D98] mt-1">Interactive preview of the React Native mobile app</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
          {/* Phone Frame */}
          <div className="relative">
            {/* iPhone Frame */}
            <div className="w-[300px] h-[620px] bg-black rounded-[40px] p-2 shadow-2xl">
              {/* Screen */}
              <div className="w-full h-full bg-white rounded-[32px] overflow-hidden relative">
                {/* Status Bar */}
                <div className="absolute top-0 left-0 right-0 h-8 bg-[#FDFBF7] flex items-center justify-between px-6 z-10">
                  <span className="text-xs font-medium">9:41</span>
                  <div className="flex gap-1">
                    <div className="w-4 h-2 bg-black rounded-sm" />
                    <div className="w-4 h-2 bg-black rounded-sm" />
                    <div className="w-6 h-3 border border-black rounded-sm">
                      <div className="w-4 h-full bg-black rounded-sm" />
                    </div>
                  </div>
                </div>
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-20" />
                
                {/* App Content */}
                <div className="h-full pt-8">
                  {renderScreen()}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-2xl p-6 shadow-lg w-full lg:w-80">
            <h3 className="font-bold text-lg mb-4">Navigation</h3>
            
            <div className="mb-4">
              <p className="text-sm text-[#627D98] mb-2">User Type</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setUserType('client'); setCurrentScreen('welcome'); setIsLoggedIn(false); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${userType === 'client' ? 'bg-[#00BFA5] text-white' : 'bg-[#F5F0E8]'}`}
                >
                  Client App
                </button>
                <button 
                  onClick={() => { setUserType('business'); setCurrentScreen('welcome'); setIsLoggedIn(false); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${userType === 'business' ? 'bg-[#00BFA5] text-white' : 'bg-[#F5F0E8]'}`}
                >
                  Business App
                </button>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-[#627D98] mb-2">Current Screen</p>
              <p className="font-semibold text-[#00BFA5] capitalize">{currentScreen.replace('-', ' ')}</p>
            </div>

            <div className="flex gap-2 mb-4">
              <button 
                onClick={prevScreen}
                disabled={currentIndex === 0}
                className="flex-1 py-2 bg-[#F5F0E8] rounded-lg text-sm font-medium disabled:opacity-50"
              >
                ← Previous
              </button>
              <button 
                onClick={nextScreen}
                disabled={currentIndex === screens.length - 1}
                className="flex-1 py-2 bg-[#00BFA5] text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                Next →
              </button>
            </div>

            <div className="border-t border-[#E2E8F0] pt-4">
              <p className="text-sm text-[#627D98] mb-2">Quick Jump</p>
              <div className="flex flex-wrap gap-1">
                {screens.map((screen) => (
                  <button
                    key={screen}
                    onClick={() => setCurrentScreen(screen)}
                    className={`px-2 py-1 text-xs rounded ${currentScreen === screen ? 'bg-[#00BFA5] text-white' : 'bg-[#F5F0E8]'}`}
                  >
                    {screen.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-[#E2E8F0] pt-4 mt-4">
              <p className="text-sm font-semibold mb-2">Test Credentials</p>
              <div className="bg-[#F5F0E8] rounded-lg p-3 text-sm">
                <p><span className="text-[#627D98]">Email:</span> testuser@example.com</p>
                <p><span className="text-[#627D98]">Password:</span> password123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobilePreview;
