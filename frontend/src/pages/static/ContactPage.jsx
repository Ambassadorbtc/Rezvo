import { useState } from 'react'
import Navbar from '../../components/directory/Navbar'
import RezvoFooter from '../../components/directory/RezvoFooter'
import SEO from '../../components/seo/SEO'
import { Mail, MapPin, MessageSquare } from 'lucide-react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Contact Us"
        description="Get in touch with the Rezvo team. We'd love to hear from you — whether you're a business owner, diner, or potential partner."
        path="/contact"
      />
      <Navbar />

      <section className="pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-forest mb-4">Get in touch</h1>
            <p className="text-muted text-lg font-body">We'd love to hear from you. Drop us a message and we'll get back to you within 24 hours.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {sent ? (
                <div className="bg-mint/10 rounded-3xl p-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-mint/20 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-7 h-7 text-forest" />
                  </div>
                  <h3 className="font-heading font-bold text-forest text-xl mb-2">Message sent!</h3>
                  <p className="text-muted font-body">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-forest mb-1.5">Name</label>
                      <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-forest mb-1.5">Email</label>
                      <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none" placeholder="you@example.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-forest mb-1.5">Subject</label>
                    <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none" placeholder="What's this about?" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-forest mb-1.5">Message</label>
                    <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none resize-none" placeholder="Tell us more..." />
                  </div>
                  <button type="submit" className="w-full sm:w-auto px-8 py-3.5 bg-forest text-white font-bold rounded-full hover:bg-sage transition-all shadow-lg">
                    Send Message
                  </button>
                </form>
              )}
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-cream">
                <Mail className="w-5 h-5 text-forest mb-3" />
                <h3 className="font-heading font-bold text-forest text-sm mb-1">Email</h3>
                <a href="mailto:hello@rezvo.co.uk" className="text-muted text-sm hover:text-forest transition-colors font-body">hello@rezvo.co.uk</a>
              </div>
              <div className="p-6 rounded-2xl bg-cream">
                <MapPin className="w-5 h-5 text-forest mb-3" />
                <h3 className="font-heading font-bold text-forest text-sm mb-1">Location</h3>
                <p className="text-muted text-sm font-body">Nottingham, United Kingdom</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <RezvoFooter />
    </div>
  )
}
