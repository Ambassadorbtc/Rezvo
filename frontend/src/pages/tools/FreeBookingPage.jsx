import { useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Calendar, Clock, User, Mail, Phone, Check, ArrowLeft } from 'lucide-react';

export default function FreeBookingPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const service = searchParams.get('s') || 'Service';
  const date = searchParams.get('d') || '';
  const time = searchParams.get('t') || '';
  const business = slug?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Business';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [booked, setBooked] = useState(false);

  const formatDate = (d) => {
    if (!d) return 'Flexible';
    try { return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
    catch { return d; }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email) return;
    setBooked(true);
  };

  if (booked) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-[#E8F5F3] flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-[#00BFA5]" />
          </div>
          <h1 style={{fontFamily:'Space Grotesk,sans-serif'}} className="text-3xl font-bold text-[#0A1626] mb-3">Booking Confirmed!</h1>
          <p className="text-[#627D98] mb-2">Your appointment with <strong>{business}</strong> has been requested.</p>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mt-6 text-left space-y-3">
            <div className="flex justify-between text-sm"><span className="text-[#627D98]">Service</span><span className="font-medium text-[#0A1626]">{service}</span></div>
            {date && <div className="flex justify-between text-sm"><span className="text-[#627D98]">Date</span><span className="font-medium text-[#0A1626]">{formatDate(date)}</span></div>}
            {time && <div className="flex justify-between text-sm"><span className="text-[#627D98]">Time</span><span className="font-medium text-[#0A1626]">{time}</span></div>}
            <div className="flex justify-between text-sm"><span className="text-[#627D98]">Name</span><span className="font-medium text-[#0A1626]">{name}</span></div>
          </div>
          <p className="text-[#9FB3C8] text-xs mt-6">The business will confirm your booking shortly.</p>
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-[#627D98] text-sm mb-3">Want your own booking page like this?</p>
            <Link to="/signup" className="inline-block bg-[#00BFA5] text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-[#00A896] transition-all">
              Get Rezvo — It's free
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#00BFA5] rounded-lg flex items-center justify-center text-white font-bold text-xs">R</div>
            <span style={{fontFamily:'Space Grotesk,sans-serif'}} className="font-bold text-[#0A1626]">Rezvo</span>
          </div>
          <span className="text-[#9FB3C8] text-xs">Free booking link</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-10">
        {/* Business card */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#00BFA5] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4" style={{fontFamily:'Space Grotesk,sans-serif'}}>
            {business.charAt(0)}
          </div>
          <h1 style={{fontFamily:'Space Grotesk,sans-serif'}} className="text-2xl font-bold text-[#0A1626]">{business}</h1>
        </div>

        {/* Booking details */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-[#E8F5F3] rounded-xl">
            <Calendar className="w-5 h-5 text-[#00BFA5]" />
            <div>
              <p className="text-xs text-[#627D98]">Service</p>
              <p className="font-semibold text-[#0A1626] text-sm">{service}</p>
            </div>
          </div>
          {(date || time) && (
            <div className="flex gap-3">
              {date && (
                <div className="flex-1 flex items-center gap-3 p-3 bg-[#EDE9FE] rounded-xl">
                  <Calendar className="w-5 h-5 text-[#8B5CF6]" />
                  <div>
                    <p className="text-xs text-[#627D98]">Date</p>
                    <p className="font-semibold text-[#0A1626] text-sm">{formatDate(date)}</p>
                  </div>
                </div>
              )}
              {time && (
                <div className="flex-1 flex items-center gap-3 p-3 bg-[#DBEAFE] rounded-xl">
                  <Clock className="w-5 h-5 text-[#3B82F6]" />
                  <div>
                    <p className="text-xs text-[#627D98]">Time</p>
                    <p className="font-semibold text-[#0A1626] text-sm">{time}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Booking form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 style={{fontFamily:'Space Grotesk,sans-serif'}} className="font-bold text-[#0A1626] text-lg">Your Details</h2>
          
          <div>
            <label className="text-sm font-medium text-[#334E68] mb-1.5 block">Full name *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9FB3C8]" />
              <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-[#FDFBF7] text-sm focus:outline-none focus:border-[#00BFA5] transition-colors" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#334E68] mb-1.5 block">Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9FB3C8]" />
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-[#FDFBF7] text-sm focus:outline-none focus:border-[#00BFA5] transition-colors" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#334E68] mb-1.5 block">Phone (optional)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9FB3C8]" />
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="07..." className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-[#FDFBF7] text-sm focus:outline-none focus:border-[#00BFA5] transition-colors" />
            </div>
          </div>

          <button type="submit" className="w-full bg-[#00BFA5] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#00A896] transition-all shadow-md shadow-[#00BFA5]/20">
            Confirm Booking
          </button>
        </form>

        {/* Powered by */}
        <div className="text-center mt-8">
          <p className="text-[#9FB3C8] text-xs">Powered by <Link to="/" className="text-[#00BFA5] font-medium hover:underline">Rezvo</Link> — Free booking for small businesses</p>
        </div>
      </div>
    </div>
  );
}
