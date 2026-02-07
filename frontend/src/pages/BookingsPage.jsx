import { useState, useEffect } from 'react';
import api, { formatPrice, formatDate, formatTime } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Calendar, Search, Filter, Phone, Mail, Clock, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const BookingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => { loadBookings(); }, []);
  useEffect(() => { filterBookings(); }, [bookings, searchQuery, statusFilter]);

  const loadBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b => b.client_name.toLowerCase().includes(query) || b.client_email.toLowerCase().includes(query) || b.service_name.toLowerCase().includes(query));
    }
    if (statusFilter !== 'all') filtered = filtered.filter(b => b.status === statusFilter);
    filtered.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
    setFilteredBookings(filtered);
  };

  const handleCancel = async (bookingId) => {
    setCancelLoading(true);
    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      toast.success('Booking cancelled');
      setSelectedBooking(null);
      loadBookings();
    } catch (error) {
      toast.error('Failed to cancel booking');
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'confirmed': return { badge: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 className="w-4 h-4" /> };
      case 'pending': return { badge: 'bg-amber-100 text-amber-700', icon: <AlertCircle className="w-4 h-4" /> };
      case 'cancelled': return { badge: 'bg-red-100 text-red-700', icon: <XCircle className="w-4 h-4" /> };
      case 'completed': return { badge: 'bg-teal-100 text-teal-700', icon: <CheckCircle2 className="w-4 h-4" /> };
      default: return { badge: 'bg-gray-100 text-gray-600', icon: null };
    }
  };

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-5 md:p-8 max-w-6xl mx-auto space-y-6" data-testid="bookings-page">
        {/* Header */}
        <div className="anim-fade-up">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-navy-900">Bookings</h1>
          <p className="text-navy-400 mt-1">{bookings.length} total bookings</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 anim-fade-up anim-d1">
          <div className="bg-[#E8F5F3] rounded-2xl p-4">
            <div className="text-2xl font-bold font-display text-navy-900">{stats.total}</div>
            <div className="text-xs text-navy-500 mt-1">Total</div>
          </div>
          <div className="bg-[#D1FAE5] rounded-2xl p-4">
            <div className="text-2xl font-bold font-display text-emerald-700">{stats.confirmed}</div>
            <div className="text-xs text-navy-500 mt-1">Confirmed</div>
          </div>
          <div className="bg-[#FEF3E2] rounded-2xl p-4">
            <div className="text-2xl font-bold font-display text-amber-700">{stats.pending}</div>
            <div className="text-xs text-navy-500 mt-1">Pending</div>
          </div>
          <div className="bg-[#FEE2E2] rounded-2xl p-4">
            <div className="text-2xl font-bold font-display text-red-600">{stats.cancelled}</div>
            <div className="text-xs text-navy-500 mt-1">Cancelled</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 anim-fade-up anim-d2">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
              <Input placeholder="Search by name, email, or service..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-cream-100 border-gray-200 rounded-xl" data-testid="search-input" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 bg-cream-100 border-gray-200 rounded-xl" data-testid="status-filter">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-3">
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-12 text-center anim-fade-up">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-navy-500">No bookings found</p>
            </div>
          ) : (
            filteredBookings.map((booking, i) => {
              const status = getStatusStyle(booking.status);
              return (
                <div
                  key={booking.id}
                  className={`bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer hover:shadow-md transition-all hover:scale-[1.005] anim-fade-up anim-d${Math.min(i + 1, 8)}`}
                  onClick={() => setSelectedBooking(booking)}
                  data-testid={`booking-card-${booking.id}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-3 md:w-48">
                      <div className="w-12 h-12 rounded-xl bg-teal-50 flex flex-col items-center justify-center">
                        <span className="text-xs text-teal-600 font-medium">{new Date(booking.datetime).toLocaleDateString('en-GB', { month: 'short' })}</span>
                        <span className="text-lg font-bold text-teal-600">{new Date(booking.datetime).getDate()}</span>
                      </div>
                      <div>
                        <div className="font-bold tabular-nums text-navy-900">{formatTime(booking.datetime)}</div>
                        <div className="text-sm text-navy-400">{booking.duration_min} min</div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-lg text-navy-900">{booking.client_name}</div>
                      <div className="text-sm text-navy-500">{booking.service_name}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-teal-600 tabular-nums">{formatPrice(booking.price_pence)}</div>
                      </div>
                      <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${status.badge}`}>
                        {status.icon}
                        {booking.status}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Booking Detail Dialog */}
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent className="bg-white border-0 rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-xl text-navy-900">Booking Details</DialogTitle>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-cream">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-navy-500">Service</span>
                    <span className="font-medium text-navy-900">{selectedBooking.service_name}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-navy-500">Date & Time</span>
                    <span className="font-medium tabular-nums text-navy-900">{formatDate(selectedBooking.datetime)} at {formatTime(selectedBooking.datetime)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-navy-500">Duration</span>
                    <span className="font-medium text-navy-900">{selectedBooking.duration_min} minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-navy-500">Price</span>
                    <span className="font-bold text-teal-600">{formatPrice(selectedBooking.price_pence)}</span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-cream">
                  <h4 className="font-medium text-navy-900 mb-3">Client Information</h4>
                  <div className="space-y-2">
                    <div className="font-medium text-navy-900">{selectedBooking.client_name}</div>
                    <div className="flex items-center gap-2 text-navy-600">
                      <Mail className="w-4 h-4 text-navy-400" />
                      <a href={`mailto:${selectedBooking.client_email}`} className="hover:text-teal-600">{selectedBooking.client_email}</a>
                    </div>
                    {selectedBooking.client_phone && (
                      <div className="flex items-center gap-2 text-navy-600">
                        <Phone className="w-4 h-4 text-navy-400" />
                        <a href={`tel:${selectedBooking.client_phone}`} className="hover:text-teal-600">{selectedBooking.client_phone}</a>
                      </div>
                    )}
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-xl text-center font-medium ${getStatusStyle(selectedBooking.status).badge}`}>
                  Status: {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                </div>
              </div>
            )}
            <DialogFooter className="gap-2">
              {selectedBooking?.status !== 'cancelled' && (
                <Button variant="destructive" onClick={() => handleCancel(selectedBooking.id)} disabled={cancelLoading} className="rounded-full" data-testid="cancel-booking-btn">
                  {cancelLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cancel Booking'}
                </Button>
              )}
              <Button variant="outline" onClick={() => setSelectedBooking(null)} className="border-gray-200 rounded-full">Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default BookingsPage;
