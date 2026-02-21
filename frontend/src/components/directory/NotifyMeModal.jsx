import { useState } from 'react';
import { X, Bell } from 'lucide-react';
import api from '../../utils/api';

export default function NotifyMeModal({ listing, onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post(`/directory/notify-me/${listing._id}`, { email, name });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to register notification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-darker/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="relative bg-gradient-to-br from-forest to-sage p-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-16 h-16 bg-mint rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Bell className="w-8 h-8 text-forest" />
          </div>
          
          <h2 className="font-heading font-black text-3xl mb-2">
            Get Notified
          </h2>
          <p className="text-light-green text-sm leading-relaxed">
            We'll email you when <span className="font-bold text-white">{listing?.name}</span> joins Rezvo and starts accepting bookings.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-forest mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-cream text-text placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-mint focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-forest mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-cream text-text placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-mint focus:border-transparent transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-coral/10 border border-coral/20 rounded-xl text-coral text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-forest text-white font-bold py-4 rounded-full hover:bg-sage transition-all shadow-md hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Submitting...' : 'Notify Me'}
          </button>

          <p className="text-xs text-muted text-center mt-4 leading-relaxed">
            By continuing, you agree to receive emails about this venue. Unsubscribe anytime.
          </p>
        </form>
      </div>
    </div>
  );
}
