import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  Calendar, 
  Clock, 
  Link2, 
  Smartphone, 
  BarChart3, 
  Zap, 
  Check, 
  ArrowRight,
  Star,
  Shield,
  Users,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('hairdressers');

  const features = [
    {
      icon: <Link2 className="w-7 h-7" />,
      title: 'Shareable booking links',
      description: 'Generate a link in seconds. Share on TikTok, Instagram, or WhatsApp.',
      color: 'bg-teal-50 text-teal-600',
    },
    {
      icon: <Calendar className="w-7 h-7" />,
      title: 'Smart calendar',
      description: 'See your day at a glance. Never double-book again.',
      color: 'bg-coral-50 text-coral-500',
    },
    {
      icon: <Smartphone className="w-7 h-7" />,
      title: 'Works everywhere',
      description: 'Your clients book from their phone. No app download needed.',
      color: 'bg-navy-50 text-navy-600',
    },
    {
      icon: <Clock className="w-7 h-7" />,
      title: 'Automated reminders',
      description: 'Reduce no-shows with automatic email reminders.',
      color: 'bg-amber-50 text-amber-600',
    },
    {
      icon: <BarChart3 className="w-7 h-7" />,
      title: 'Simple analytics',
      description: 'Track revenue and bookings. Know what\'s working.',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      icon: <Zap className="w-7 h-7" />,
      title: 'AI-powered tips',
      description: 'Get smart suggestions to fill quiet slots.',
      color: 'bg-emerald-50 text-emerald-600',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'Mobile Hairdresser, Manchester',
      quote: 'Switched from Booksy and saving £35 a month. My clients love how easy booking is now.',
      avatar: 'SM',
    },
    {
      name: 'James Thompson',
      role: 'Personal Trainer, London',
      quote: 'The shareable links are brilliant. I just pop them in my Instagram bio and the bookings roll in.',
      avatar: 'JT',
    },
    {
      name: 'Priya Kaur',
      role: 'Nail Technician, Birmingham',
      quote: 'Finally something simple that just works. No complicated setup, no hidden fees.',
      avatar: 'PK',
    },
  ];

  const useCases = [
    { key: 'hairdressers', label: 'Hairdressers', emoji: '💇' },
    { key: 'trainers', label: 'Personal Trainers', emoji: '💪' },
    { key: 'nails', label: 'Nail Techs', emoji: '💅' },
    { key: 'food', label: 'Food Trucks', emoji: '🍔' },
    { key: 'pets', label: 'Dog Groomers', emoji: '🐕' },
    { key: 'driving', label: 'Driving Instructors', emoji: '🚗' },
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold font-heading text-navy-900">Rezvo</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" className="text-navy-600 hover:text-navy-900 hover:bg-navy-50 font-medium" data-testid="nav-login-btn">
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-teal-500 hover:bg-teal-600 text-white rounded-full px-6 py-2.5 font-semibold shadow-button hover:shadow-button-hover transition-all btn-press" data-testid="nav-signup-btn">
                  Get started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Monzo/Starling Style */}
      <section className="relative pt-24 md:pt-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-navy-900 rounded-3xl md:rounded-[2.5rem] overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&q=80" 
                alt="Hairdresser at work"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-navy-900/90 via-navy-900/70 to-navy-900/50" />
            </div>
            
            {/* Hero Content */}
            <div className="relative px-6 py-16 md:px-12 md:py-24 lg:py-32">
              <div className="max-w-xl">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6 animate-fade-in-up">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm text-white/90 font-medium">Now live for UK businesses</span>
                </div>
                
                {/* Headline */}
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white font-bold leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  Good with bookings starts here.
                </h1>
                
                {/* Subheadline */}
                <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  Generate shareable booking links in seconds. Let clients book, pay deposits, and get reminders — all for just £4.99/month.
                </p>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  <Link to="/signup">
                    <Button size="lg" className="bg-teal-500 hover:bg-teal-400 text-white rounded-full px-8 py-6 text-lg font-semibold shadow-button hover:shadow-button-hover transition-all btn-press" data-testid="hero-cta-btn">
                      Start free trial
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <span className="text-white/60 text-sm">No credit card required</span>
                </div>
              </div>
            </div>

            {/* Trust Badges - Floating */}
            <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 flex items-center gap-3">
              <div className="trust-badge rounded-full px-4 py-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-600" />
                <span className="text-sm font-medium text-navy-700">SSL Secured</span>
              </div>
              <div className="trust-badge rounded-full px-4 py-2 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-navy-700">GDPR Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto text-center">
            <div className="animate-fade-in-up">
              <div className="text-3xl md:text-4xl font-bold font-display text-teal-500 tabular-nums">500+</div>
              <div className="text-sm md:text-base text-navy-500 mt-1">Active businesses</div>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="text-3xl md:text-4xl font-bold font-display text-coral-500 tabular-nums">12,000</div>
              <div className="text-sm md:text-base text-navy-500 mt-1">Bookings made</div>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="text-3xl md:text-4xl font-bold font-display text-navy-700 tabular-nums">98%</div>
              <div className="text-sm md:text-base text-navy-500 mt-1">Show-up rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4">
              Built for solo businesses
            </h2>
            <p className="text-lg text-navy-500 max-w-2xl mx-auto">
              Whether you're a mobile hairdresser or a food truck owner, Rezvo fits your workflow.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {useCases.map(({ key, label, emoji }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === key
                    ? 'bg-teal-500 text-white shadow-button'
                    : 'bg-gray-100 text-navy-600 hover:bg-gray-200'
                }`}
                data-testid={`usecase-${key}-btn`}
              >
                <span className="mr-2">{emoji}</span>
                {label}
              </button>
            ))}
          </div>

          {/* Feature Card */}
          <Card className="bg-cream rounded-3xl overflow-hidden border-0 shadow-card max-w-4xl mx-auto">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2">
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <h3 className="font-heading text-2xl font-semibold text-navy-900 mb-6">
                    Everything you need
                  </h3>
                  <ul className="space-y-4">
                    {[
                      'Create services with custom pricing',
                      'Set your availability by day',
                      'Share link and watch bookings roll in',
                      'Collect deposits to reduce no-shows',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-teal-600" />
                        </div>
                        <span className="text-navy-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup" className="mt-8 inline-flex">
                    <Button className="bg-navy-900 hover:bg-navy-800 text-white rounded-full px-6 font-semibold btn-press">
                      Get started free
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
                <div className="bg-gradient-to-br from-teal-100 to-teal-50 p-8 md:p-12 flex items-center justify-center">
                  <img 
                    src="https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80"
                    alt="Booking app on phone"
                    className="rounded-2xl shadow-float max-w-[280px] w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4">
              Everything you need, nothing you don't
            </h2>
            <p className="text-lg text-navy-500 max-w-2xl mx-auto">
              We stripped out the bloat. Focus on what matters: getting booked.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-white rounded-3xl border-0 shadow-card hover-lift group"
                data-testid={`feature-card-${index}`}
              >
                <CardContent className="p-8">
                  <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-navy-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-navy-500 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24 bg-white" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4">
              Simple, honest pricing
            </h2>
            <p className="text-lg text-navy-500 max-w-2xl mx-auto">
              One plan. Everything included. No surprises.
            </p>
          </div>

          <Card className="bg-cream rounded-3xl border-2 border-teal-200 max-w-md mx-auto relative overflow-hidden shadow-card" data-testid="pricing-card">
            {/* Popular Badge */}
            <div className="absolute top-0 right-0 bg-teal-500 text-white text-xs font-semibold px-4 py-1.5 rounded-bl-xl">
              Most Popular
            </div>
            
            <CardContent className="p-8 md:p-10">
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-5xl md:text-6xl font-bold font-display text-navy-900 tabular-nums">£4.99</span>
                  <span className="text-navy-500 text-lg">/month</span>
                </div>
                <p className="text-navy-500">Everything you need to run your bookings</p>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  'Unlimited bookings',
                  'Unlimited shareable links',
                  'Email reminders',
                  'Calendar & dashboard',
                  'Analytics & insights',
                  'AI-powered suggestions',
                  'Deposit collection',
                  'No contracts, cancel anytime',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-teal-600" />
                    </div>
                    <span className="text-navy-700">{item}</span>
                  </li>
                ))}
              </ul>

              <Link to="/signup">
                <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-full py-6 text-lg font-semibold shadow-button hover:shadow-button-hover transition-all btn-press" data-testid="pricing-cta-btn">
                  Start 14-day free trial
                </Button>
              </Link>
              <p className="text-center text-sm text-navy-400 mt-4">No credit card required</p>
            </CardContent>
          </Card>

          <p className="text-center text-navy-400 mt-8 text-sm">
            Compare: Booksy £40/mo, Square £29/mo, SimplyBook £20/mo
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4">
              Loved by UK businesses
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white rounded-3xl border-0 shadow-card" data-testid={`testimonial-${index}`}>
                <CardContent className="p-8">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-navy-600 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-navy-900">{testimonial.name}</div>
                      <div className="text-sm text-navy-500">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 bg-navy-900 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-coral-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to simplify your bookings?
          </h2>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            Join hundreds of UK micro-businesses who've ditched expensive, complicated tools.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-teal-500 hover:bg-teal-400 text-white rounded-full px-10 py-6 text-lg font-semibold shadow-button hover:shadow-button-hover transition-all btn-press" data-testid="final-cta-btn">
              Get started free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-cream border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold font-heading text-navy-900">Rezvo</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-navy-500">
              <Link to="/privacy" className="hover:text-navy-900 transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-navy-900 transition-colors">Terms</Link>
              <Link to="/cookies" className="hover:text-navy-900 transition-colors">Cookies</Link>
              <a href="mailto:support@rezvo.app" className="hover:text-navy-900 transition-colors">Support</a>
            </div>
            <p className="text-sm text-navy-400">
              © 2026 Rezvo. Made in the UK.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
