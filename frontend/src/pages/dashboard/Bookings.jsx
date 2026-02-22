import { useState, useEffect } from 'react'
import { useTier } from '../../contexts/TierContext'
import api from '../../utils/api'
import Card from '../../components/shared/Card'
import Badge from '../../components/shared/Badge'
import { RESERVATION_STATUS } from '../../utils/constants'

const Bookings = () => {
  const { business } = useTier()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (business?.id) {
      fetchBookings()
    } else {
      setLoading(false)
    }
  }, [business])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const startDate = new Date().toISOString().split('T')[0]
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      const response = await api.get(
        `/bookings/business/${business.id}/calendar?start_date=${startDate}&end_date=${endDate}`
      )
      setBookings(response)
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter)

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest mx-auto"></div>
        <p className="mt-4 text-text-secondary">Loading bookings...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Bookings</h1>
          <p className="text-text-secondary">
            {filteredBookings.length} {filteredBookings.length === 1 ? 'booking' : 'bookings'}
          </p>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input w-48"
        >
          <option value="all">All Bookings</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {filteredBookings.length === 0 ? (
        <Card>
          <p className="text-center text-text-secondary py-8">
            No bookings found
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking._id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-lg font-semibold">
                      {new Date(booking.date).toLocaleDateString('en-GB', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short'
                      })}
                    </h3>
                    <span className="text-text-secondary">
                      {booking.time}
                    </span>
                    <Badge variant={
                      booking.status === 'confirmed' || booking.status === 'completed'
                        ? 'success'
                        : booking.status === 'cancelled'
                        ? 'error'
                        : 'warning'
                    }>
                      {RESERVATION_STATUS[booking.status]?.label || booking.status}
                    </Badge>
                  </div>
                  
                  <p className="text-text-secondary">
                    Party of {booking.party_size} • {booking.duration_minutes} minutes
                  </p>
                  
                  {booking.notes && (
                    <p className="text-sm text-text-secondary mt-2">
                      Note: {booking.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button className="btn-secondary text-sm">
                    View Details
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default Bookings
