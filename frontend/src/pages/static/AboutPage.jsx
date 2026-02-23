import Navbar from '../../components/directory/Navbar'
import RezvoFooter from '../../components/directory/RezvoFooter'
import SEO from '../../components/seo/SEO'
import { Heart, Zap, Shield, Users } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="About Us"
        description="Rezvo is on a mission to save the high street. We help independent restaurants, salons, and service businesses thrive with zero-commission bookings."
        path="/about"
      />
      <Navbar />

      <section className="pt-32 pb-16 bg-cream">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-forest mb-6">
            Saving the High Street
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed font-body">
            Big platforms charge up to 48% commission, squeezing the life out of independent businesses. Rezvo gives the power back — zero-commission bookings, real-time availability, and tools that actually work.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <h2 className="text-3xl font-heading font-extrabold text-forest mb-4">Why we exist</h2>
              <p className="text-muted leading-relaxed mb-4 font-body">
                Every week, independent restaurants and service businesses close their doors — not because their food or service isn't good enough, but because the platforms they depend on take too large a cut.
              </p>
              <p className="text-muted leading-relaxed font-body">
                Rezvo was founded with a simple belief: the best businesses on your high street deserve tools that help them grow, not ones that drain their profits. We're building the booking platform the UK's independents actually deserve.
              </p>
            </div>
            <div className="bg-forest/5 rounded-3xl p-10 text-center">
              <div className="text-4xl sm:text-6xl font-heading font-extrabold text-forest mb-2">48%</div>
              <p className="text-muted font-body">The commission some platforms charge per order</p>
              <div className="h-px bg-border my-6" />
              <div className="text-4xl sm:text-6xl font-heading font-extrabold text-mint mb-2">£0</div>
              <p className="text-muted font-body">What Rezvo charges per booking</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { Icon: Heart, title: 'Community First', desc: 'Built for independent businesses, not chains' },
              { Icon: Zap, title: 'Dead Simple', desc: 'Live in 5 minutes, no technical skills needed' },
              { Icon: Shield, title: 'Fair Pricing', desc: 'Flat monthly fee, never a percentage of sales' },
              { Icon: Users, title: 'Customer Owned', desc: 'Your data, your customers, your relationships' },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-mint/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-forest" />
                </div>
                <h3 className="font-heading font-bold text-forest text-lg mb-2">{title}</h3>
                <p className="text-muted text-sm font-body">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RezvoFooter />
    </div>
  )
}
