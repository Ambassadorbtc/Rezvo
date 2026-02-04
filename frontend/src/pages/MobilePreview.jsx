import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Home, Search, Calendar, User, LayoutDashboard, Settings, Scissors, Bell, Star, MapPin, Clock, Check, Smartphone, X, Menu, Share2, QrCode, BarChart3, Users, CreditCard, MessageSquare, HelpCircle, LogOut, Plus, Filter, MoreVertical } from 'lucide-react';

// Full Interactive Mobile App Simulator
const MobilePreview = () => {
  const [userType, setUserType] = useState('client'); // 'client' or 'business'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [email, setEmail] = useState('testuser@example.com');
  const [password, setPassword] = useState('password123');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Show toast notification
  const toast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  // Handle login
  const handleLogin = () => {
    if (email && password) {
      setIsLoggedIn(true);
      setCurrentScreen(userType === 'client' ? 'home' : 'dashboard');
      toast('Welcome back! 👋');
    }
  };

  // Handle booking confirmation
  const handleBooking = () => {
    toast('Booking confirmed! 🎉');
    setTimeout(() => setCurrentScreen('bookings'), 1500);
  };

  // Navigate with animation
  const navigate = (screen) => {
    setCurrentScreen(screen);
  };

  // ==================== SCREENS ====================

  // Welcome Screen
  const WelcomeScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7]">
      <div className="h-[50%] relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80" 
          alt="Salon"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FDFBF7]" />
      </div>
      <div className="flex-1 px-5 -mt-8 relative z-10 flex flex-col">
        <div className="flex justify-center gap-1.5 mb-4">
          <div className="w-8 h-2 rounded-full bg-[#00BFA5]" />
          <div className="w-2 h-2 rounded-full bg-[#00BFA5]/30" />
          <div className="w-2 h-2 rounded-full bg-[#00BFA5]/30" />
        </div>
        <h1 className="text-2xl font-bold text-[#0A1626] text-center leading-tight">
          Book Your Appointments<br/>Effortlessly
        </h1>
        <p className="text-sm text-[#627D98] text-center mt-2 mb-5">
          Find skilled professionals near you and book with just a few taps.
        </p>
        <button 
          onClick={() => navigate('login')}
          className="w-full py-3.5 bg-[#00BFA5] text-white rounded-full font-semibold text-base shadow-lg shadow-[#00BFA5]/30 active:scale-[0.98] transition-transform"
        >
          Get Started
        </button>
        <p className="text-center text-sm text-[#627D98] mt-3">
          Already have an account? <button onClick={() => navigate('login')} className="text-[#00BFA5] font-semibold">Log in</button>
        </p>
        <div className="flex gap-2 mt-4">
          <button 
            onClick={() => { setUserType('client'); navigate('login'); }}
            className="flex-1 py-2.5 rounded-xl border-2 border-[#E2E8F0] text-sm font-semibold text-[#0A1626] active:bg-[#F5F0E8] transition-colors"
          >
            📱 Book Services
          </button>
          <button 
            onClick={() => { setUserType('business'); navigate('login'); }}
            className="flex-1 py-2.5 rounded-xl bg-[#1A2B3C] text-white text-sm font-semibold active:bg-[#0A1626] transition-colors"
          >
            💼 For Business
          </button>
        </div>
      </div>
    </div>
  );

  // Login Screen
  const LoginScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7] px-5 pt-3">
      <button onClick={() => navigate('welcome')} className="w-10 h-10 flex items-center justify-center -ml-2 mb-2">
        <ChevronLeft className="w-6 h-6 text-[#0A1626]" />
      </button>
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-11 h-11 rounded-xl bg-[#00BFA5] flex items-center justify-center shadow-lg shadow-[#00BFA5]/30">
          <span className="text-white font-bold text-xl">R</span>
        </div>
        <span className="text-2xl font-bold text-[#0A1626]">Rezvo</span>
      </div>
      <h1 className="text-3xl font-bold text-[#0A1626] mb-1">Welcome back</h1>
      <p className="text-[#627D98] mb-5">
        {userType === 'client' ? 'Book your next appointment' : 'Manage your business'}
      </p>
      
      <div className="flex bg-[#F5F0E8] rounded-xl p-1 mb-5">
        <button 
          onClick={() => setUserType('client')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${userType === 'client' ? 'bg-white shadow-md text-[#0A1626]' : 'text-[#627D98]'}`}
        >
          Client
        </button>
        <button 
          onClick={() => setUserType('business')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${userType === 'business' ? 'bg-white shadow-md text-[#0A1626]' : 'text-[#627D98]'}`}
        >
          Business
        </button>
      </div>

      <div className="space-y-4 mb-5">
        <div>
          <label className="text-sm font-semibold text-[#0A1626] mb-1.5 block">Email</label>
          <input 
            type="email" 
            placeholder="Enter your email"
            className="w-full px-4 py-3.5 border-2 border-[#E2E8F0] rounded-xl bg-white text-[#0A1626] placeholder:text-[#9FB3C8] focus:border-[#00BFA5] focus:outline-none transition-colors"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-[#0A1626] mb-1.5 block">Password</label>
          <input 
            type="password" 
            placeholder="Enter your password"
            className="w-full px-4 py-3.5 border-2 border-[#E2E8F0] rounded-xl bg-white text-[#0A1626] placeholder:text-[#9FB3C8] focus:border-[#00BFA5] focus:outline-none transition-colors"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="text-sm text-[#00BFA5] font-semibold self-end">Forgot password?</button>
      </div>

      <button 
        onClick={handleLogin}
        className="w-full py-3.5 bg-[#00BFA5] text-white rounded-full font-semibold text-base shadow-lg shadow-[#00BFA5]/30 active:scale-[0.98] transition-transform"
      >
        Log in
      </button>
      <p className="text-center text-sm text-[#627D98] mt-4">
        Don't have an account? <button className="text-[#00BFA5] font-semibold">Sign up</button>
      </p>
    </div>
  );

  // Client Home Screen
  const ClientHomeScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7]">
      <div className="px-4 pt-3 pb-2">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-sm text-[#627D98]">Good morning</p>
            <p className="text-xl font-bold text-[#0A1626]">{email.split('@')[0]} 👋</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center active:scale-95 transition-transform">
            <Bell className="w-5 h-5 text-[#0A1626]" />
          </button>
        </div>
        
        <div className="flex items-center bg-white border-2 border-[#E2E8F0] rounded-xl px-3 py-2.5 mb-3">
          <Search className="w-5 h-5 text-[#9FB3C8] mr-2" />
          <input placeholder="Search services or businesses..." className="flex-1 text-sm bg-transparent outline-none text-[#0A1626] placeholder:text-[#9FB3C8]" />
        </div>

        <div className="bg-gradient-to-r from-[#00BFA5] to-[#00A896] rounded-2xl p-4 flex mb-3 overflow-hidden relative">
          <div className="flex-1 z-10">
            <p className="text-xl font-bold text-white">Get 20% Off</p>
            <p className="text-white/80 text-sm mb-2">Your first booking</p>
            <button className="bg-white text-[#00BFA5] text-sm font-semibold px-4 py-1.5 rounded-full shadow-md active:scale-95 transition-transform">
              Book Now
            </button>
          </div>
          <div className="absolute right-0 top-0 w-28 h-full opacity-80">
            <img src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=200&q=80" className="w-full h-full object-cover" alt="" />
          </div>
        </div>
      </div>

      <div className="px-4 mb-3">
        <div className="flex justify-between items-center mb-2">
          <p className="font-semibold text-[#0A1626]">Popular Categories</p>
          <button className="text-sm text-[#00BFA5] font-semibold">See All</button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {[
            { icon: '✂️', name: 'Haircut' },
            { icon: '💅', name: 'Nails' },
            { icon: '💪', name: 'Fitness' },
            { icon: '💄', name: 'Beauty' },
            { icon: '💆', name: 'Massage' },
          ].map((cat, i) => (
            <button key={i} className="flex-shrink-0 w-16 bg-white rounded-xl py-2.5 px-1 text-center shadow-sm border border-[#E2E8F0] active:scale-95 transition-transform">
              <p className="text-xl mb-0.5">{cat.icon}</p>
              <p className="text-xs font-medium text-[#0A1626]">{cat.name}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 overflow-auto">
        <div className="flex justify-between items-center mb-2">
          <p className="font-semibold text-[#0A1626]">Top Rated</p>
          <button className="text-sm text-[#00BFA5] font-semibold">See All</button>
        </div>
        {[
          { name: "Sarah's Hair Studio", desc: 'Professional hairdressing', rating: 4.9, price: 25, img: '1560066984-138dadb4c035' },
          { name: 'FitLife PT', desc: 'Personal training sessions', rating: 4.8, price: 50, img: '1571019614242-c5c5dee9f50b' },
          { name: 'Glamour Nails', desc: 'Nail art & treatments', rating: 5.0, price: 30, img: '1604654894610-df63bc536371' },
        ].map((biz, i) => (
          <button 
            key={i} 
            onClick={() => { setSelectedService(biz); navigate('business-detail'); }}
            className="flex bg-white rounded-xl shadow-sm mb-2.5 overflow-hidden w-full text-left active:scale-[0.99] transition-transform border border-[#E2E8F0]"
          >
            <img src={`https://images.unsplash.com/photo-${biz.img}?w=200&q=80`} className="w-20 h-20 object-cover" alt={biz.name} />
            <div className="flex-1 p-2.5 flex flex-col justify-center">
              <p className="font-semibold text-sm text-[#0A1626]">{biz.name}</p>
              <p className="text-xs text-[#627D98] mb-1">{biz.desc}</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-semibold text-[#0A1626]">{biz.rating}</span>
                </div>
                <span className="text-xs font-bold text-[#00BFA5]">From £{biz.price}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <ClientBottomNav active="home" navigate={navigate} />
    </div>
  );

  // Business Detail Screen
  const BusinessDetailScreen = () => {
    const services = [
      { id: 1, name: 'Classic Haircut', duration: 30, price: 25 },
      { id: 2, name: 'Haircut & Style', duration: 45, price: 35 },
      { id: 3, name: 'Hair Colouring', duration: 90, price: 75 },
      { id: 4, name: 'Beard Trim', duration: 20, price: 15 },
    ];

    return (
      <div className="h-full flex flex-col bg-[#FDFBF7]">
        <div className="relative h-44">
          <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80" className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
          <button onClick={() => navigate('home')} className="absolute top-3 left-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
            <ChevronLeft className="w-5 h-5 text-[#0A1626]" />
          </button>
          <button className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-lg">♡</span>
          </button>
        </div>
        
        <div className="flex-1 -mt-5 bg-[#FDFBF7] rounded-t-3xl px-4 pt-4 overflow-auto">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h2 className="text-xl font-bold text-[#0A1626]">Sarah's Hair Studio</h2>
              <p className="text-sm text-[#627D98]">Professional hairdressing in Manchester</p>
            </div>
            <div className="flex items-center bg-[#F5F0E8] px-2.5 py-1.5 rounded-lg gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-[#0A1626]">4.9</span>
            </div>
          </div>

          <p className="text-sm font-semibold text-[#0A1626] mb-2">Select Service</p>
          <div className="space-y-2 mb-4">
            {services.map((service) => (
              <button 
                key={service.id}
                onClick={() => setSelectedService(service)}
                className={`flex items-center w-full p-3 rounded-xl border-2 transition-all ${selectedService?.id === service.id ? 'border-[#00BFA5] bg-[#00BFA5]/5' : 'border-[#E2E8F0] bg-white'}`}
              >
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${selectedService?.id === service.id ? 'border-[#00BFA5] bg-[#00BFA5]' : 'border-[#E2E8F0]'}`}>
                  {selectedService?.id === service.id && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm text-[#0A1626]">{service.name}</p>
                  <p className="text-xs text-[#627D98]">{service.duration} min</p>
                </div>
                <p className="font-bold text-[#00BFA5]">£{service.price}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border-t-2 border-[#E2E8F0] px-4 py-3 flex items-center gap-3">
          <div className="flex-1">
            {selectedService && (
              <>
                <p className="text-xs text-[#627D98]">{selectedService.name}</p>
                <p className="text-xl font-bold text-[#0A1626]">£{selectedService.price}</p>
              </>
            )}
          </div>
          <button 
            onClick={() => selectedService && navigate('booking')}
            disabled={!selectedService}
            className={`px-6 py-3 rounded-full font-semibold transition-all ${selectedService ? 'bg-[#00BFA5] text-white shadow-lg shadow-[#00BFA5]/30 active:scale-95' : 'bg-[#E2E8F0] text-[#9FB3C8]'}`}
          >
            Book Now
          </button>
        </div>
      </div>
    );
  };

  // Booking Flow Screen
  const BookingScreen = () => {
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return d;
    });
    const times = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30'];

    return (
      <div className="h-full flex flex-col bg-[#FDFBF7]">
        <div className="px-4 pt-3 pb-2 flex items-center">
          <button onClick={() => navigate('business-detail')} className="w-10 h-10 flex items-center justify-center -ml-2">
            <ChevronLeft className="w-6 h-6 text-[#0A1626]" />
          </button>
          <h2 className="flex-1 text-center font-bold text-lg text-[#0A1626]">Book Appointment</h2>
          <div className="w-10" />
        </div>

        <div className="flex justify-center gap-8 py-3 border-b border-[#E2E8F0]">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                (step === 1 && selectedDate) || (step === 2 && selectedTime) || step === 3 
                  ? 'bg-[#00BFA5] text-white' 
                  : step === 1 || (step === 2 && selectedDate)
                    ? 'bg-[#00BFA5] text-white'
                    : 'bg-[#E2E8F0] text-[#627D98]'
              }`}>
                {step}
              </div>
              <span className="text-xs mt-1 text-[#627D98]">
                {step === 1 ? 'Date' : step === 2 ? 'Time' : 'Confirm'}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1 px-4 pt-4 overflow-auto">
          <div className="bg-white rounded-xl p-3 shadow-sm border border-[#E2E8F0] mb-4">
            <p className="font-semibold text-[#0A1626]">{selectedService?.name || 'Service'}</p>
            <p className="text-sm text-[#627D98]">{selectedService?.duration} min • £{selectedService?.price}</p>
          </div>

          <p className="font-semibold text-sm text-[#0A1626] mb-2">Select Date</p>
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4">
            {dates.map((date, i) => (
              <button
                key={i}
                onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 w-14 py-2.5 rounded-xl text-center transition-all ${
                  selectedDate?.toDateString() === date.toDateString()
                    ? 'bg-[#00BFA5] text-white shadow-lg shadow-[#00BFA5]/30'
                    : 'bg-white border-2 border-[#E2E8F0]'
                }`}
              >
                <p className={`text-xs ${selectedDate?.toDateString() === date.toDateString() ? 'text-white/80' : 'text-[#627D98]'}`}>
                  {date.toLocaleDateString('en-GB', { weekday: 'short' })}
                </p>
                <p className="text-lg font-bold">{date.getDate()}</p>
              </button>
            ))}
          </div>

          {selectedDate && (
            <>
              <p className="font-semibold text-sm text-[#0A1626] mb-2">Select Time</p>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {times.map((time, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2.5 rounded-lg text-center text-sm font-medium transition-all ${
                      selectedTime === time
                        ? 'bg-[#00BFA5] text-white shadow-lg shadow-[#00BFA5]/30'
                        : 'bg-white border-2 border-[#E2E8F0] text-[#0A1626]'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </>
          )}

          {selectedDate && selectedTime && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-[#E2E8F0]">
              <p className="font-semibold text-[#0A1626] mb-3">Booking Summary</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1.5 border-b border-[#F5F0E8]">
                  <span className="text-[#627D98]">Service</span>
                  <span className="font-medium text-[#0A1626]">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#F5F0E8]">
                  <span className="text-[#627D98]">Date & Time</span>
                  <span className="font-medium text-[#0A1626]">
                    {selectedDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} at {selectedTime}
                  </span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-semibold text-[#0A1626]">Total</span>
                  <span className="text-xl font-bold text-[#00BFA5]">£{selectedService?.price}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-3 bg-white border-t-2 border-[#E2E8F0]">
          <button 
            onClick={handleBooking}
            disabled={!selectedDate || !selectedTime}
            className={`w-full py-3.5 rounded-full font-semibold transition-all ${
              selectedDate && selectedTime
                ? 'bg-[#00BFA5] text-white shadow-lg shadow-[#00BFA5]/30 active:scale-[0.98]'
                : 'bg-[#E2E8F0] text-[#9FB3C8]'
            }`}
          >
            Confirm Booking
          </button>
        </div>
      </div>
    );
  };

  // Client Bookings Screen
  const ClientBookingsScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7]">
      <div className="px-4 pt-3 pb-2">
        <h2 className="text-xl font-bold text-[#0A1626] mb-3">My Bookings</h2>
        <div className="flex gap-2">
          {['Upcoming', 'Past', 'Cancelled'].map((tab, i) => (
            <button key={i} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${i === 0 ? 'bg-[#1A2B3C] text-white' : 'bg-white text-[#627D98] border border-[#E2E8F0]'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 pt-3 overflow-auto">
        {[
          { name: "Sarah's Hair Studio", service: 'Haircut & Style', day: 11, month: 'Feb', time: '10:00', status: 'confirmed', price: 35 },
          { name: 'FitLife PT', service: 'Personal Training', day: 13, month: 'Feb', time: '14:00', status: 'pending', price: 50 },
        ].map((booking, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm mb-3 border border-[#E2E8F0]">
            <div className="flex">
              <div className="w-14 h-14 bg-[#00BFA5] rounded-xl flex flex-col items-center justify-center mr-3 shadow-lg shadow-[#00BFA5]/20">
                <span className="text-white font-bold text-lg">{booking.day}</span>
                <span className="text-white/80 text-xs">{booking.month}</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#0A1626]">{booking.name}</p>
                <p className="text-sm text-[#627D98]">{booking.service}</p>
                <p className="text-sm font-medium text-[#0A1626]">{booking.time}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${booking.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                  {booking.status}
                </span>
                <p className="font-bold text-[#0A1626] mt-2">£{booking.price}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ClientBottomNav active="bookings" navigate={navigate} />
    </div>
  );

  // Client Profile Screen
  const ClientProfileScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7]">
      <div className="px-4 pt-3">
        <h2 className="text-xl font-bold text-[#0A1626] mb-4">Profile</h2>
        
        <div className="bg-white rounded-xl p-5 shadow-sm mb-4 flex flex-col items-center border border-[#E2E8F0]">
          <div className="w-20 h-20 rounded-full bg-[#00BFA5] flex items-center justify-center mb-3 shadow-lg shadow-[#00BFA5]/30">
            <span className="text-3xl font-bold text-white">{email[0].toUpperCase()}</span>
          </div>
          <p className="font-bold text-lg text-[#0A1626]">{email.split('@')[0]}</p>
          <p className="text-sm text-[#627D98]">{email}</p>
          <button className="mt-3 px-5 py-2 bg-[#F5F0E8] rounded-full text-sm font-semibold text-[#0A1626]">Edit Profile</button>
        </div>

        <button 
          onClick={() => { setUserType('business'); setCurrentScreen('dashboard'); }}
          className="w-full bg-[#1A2B3C] rounded-xl p-4 mb-4 flex items-center"
        >
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center mr-3">
            <span className="text-xl">💼</span>
          </div>
          <div className="flex-1 text-left">
            <p className="text-white font-semibold">Switch to Business Mode</p>
            <p className="text-white/70 text-sm">Manage your bookings</p>
          </div>
          <ChevronRight className="w-5 h-5 text-white/50" />
        </button>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#E2E8F0]">
          {[
            { icon: '👤', label: 'Account Settings' },
            { icon: '🔔', label: 'Notifications' },
            { icon: '💳', label: 'Payment Methods' },
            { icon: '❓', label: 'Help & Support' },
          ].map((item, i) => (
            <button key={i} className="flex items-center px-4 py-3.5 border-b border-[#F5F0E8] last:border-0 w-full">
              <div className="w-9 h-9 rounded-lg bg-[#F5F0E8] flex items-center justify-center mr-3">
                <span className="text-lg">{item.icon}</span>
              </div>
              <span className="flex-1 text-left font-medium text-[#0A1626]">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-[#9FB3C8]" />
            </button>
          ))}
        </div>

        <button 
          onClick={() => { setIsLoggedIn(false); navigate('welcome'); }}
          className="w-full mt-4 py-3.5 border-2 border-red-500 text-red-500 rounded-xl font-semibold"
        >
          Log out
        </button>
      </div>

      <ClientBottomNav active="profile" navigate={navigate} />
    </div>
  );

  // Business Dashboard
  const BusinessDashboardScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7]">
      <div className="px-4 pt-3 pb-2">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-sm text-[#627D98]">Welcome back</p>
            <p className="text-xl font-bold text-[#0A1626]">Test Business 👋</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center relative">
            <Bell className="w-5 h-5 text-[#0A1626]" />
            <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          </button>
        </div>

        <div className="flex gap-2 mb-3">
          {[
            { icon: '📅', value: '3', label: 'Today' },
            { icon: '💷', value: '£420', label: 'Revenue' },
            { icon: '⏳', value: '2', label: 'Pending' },
          ].map((stat, i) => (
            <div key={i} className="flex-1 bg-white rounded-xl p-3 shadow-sm border border-[#E2E8F0] text-center">
              <span className="text-xl">{stat.icon}</span>
              <p className="text-lg font-bold text-[#0A1626]">{stat.value}</p>
              <p className="text-xs text-[#627D98]">{stat.label}</p>
            </div>
          ))}
        </div>

        <button className="w-full bg-gradient-to-r from-[#00BFA5] to-[#00A896] rounded-xl p-4 flex items-center mb-3">
          <div className="flex-1 text-left">
            <p className="text-white font-semibold">Share Your Booking Link</p>
            <p className="text-white/80 text-sm">Let clients book directly</p>
          </div>
          <div className="bg-white text-[#00BFA5] text-sm font-semibold px-4 py-2 rounded-full">
            Share
          </div>
        </button>
      </div>

      <div className="flex-1 px-4 overflow-auto">
        <p className="font-semibold text-[#0A1626] mb-2">Today's Schedule</p>
        {[
          { client: 'Emma Watson', service: 'Haircut & Style', time: '10:00', status: 'confirmed' },
          { client: 'John Smith', service: 'Beard Trim', time: '11:30', status: 'pending' },
          { client: 'Sarah Connor', service: 'Colouring', time: '14:00', status: 'confirmed' },
        ].map((booking, i) => (
          <div key={i} className="flex items-center bg-white rounded-xl p-3 shadow-sm mb-2 border border-[#E2E8F0]">
            <div className="bg-[#F5F0E8] px-3 py-2 rounded-lg mr-3">
              <span className="text-sm font-bold text-[#0A1626]">{booking.time}</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-[#0A1626]">{booking.client}</p>
              <p className="text-xs text-[#627D98]">{booking.service}</p>
            </div>
            <div className={`w-3 h-3 rounded-full ${booking.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
          </div>
        ))}
      </div>

      <BusinessBottomNav active="dashboard" navigate={navigate} />
    </div>
  );

  // Business Calendar
  const BusinessCalendarScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7]">
      <div className="px-4 pt-3 pb-2 flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#0A1626]">Calendar</h2>
        <div className="flex bg-[#F5F0E8] rounded-lg p-1">
          <button className="px-3 py-1.5 bg-white rounded text-sm font-semibold shadow-sm">Week</button>
          <button className="px-3 py-1.5 text-sm font-medium text-[#627D98]">Day</button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 py-2">
        <button className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center">
          <ChevronLeft className="w-4 h-4 text-[#627D98]" />
        </button>
        <span className="font-semibold text-[#0A1626]">February 2026</span>
        <button className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center">
          <ChevronRight className="w-4 h-4 text-[#627D98]" />
        </button>
      </div>

      <div className="flex px-2 py-2 border-b border-[#E2E8F0]">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
          <div key={i} className="flex-1 text-center">
            <p className="text-xs text-[#627D98] mb-1">{day}</p>
            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${i === 2 ? 'bg-[#00BFA5] text-white shadow-lg shadow-[#00BFA5]/30' : ''}`}>
              <span className="text-sm font-semibold">{9 + i}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 flex overflow-auto">
        <div className="w-12 flex-shrink-0 pt-1">
          {[9, 10, 11, 12, 13, 14, 15, 16, 17].map((hour) => (
            <div key={hour} className="h-14 text-right pr-2 text-xs text-[#627D98]">{hour}:00</div>
          ))}
        </div>
        <div className="flex-1 border-l border-[#E2E8F0] relative">
          <div className="absolute top-[14px] left-[14%] w-[12%] h-[56px] bg-[#00BFA5] rounded-lg p-1.5 shadow-lg shadow-[#00BFA5]/30">
            <p className="text-white text-xs font-semibold truncate">Emma</p>
            <p className="text-white/80 text-[10px]">Haircut</p>
          </div>
          <div className="absolute top-[126px] left-[28%] w-[12%] h-[112px] bg-[#00BFA5] rounded-lg p-1.5 shadow-lg shadow-[#00BFA5]/30">
            <p className="text-white text-xs font-semibold truncate">Sarah</p>
            <p className="text-white/80 text-[10px]">Colour</p>
          </div>
        </div>
      </div>

      <button className="absolute bottom-24 right-4 w-14 h-14 bg-[#00BFA5] rounded-full shadow-xl shadow-[#00BFA5]/40 flex items-center justify-center">
        <Plus className="w-7 h-7 text-white" />
      </button>

      <BusinessBottomNav active="calendar" navigate={navigate} />
    </div>
  );

  // Business Settings
  const BusinessSettingsScreen = () => (
    <div className="h-full flex flex-col bg-[#FDFBF7]">
      <div className="px-4 pt-3 pb-2 overflow-auto flex-1">
        <h2 className="text-xl font-bold text-[#0A1626] mb-4">Settings</h2>
        
        {/* Profile Card */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4 flex items-center border border-[#E2E8F0]">
          <div className="w-14 h-14 rounded-2xl bg-[#00BFA5] flex items-center justify-center mr-3 shadow-lg shadow-[#00BFA5]/30">
            <span className="text-xl font-bold text-white">T</span>
          </div>
          <div className="flex-1">
            <p className="font-bold text-[#0A1626]">Test Business</p>
            <p className="text-sm text-[#627D98]">{email}</p>
          </div>
          <button className="text-[#00BFA5] text-sm font-medium">Edit</button>
        </div>

        {/* Booking Link Section */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4 border border-[#E2E8F0]">
          <p className="text-xs font-semibold text-[#9FB3C8] uppercase tracking-wider mb-2">Your Booking Link</p>
          <div className="flex items-center gap-2 bg-[#F5F0E8] px-3 py-2.5 rounded-lg mb-3">
            <span className="flex-1 text-sm text-[#0A1626] truncate">rezvo.app/book/test-business</span>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#F5F0E8] rounded-lg">
              <span className="text-sm font-medium text-[#00BFA5]">Copy</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#00BFA5] rounded-lg">
              <span className="text-sm font-medium text-white">Share</span>
            </button>
          </div>
        </div>

        {/* Business Section */}
        <p className="text-xs font-semibold text-[#9FB3C8] uppercase tracking-wider mb-2">Business</p>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#E2E8F0] mb-4">
          {[
            { icon: '🏪', label: 'Business Details', desc: 'Name, address, contact' },
            { icon: '⏰', label: 'Working Hours', desc: 'Set availability' },
            { icon: '📅', label: 'Booking Settings', desc: 'Rules & policies' },
          ].map((item, i) => (
            <button key={i} className="flex items-center px-4 py-3.5 border-b border-[#F5F0E8] last:border-0 w-full">
              <div className="w-10 h-10 rounded-xl bg-[#F5F0E8] flex items-center justify-center mr-3">
                <span className="text-lg">{item.icon}</span>
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-[#0A1626]">{item.label}</p>
                <p className="text-xs text-[#9FB3C8]">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#C1C7CD]" />
            </button>
          ))}
        </div>

        {/* Subscription */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4 border border-[#E2E8F0] text-center">
          <span className="inline-block px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-semibold mb-2">FREE TRIAL</span>
          <p className="font-bold text-[#0A1626] mb-1">You're on the Free Plan</p>
          <p className="text-xs text-[#627D98] mb-3">Upgrade to unlock unlimited bookings</p>
          <button className="w-full py-3 bg-[#00BFA5] rounded-full text-white font-semibold text-sm">
            Upgrade to Pro - £4.99/mo
          </button>
        </div>

        {/* Support */}
        <p className="text-xs font-semibold text-[#9FB3C8] uppercase tracking-wider mb-2">Support</p>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#E2E8F0] mb-4">
          {[
            { icon: '❓', label: 'Help Centre' },
            { icon: '💬', label: 'Contact Support' },
            { icon: '📄', label: 'Terms & Privacy' },
          ].map((item, i) => (
            <button key={i} className="flex items-center px-4 py-3.5 border-b border-[#F5F0E8] last:border-0 w-full">
              <div className="w-10 h-10 rounded-xl bg-[#F5F0E8] flex items-center justify-center mr-3">
                <span className="text-lg">{item.icon}</span>
              </div>
              <span className="flex-1 text-left font-medium text-[#0A1626]">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-[#C1C7CD]" />
            </button>
          ))}
        </div>

        <button 
          onClick={() => { setIsLoggedIn(false); navigate('welcome'); }}
          className="w-full py-3.5 bg-red-50 border border-red-200 text-red-500 rounded-xl font-semibold flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Log out
        </button>
        
        <p className="text-center text-xs text-[#9FB3C8] mt-4">Rezvo v1.0.0</p>
      </div>

      <BusinessBottomNav active="settings" navigate={navigate} />
    </div>
  );

  // Business Services Screen (with Products)
  const BusinessServicesScreen = () => {
    const [activeTab, setActiveTab] = useState('services');
    const services = [
      { name: 'Haircut & Style', price: 35, duration: 45, desc: 'Professional haircut' },
      { name: 'Beard Trim', price: 15, duration: 20, desc: 'Beard grooming' },
      { name: 'Hair Color', price: 55, duration: 90, desc: 'Full coloring' },
      { name: 'Deep Conditioning', price: 25, duration: 30, desc: 'Hair treatment' },
    ];
    const products = [
      { name: 'Premium Hair Oil', price: 12.99, stock: 25, category: 'Hair Care' },
      { name: 'Styling Gel', price: 8.99, stock: 40, category: 'Styling' },
      { name: 'Beard Balm', price: 15.99, stock: 15, category: 'Beard Care' },
    ];
    
    return (
      <div className="h-full flex flex-col bg-[#FDFBF7]">
        <div className="px-4 pt-3 pb-2 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#0A1626]">Catalogue</h2>
          <button className="w-10 h-10 rounded-full bg-[#00BFA5] flex items-center justify-center shadow-lg shadow-[#00BFA5]/30">
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="mx-4 mb-3 flex bg-[#F5F0E8] rounded-xl p-1">
          <button 
            onClick={() => setActiveTab('services')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'services' ? 'bg-[#00BFA5] text-white shadow-lg' : 'text-[#627D98]'}`}
          >
            <Scissors className="w-4 h-4" />
            Services ({services.length})
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'products' ? 'bg-[#00BFA5] text-white shadow-lg' : 'text-[#627D98]'}`}
          >
            <span className="text-sm">📦</span>
            Products ({products.length})
          </button>
        </div>

        <div className="flex-1 px-4 overflow-auto">
          {activeTab === 'services' ? (
            services.map((service, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm mb-3 border border-[#E2E8F0]">
                <div className="flex items-start mb-3">
                  <div className="w-12 h-12 rounded-xl bg-[#F5F0E8] flex items-center justify-center mr-3">
                    <Scissors className="w-6 h-6 text-[#00BFA5]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#0A1626]">{service.name}</p>
                    <p className="text-xs text-[#627D98]">{service.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-3 border-t border-[#F5F0E8]">
                  <div className="flex items-center gap-1.5 text-[#627D98]">
                    <span className="text-sm">💷</span>
                    <span className="text-sm font-medium">£{service.price}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#627D98]">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{service.duration} min</span>
                  </div>
                  <div className="flex-1" />
                  <button className="px-4 py-2 bg-[#F5F0E8] rounded-lg text-sm font-medium text-[#00BFA5]">Edit</button>
                </div>
              </div>
            ))
          ) : (
            products.map((product, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm mb-3 border border-[#E2E8F0]">
                <div className="flex items-start mb-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mr-3">
                    <span className="text-xl">📦</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#0A1626]">{product.name}</p>
                    <p className="text-xs text-[#627D98]">{product.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-3 border-t border-[#F5F0E8]">
                  <div className="flex items-center gap-1.5 text-[#627D98]">
                    <span className="text-sm">💷</span>
                    <span className="text-sm font-medium">£{product.price}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#627D98]">
                    <span className="text-sm">📦</span>
                    <span className="text-sm font-medium">{product.stock} in stock</span>
                  </div>
                  <div className="flex-1" />
                  <button className="px-4 py-2 bg-[#F5F0E8] rounded-lg text-sm font-medium text-[#00BFA5]">Edit</button>
                </div>
              </div>
            ))
          )}
        </div>

        <BusinessBottomNav active="services" navigate={navigate} />
      </div>
    );
  };

  // Client Bottom Navigation
  const ClientBottomNav = ({ active, navigate }) => (
    <div className="bg-white border-t-2 border-[#E2E8F0] px-4 py-2 flex justify-around">
      {[
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'search', icon: Search, label: 'Search' },
        { id: 'bookings', icon: Calendar, label: 'Bookings' },
        { id: 'profile', icon: User, label: 'Profile' },
      ].map(({ id, icon: Icon, label }) => (
        <button 
          key={id} 
          onClick={() => navigate(id)}
          className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-all ${active === id ? 'text-[#00BFA5]' : 'text-[#9FB3C8]'}`}
        >
          <Icon className="w-5 h-5" />
          <span className="text-xs mt-0.5 font-medium">{label}</span>
        </button>
      ))}
    </div>
  );

  // Business Bottom Navigation
  const BusinessBottomNav = ({ active, navigate }) => (
    <div className="bg-white border-t-2 border-[#E2E8F0] px-2 py-2 flex justify-around">
      {[
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'calendar', icon: Calendar, label: 'Calendar' },
        { id: 'services', icon: Scissors, label: 'Services' },
        { id: 'settings', icon: Settings, label: 'Settings' },
      ].map(({ id, icon: Icon, label }) => (
        <button 
          key={id} 
          onClick={() => navigate(id)}
          className={`flex flex-col items-center py-1.5 px-2 rounded-xl transition-all ${active === id ? 'text-[#00BFA5]' : 'text-[#9FB3C8]'}`}
        >
          <Icon className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">{label}</span>
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
      case 'services': return <BusinessServicesScreen />;
      case 'settings': return <BusinessSettingsScreen />;
      default: return <WelcomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-[#0A1626] text-white px-6 py-3 rounded-full shadow-2xl z-50 animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-slate-900/80 backdrop-blur border-b border-slate-700 px-4 py-3 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00BFA5] flex items-center justify-center shadow-lg shadow-[#00BFA5]/30">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold">Rezvo Mobile App</h1>
              <p className="text-slate-400 text-sm">Interactive Preview</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 mr-2 hidden sm:block">Mode:</span>
            <button 
              onClick={() => { setUserType('client'); if (isLoggedIn) navigate('home'); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${userType === 'client' ? 'bg-[#00BFA5] text-white' : 'bg-slate-700 text-slate-300'}`}
            >
              Client
            </button>
            <button 
              onClick={() => { setUserType('business'); if (isLoggedIn) navigate('dashboard'); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${userType === 'business' ? 'bg-[#00BFA5] text-white' : 'bg-slate-700 text-slate-300'}`}
            >
              Business
            </button>
          </div>
        </div>
      </div>

      {/* Phone Frame */}
      <div className="mt-20 mb-4">
        <div className="w-[340px] h-[680px] bg-black rounded-[45px] p-2.5 shadow-2xl ring-1 ring-white/10">
          <div className="w-full h-full bg-[#FDFBF7] rounded-[36px] overflow-hidden relative">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-b-2xl z-30" />
            
            {/* Status Bar */}
            <div className="absolute top-0 left-0 right-0 h-11 flex items-center justify-between px-8 z-20">
              <span className="text-xs font-semibold text-[#0A1626]">9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-2.5 bg-[#0A1626] rounded-sm" />
                <div className="w-6 h-3 border-2 border-[#0A1626] rounded-sm">
                  <div className="w-3.5 h-full bg-[#0A1626] rounded-sm" />
                </div>
              </div>
            </div>
            
            {/* App Content */}
            <div className="h-full pt-11">
              {renderScreen()}
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="fixed bottom-4 right-4 bg-slate-800 rounded-xl p-4 border border-slate-700 max-w-xs hidden lg:block">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-white text-sm font-medium">Live Interactive Preview</span>
        </div>
        <p className="text-slate-400 text-xs mb-2">Test the full booking flow</p>
        <div className="bg-slate-700/50 rounded-lg p-2 text-xs">
          <p className="text-slate-300"><span className="text-slate-500">Email:</span> testuser@example.com</p>
          <p className="text-slate-300"><span className="text-slate-500">Pass:</span> password123</p>
        </div>
      </div>
    </div>
  );
};

export default MobilePreview;
