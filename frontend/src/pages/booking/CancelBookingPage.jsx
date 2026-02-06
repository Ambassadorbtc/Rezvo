import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, XCircle, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import api from '../../lib/api';

const CancelBookingPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await api.get(`/booking/token/${token}`);
        setBooking(response.data);
        if (response.data.status === 'cancelled') {
          setCancelled(true);
        }
      } catch (err) {
        setError(err.response?.data?.detail || 'Booking not found');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [token]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await api.post(`/booking/cancel/${token}`);
      setCancelled(true);
      toast.success('Booking cancelled successfully');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h1>
        <p className="text-gray-500 text-center mb-6">{error}</p>
        <Button onClick={() => navigate('/')} variant="outline">
          Go to Homepage
        </Button>
      </div>
    );
  }

  if (cancelled) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Cancelled</h1>
        <p className="text-gray-500 text-center mb-6">
          Your booking has been successfully cancelled.
        </p>
        <Button onClick={() => navigate('/')} className="bg-teal-500 hover:bg-teal-600">
          Back to Homepage
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-500 rounded-xl mb-2">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Rezvo</h2>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Cancel Booking</h1>
              <p className="text-gray-500 text-sm">Are you sure you want to cancel?</p>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">{booking.business_name}</p>
            <p className="text-lg font-semibold text-gray-900 mb-3">{booking.service_name}</p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{formatDate(booking.datetime)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{booking.start_time} ({booking.duration_min} min)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4" />
                <span className="text-sm">{booking.client_name}</span>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b">
            <span className="text-gray-600">Total</span>
            <span className="text-xl font-bold text-gray-900">£{(booking.price_pence / 100).toFixed(2)}</span>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full h-12 bg-red-500 hover:bg-red-600 text-white"
              data-testid="confirm-cancel-btn"
            >
              {cancelling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Yes, Cancel Booking'
              )}
            </Button>
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-full h-12"
            >
              Keep My Booking
            </Button>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm">
          Powered by Rezvo.app
        </p>
      </div>
    </div>
  );
};

export default CancelBookingPage;
