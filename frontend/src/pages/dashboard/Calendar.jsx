/**
 * Run 3: Calendar — day view with real bookings
 */

import { useState, useEffect } from 'react'
import { useTier } from '../../contexts/TierContext'
import api from '../../utils/api'
import Card from '../../components/shared/Card'

const Calendar = () => {
  const { business } = useTier()
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const isRestaurant = business?.type === 'restaurant' || business?.category === 'restaurant'

  useEffect(() => {
    if (!business?.id) return
    setLoading(true)
    const endpoint = isRestaurant
      ? `/calendar/business/${business.id}/restaurant?date=${selectedDate}&view=day`
      : `/calendar/business/${business.id}?date=${selectedDate}&view=day`
    api.get(endpoint)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [business?.id, selectedDate, isRestaurant])

  const goPrev = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 1)
    setSelectedDate(d.toISOString().slice(0, 10))
  }

  const goNext = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 1)
    setSelectedDate(d.toISOString().slice(0, 10))
  }

  const goToday = () => {
    setSelectedDate(new Date().toISOString().slice(0, 10))
  }

  if (!business?.id) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">No business selected</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Calendar</h1>
          <p className="text-muted">View and manage your bookings</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goPrev} className="p-2 rounded-lg border border-border hover:bg-border">
            <i className="fa-solid fa-chevron-left" />
          </button>
          <button onClick={goToday} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">
            Today
          </button>
          <button onClick={goNext} className="p-2 rounded-lg border border-border hover:bg-border">
            <i className="fa-solid fa-chevron-right" />
          </button>
          <span className="ml-2 font-medium">{new Date(selectedDate + 'T12:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        </div>
      ) : (
        <Card>
          {isRestaurant ? (
            <div>
              <h2 className="font-heading font-semibold mb-4">Restaurant view</h2>
              {data?.covers && (
                <p className="text-muted mb-4">Covers: {data.covers.total} / {data.covers.capacity}</p>
              )}
              <div className="space-y-3">
                {(data?.bookings || []).map((b) => (
                  <div key={b.id} className="p-3 rounded-lg border border-border">
                    <span className="font-medium">{b.time}</span>
                    <span className="text-muted ml-2">— {b.customerName}</span>
                    <span className="text-muted ml-2">({b.partySize} guests)</span>
                    {b.tableId && <span className="text-muted ml-2">· Table {b.tableId}</span>}
                  </div>
                ))}
                {(!data?.bookings || data.bookings.length === 0) && (
                  <p className="text-muted">No bookings for this date</p>
                )}
              </div>
            </div>
          ) : (
            <div>
              <h2 className="font-heading font-semibold mb-4">Day view</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(data?.staff || [{ id: 'default', name: 'All' }]).map((staff) => {
                  const staffBookings = staff.id === 'default'
                    ? (data?.bookings || [])
                    : (data?.bookings || []).filter((b) => b.staffId === staff.id)
                  return (
                    <div key={staff.id} className="border border-border rounded-lg p-3">
                      <p className="font-medium text-primary mb-3">{staff.name}</p>
                      <div className="space-y-2">
                        {staffBookings.map((b) => (
                          <div
                            key={b.id}
                            className="p-2 rounded text-sm"
                            style={{ borderLeft: `4px solid ${b.colour || '#22C55E'}`, backgroundColor: `${b.colour || '#22C55E'}15` }}
                          >
                            <p className="font-medium">{b.time} — {b.customerName}</p>
                            <p className="text-muted text-xs">{b.service}</p>
                          </div>
                        ))}
                        {staffBookings.length === 0 && <p className="text-muted text-sm">No bookings</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
              {(!data?.bookings || data.bookings.length === 0) && (!data?.staff || data.staff.length === 0) && (
                <p className="text-muted py-8">No bookings for this date</p>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

export default Calendar
