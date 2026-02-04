import { useState, useEffect } from 'react';
import api, { formatPrice, formatDate, formatTime } from '../lib/api';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Calendar, Search, Filter, X, Phone, Mail, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const BookingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchQuery, statusFilter]);

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
      filtered = filtered.filter(b => 
        b.client_name.toLowerCase().includes(query) ||
        b.client_email.toLowerCase().includes(query) ||
        b.service_name.toLowerCase().includes(query)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }
    
    // Sort by date descending
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-success/20 text-success border-success/30';
      case 'pending': return 'bg-warning/20 text-warning border-warning/30';
      case 'cancelled': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'completed': return 'bg-accent-teal/20 text-accent-teal border-accent-teal/30';
      default: return 'bg-white/10 text-white/60 border-white/10';
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-blaze border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6" data-testid="bookings-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Bookings</h1>
            <p className="text-white/50 mt-1">{bookings.length} total bookings</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-obsidian-paper border-white/5">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  placeholder="Search by name, email, or service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-obsidian border-white/10"
                  data-testid="search-input"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 bg-obsidian border-white/10" data-testid="status-filter">
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
          </CardContent>
        </Card>

        {/* Bookings List */}
        <div className="space-y-3">
          {filteredBookings.length === 0 ? (
            <Card className="bg-obsidian-paper border-white/5">
              <CardContent className="py-12 text-center">
                <Calendar className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/50">No bookings found</p>
              </CardContent>
            </Card>
          ) : (
            filteredBookings.map((booking) => (
              <Card
                key={booking.id}
                className="bg-obsidian-paper border-white/5 card-hover cursor-pointer"
                onClick={() => setSelectedBooking(booking)}
                data-testid={`booking-card-${booking.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Date/Time */}
                    <div className="flex items-center gap-3 md:w-48">
                      <div className="w-12 h-12 rounded-xl bg-blaze/10 flex flex-col items-center justify-center">
                        <span className="text-xs text-blaze font-medium">
                          {new Date(booking.datetime).toLocaleDateString('en-GB', { month: 'short' })}
                        </span>
                        <span className="text-lg font-bold text-blaze">
                          {new Date(booking.datetime).getDate()}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold tabular-nums">{formatTime(booking.datetime)}</div>
                        <div className="text-sm text-white/40">{booking.duration_min} min</div>
                      </div>
                    </div>

                    {/* Client Info */}
                    <div className="flex-1">
                      <div className="font-medium text-lg">{booking.client_name}</div>
                      <div className="text-sm text-white/50">{booking.service_name}</div>
                    </div>

                    {/* Price & Status */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-accent-teal tabular-nums">
                          {formatPrice(booking.price_pence)}
                        </div>
                        {booking.deposit_paid && (
                          <div className="text-xs text-success">Deposit paid</div>
                        )}
                      </div>
                      <div className={`px-3 py-1.5 rounded-md text-xs font-medium border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Booking Detail Dialog */}
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent className="bg-obsidian-paper border-white/10 max-w-md">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-obsidian border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/50">Service</span>
                    <span className="font-medium">{selectedBooking.service_name}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/50">Date & Time</span>
                    <span className="font-medium tabular-nums">
                      {formatDate(selectedBooking.datetime)} at {formatTime(selectedBooking.datetime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/50">Duration</span>
                    <span className="font-medium">{selectedBooking.duration_min} minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Price</span>
                    <span className="font-bold text-accent-teal">{formatPrice(selectedBooking.price_pence)}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-obsidian border border-white/5">
                  <h4 className="font-medium mb-3">Client Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white/70">
                      <span className="font-medium text-white">{selectedBooking.client_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                      <Mail className="w-4 h-4 text-white/40" />
                      <a href={`mailto:${selectedBooking.client_email}`} className="hover:text-blaze">
                        {selectedBooking.client_email}
                      </a>
                    </div>
                    {selectedBooking.client_phone && (
                      <div className="flex items-center gap-2 text-white/70">
                        <Phone className="w-4 h-4 text-white/40" />
                        <a href={`tel:${selectedBooking.client_phone}`} className="hover:text-blaze">
                          {selectedBooking.client_phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className={`px-4 py-2 rounded-lg text-center font-medium border ${getStatusColor(selectedBooking.status)}`}>
                  Status: {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                </div>
              </div>
            )}
            <DialogFooter className="gap-2">
              {selectedBooking?.status !== 'cancelled' && (
                <Button
                  variant="destructive"
                  onClick={() => handleCancel(selectedBooking.id)}
                  disabled={cancelLoading}
                  data-testid="cancel-booking-btn"
                >
                  {cancelLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cancel Booking'}
                </Button>
              )}
              <Button variant="outline" onClick={() => setSelectedBooking(null)} className="border-white/10">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default BookingsPage;
