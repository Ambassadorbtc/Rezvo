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
  Users,
  PoundSterling
} from 'lucide-react';

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState('hairdressers');

  const features = [
    {
      icon: <Link2 className="w-6 h-6" />,
      title: 'Shareable Links',
      description: 'Generate booking links in 12 seconds. Share on TikTok, Instagram, WhatsApp.',
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: 'Smart Calendar',
      description: 'See your day at a glance. Green slots free, red booked, yellow pending.',
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: 'Mobile First',
      description: 'Works perfectly on any device. Your clients book from their phones.',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Auto Reminders',
      description: 'Email reminders so clients never forget. SMS coming soon.',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Analytics',
      description: 'Track revenue, no-shows, and popular services. Data that matters.',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'AI Suggestions',
      description: 'Smart tips to fill quiet slots and reduce no-shows.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Mobile Hairdresser, Manchester',
      quote: 'Finally a booking app that doesn\'t cost a fortune. My clients love how easy it is.',
      avatar: 'SM',
    },
    {
      name: 'James T.',
      role: 'Personal Trainer, London',
      quote: 'The shareable links are genius. I just drop them in my Instagram bio.',
      avatar: 'JT',
    },
    {
      name: 'Priya K.',
      role: 'Nail Tech, Birmingham',
      quote: 'Switched from Booksy. Saving £35 a month and it does everything I need.',
      avatar: 'PK',
    },
  ];

  const useCases = {
    hairdressers: { title: 'Hairdressers & Barbers', icon: '💇' },
    trainers: { title: 'Personal Trainers', icon: '💪' },
    nails: { title: 'Nail Technicians', icon: '💅' },
    food: { title: 'Food Trucks', icon: '🍔' },
    pets: { title: 'Dog Groomers', icon: '🐕' },
    driving: { title: 'Driving Instructors', icon: '🚗' },
  };

  return (
    <div className="min-h-screen bg-obsidian">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-blaze rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">QuickSlot</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10" data-testid="nav-login-btn">
                Log in
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-gradient-blaze hover:opacity-90 text-white rounded-full px-6 btn-press" data-testid="nav-signup-btn">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-blaze/20 via-transparent to-transparent opacity-50 pointer-events-none" />
        
        <div className="max-w-6xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm text-white/70">Now live for UK businesses</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-balance mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Booking links in{' '}
            <span className="text-blaze">12 seconds</span>
          </h1>
          
          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            The £4.99/month booking tool for UK micro-businesses. Generate shareable links, 
            collect deposits, send reminders. Zero complexity, maximum bookings.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-blaze hover:opacity-90 text-white rounded-full px-8 py-6 text-lg font-semibold shadow-glow btn-press" data-testid="hero-cta-btn">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <p className="text-sm text-white/40">No credit card required</p>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div>
              <div className="text-3xl font-bold text-blaze tabular-nums">500+</div>
              <div className="text-sm text-white/50">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent-teal tabular-nums">12k</div>
              <div className="text-sm text-white/50">Bookings Made</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent-purple tabular-nums">98%</div>
              <div className="text-sm text-white/50">Show Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-4">
            Built for solo businesses
          </h2>
          <p className="text-white/60 text-center mb-12 max-w-xl mx-auto">
            Whether you're a mobile hairdresser or a food truck owner, QuickSlot fits your workflow.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {Object.entries(useCases).map(([key, { title, icon }]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === key 
                    ? 'bg-blaze text-white' 
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
                data-testid={`usecase-${key}-btn`}
              >
                {icon} {title}
              </button>
            ))}
          </div>
          
          {/* Preview Card */}
          <Card className="bg-obsidian-paper border-white/5 overflow-hidden max-w-4xl mx-auto">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="p-8 flex flex-col justify-center">
                  <h3 className="text-xl font-bold mb-4">Perfect for {useCases[activeTab].title}</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-white/70">Create services with custom pricing</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-white/70">Set your availability by day</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-white/70">Share link and watch bookings roll in</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-white/70">Collect deposits to reduce no-shows</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-obsidian-subtle p-8 flex items-center justify-center min-h-[300px]">
                  <div className="text-8xl">{useCases[activeTab].icon}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-obsidian-paper">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-4">
            Everything you need, nothing you don't
          </h2>
          <p className="text-white/60 text-center mb-12 max-w-xl mx-auto">
            We stripped out the bloat. Focus on what matters: getting booked.
          </p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="bg-obsidian border-white/5 card-hover group"
                data-testid={`feature-card-${index}`}
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-blaze/10 flex items-center justify-center text-blaze mb-4 group-hover:bg-blaze group-hover:text-white transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-white/60 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4" id="pricing">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-4">
            Simple, honest pricing
          </h2>
          <p className="text-white/60 text-center mb-12 max-w-xl mx-auto">
            One plan. Everything included. No hidden fees.
          </p>
          
          <Card className="bg-obsidian-paper border-blaze/30 max-w-md mx-auto relative overflow-hidden" data-testid="pricing-card">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-blaze" />
            <CardContent className="p-8">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold tabular-nums">£4.99</span>
                <span className="text-white/50">/month</span>
              </div>
              <p className="text-white/60 mb-6">Everything you need to run your bookings</p>
              
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited bookings',
                  'Unlimited shareable links',
                  'Email reminders',
                  'Calendar & dashboard',
                  'Analytics & insights',
                  'AI slot suggestions',
                  'Deposit collection (Dojo)',
                  'No contracts, cancel anytime',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
              
              <Link to="/signup">
                <Button className="w-full bg-gradient-blaze hover:opacity-90 text-white rounded-full py-6 text-lg font-semibold btn-press" data-testid="pricing-cta-btn">
                  Start 14-Day Free Trial
                </Button>
              </Link>
              <p className="text-center text-sm text-white/40 mt-4">No credit card required</p>
            </CardContent>
          </Card>
          
          <p className="text-center text-white/40 mt-8 text-sm">
            Compare: Booksy £40/mo, Square £29/mo, SimplyBook £20/mo
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-obsidian-paper">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-12">
            Loved by UK businesses
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-obsidian border-white/5" data-testid={`testimonial-${index}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-white/80 mb-6">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blaze/20 flex items-center justify-center text-blaze font-semibold text-sm">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-medium">{testimonial.name}</div>
                      <div className="text-sm text-white/50">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-blaze/10 via-transparent to-transparent" />
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
            Ready to simplify your bookings?
          </h2>
          <p className="text-white/60 mb-8 text-lg">
            Join hundreds of UK micro-businesses who've ditched expensive tools.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-gradient-blaze hover:opacity-90 text-white rounded-full px-10 py-6 text-lg font-semibold shadow-glow-lg btn-press" data-testid="final-cta-btn">
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-blaze rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">QuickSlot</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/50">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
            <p className="text-sm text-white/40">
              © 2026 QuickSlot. Made in the UK.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
