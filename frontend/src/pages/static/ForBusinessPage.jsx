import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/directory/Navbar'
import RezvoFooter from '../../components/directory/RezvoFooter'
import SEO from '../../components/seo/SEO'
import { Check, ArrowRight, Calendar, CreditCard, BarChart3, Globe, Star, Zap } from 'lucide-react'

const PLANS = [
  { name: 'Free', price: '£0', period: '/mo', features: ['1 staff login', '100 bookings/mo', 'Basic listing', 'Email support'], cta: 'Start Free', popular: false },
  { name: 'Growth', price: '£29', period: '/mo', features: ['5 staff logins', 'Unlimited bookings', 'Deposit collection', 'CRM & analytics', 'Priority support'], cta: 'Start Free Trial', popular: true },
  { name: 'Scale', price: '£59', period: '/mo', features: ['Unlimited staff', 'Floor plan management', 'White-label booking page', 'API access', 'Dedicated account manager'], cta: 'Contact Sales', popular: false },
]

export default function ForBusinessPage() {
  const [monthlyCovers, setMonthlyCovers] = useState(1000)
  const competitorCost = monthlyCovers * 2.50
  const rezvoCost = 29
  const savings = competitorCost - rezvoCost

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="For Business Owners"
        description="Stop paying 48% commission. Rezvo gives restaurants, salons, and service businesses zero-commission bookings, real-time availability, and powerful management tools."
        path="/for-business"
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-cream">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-mint/10 rounded-full text-forest text-sm font-bold mb-6">
            <Zap size={16} /> Save the High Street
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-forest mb-6 leading-tight">
            Stop paying commission.<br />Start growing your business.
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto mb-10 font-body">
            Rezvo replaces expensive booking platforms with a flat monthly fee. More bookings, more profit, less hassle.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="px-8 py-4 bg-forest text-white rounded-full font-bold hover:bg-sage transition-all shadow-lg hover:shadow-xl text-center w-full sm:w-auto">
              Get Started Free <ArrowRight className="inline ml-2 w-4 h-4" />
            </Link>
            <Link to="/contact" className="px-8 py-4 border-2 border-forest text-forest rounded-full font-bold hover:bg-forest/5 transition-all text-center w-full sm:w-auto">
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-heading font-extrabold text-forest text-center mb-14">Everything you need to run your business</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { Icon: Calendar, title: 'Smart Bookings', desc: 'Real-time availability, automated confirmations, no-show protection with deposits.' },
              { Icon: Globe, title: 'Online Presence', desc: 'Beautiful listing page that ranks on Google. Customers find and book you directly.' },
              { Icon: CreditCard, title: 'Payments', desc: 'Stripe-powered payments go straight to your account. No middleman holding your money.' },
              { Icon: BarChart3, title: 'Analytics', desc: 'Know your busiest times, top customers, and revenue trends at a glance.' },
              { Icon: Star, title: 'Reviews', desc: 'Collect and showcase reviews. Respond to feedback and build your reputation.' },
              { Icon: Zap, title: 'Quick Setup', desc: 'Live in 5 minutes. Import your menu, set your hours, and start taking bookings.' },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl border border-border hover:border-forest/20 hover:shadow-card transition-all">
                <div className="w-12 h-12 rounded-xl bg-mint/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-forest" />
                </div>
                <h3 className="font-heading font-bold text-forest text-lg mb-2">{title}</h3>
                <p className="text-muted text-sm leading-relaxed font-body">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Savings Calculator */}
      <section className="py-20 bg-cream" id="pricing">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-heading font-extrabold text-forest text-center mb-4">See how much you'll save</h2>
          <p className="text-muted text-center mb-10 font-body">Compare what you're paying now vs. Rezvo</p>

          <div className="bg-white rounded-3xl shadow-card p-8 sm:p-10">
            <label className="block text-sm font-bold text-forest mb-3">Monthly covers / appointments</label>
            <input
              type="range"
              min="100"
              max="5000"
              step="100"
              value={monthlyCovers}
              onChange={(e) => setMonthlyCovers(Number(e.target.value))}
              className="w-full mb-2 accent-forest"
            />
            <div className="flex justify-between text-sm text-muted mb-8">
              <span>100</span>
              <span className="font-bold text-forest text-lg">{monthlyCovers.toLocaleString()}</span>
              <span>5,000</span>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 text-center">
              <div className="p-5 rounded-2xl bg-red-50 border border-red-100">
                <div className="text-sm text-red-600 font-bold mb-1">Competitors</div>
                <div className="text-3xl font-extrabold text-red-600">£{competitorCost.toLocaleString()}</div>
                <div className="text-xs text-red-400 mt-1">~£2.50/cover commission</div>
              </div>
              <div className="p-5 rounded-2xl bg-mint/10 border border-mint/20">
                <div className="text-sm text-forest font-bold mb-1">Rezvo Growth</div>
                <div className="text-3xl font-extrabold text-forest">£{rezvoCost}</div>
                <div className="text-xs text-muted mt-1">Flat monthly fee</div>
              </div>
              <div className="p-5 rounded-2xl bg-forest text-white">
                <div className="text-sm font-bold mb-1 text-white/70">You save</div>
                <div className="text-3xl font-extrabold">£{savings.toLocaleString()}</div>
                <div className="text-xs text-white/50 mt-1">per month</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-heading font-extrabold text-forest text-center mb-14">Simple, transparent pricing</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-8 rounded-3xl border-2 transition-all ${
                  plan.popular
                    ? 'border-forest shadow-card-hover scale-[1.02]'
                    : 'border-border hover:border-forest/30 hover:shadow-card'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-forest text-white text-xs font-bold rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="font-heading font-extrabold text-forest text-xl mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-forest">{plan.price}</span>
                  <span className="text-muted text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-muted">
                      <Check size={16} className="text-mint shrink-0" />
                      <span className="font-body">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className={`block text-center font-bold py-3 rounded-full transition-all ${
                    plan.popular
                      ? 'bg-forest text-white hover:bg-sage'
                      : 'border-2 border-forest text-forest hover:bg-forest hover:text-white'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RezvoFooter />
    </div>
  )
}
