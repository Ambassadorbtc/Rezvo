/**
 * Run 3: Dashboard — live KPIs, today's bookings, activity feed
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTier } from '../../contexts/TierContext'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../utils/api'
import Card from '../../components/shared/Card'

const Dashboard = () => {
  const { business } = useTier()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [todayBookings, setTodayBookings] = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    if (!business?.id) return
    try {
      const [s, t, a] = await Promise.all([
        api.get(`/dashboard/business/${business.id}/summary`),
        api.get(`/dashboard/business/${business.id}/today`),
        api.get(`/dashboard/business/${business.id}/activity?limit=20`),
      ])
      setSummary(s)
      setTodayBookings(t?.bookings || [])
      setActivity(a?.events || [])
    } catch (err) {
      console.error('Failed to fetch dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 30000)
    return () => clearInterval(interval)
  }, [business?.id])

  const formatPounds = (pence) => {
    if (pence == null) return '£0.00'
    return `£${((pence || 0) / 100).toFixed(2)}`
  }

  const formatTime = (ts) => {
    if (!ts) return ''
    const d = new Date(ts)
    const diff = (Date.now() - d) / 60000
    if (diff < 1) return 'Just now'
    if (diff < 60) return `${Math.floor(diff)} min ago`
    if (diff < 1440) return `${Math.floor(diff / 60)} hr ago`
    return `${Math.floor(diff / 1440)} days ago`
  }

  const eventIcon = (type) => {
    if (type?.includes('created')) return 'fa-plus-circle'
    if (type?.includes('cancelled')) return 'fa-times-circle'
    if (type?.includes('completed')) return 'fa-check-circle'
    if (type?.includes('payment')) return 'fa-credit-card'
    return 'fa-circle'
  }

  if (loading && !summary) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        <p className="mt-4 text-muted">Loading...</p>
      </div>
    )
  }

  const today = summary?.today || {}
  const period = summary?.period || {}

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold mb-2">Dashboard</h1>
        <p className="text-muted">Welcome back, {user?.name}</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <p className="text-muted text-sm mb-2">Today&apos;s Bookings</p>
          <p className="text-3xl font-heading font-bold text-primary">{today.bookings ?? 0}</p>
          {period.bookingsChange != null && period.bookingsChange !== 0 && (
            <p className="text-xs text-muted mt-1">{period.bookingsChange > 0 ? '+' : ''}{period.bookingsChange}% vs last week</p>
          )}
        </Card>
        <Card>
          <p className="text-muted text-sm mb-2">Revenue Today</p>
          <p className="text-3xl font-heading font-bold text-primary">{formatPounds(today.revenue)}</p>
          {period.revenueChange != null && period.revenueChange !== 0 && (
            <p className="text-xs text-muted mt-1">{period.revenueChange > 0 ? '+' : ''}{period.revenueChange}% vs last week</p>
          )}
        </Card>
        <Card>
          <p className="text-muted text-sm mb-2">New Clients</p>
          <p className="text-3xl font-heading font-bold text-primary">{today.newClients ?? 0}</p>
        </Card>
        <Card>
          <p className="text-muted text-sm mb-2">Completed</p>
          <p className="text-3xl font-heading font-bold text-primary">{today.completedBookings ?? 0}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's schedule */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading font-semibold">Today&apos;s Schedule</h2>
            <button onClick={() => navigate('/dashboard/bookings')} className="text-sm text-primary hover:underline">
              View all
            </button>
          </div>
          {todayBookings.length === 0 ? (
            <p className="text-muted">No bookings today</p>
          ) : (
            <div className="space-y-3">
              {todayBookings.map((b) => (
                <button
                  key={b.id}
                  onClick={() => navigate(`/dashboard/bookings?booking=${b.id}`)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${b.isNext ? 'border-primary bg-primary/5' : 'border-border hover:bg-border/30'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{b.time}</span>
                      <span className="text-muted ml-2">— {b.customerName}</span>
                      <p className="text-sm text-muted mt-0.5">{b.service} {b.staff && `· ${b.staff}`}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${b.status === 'confirmed' ? 'bg-success/20 text-success' : b.status === 'checked_in' ? 'bg-info/20 text-info' : 'bg-muted/30 text-muted'}`}>
                      {b.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Activity feed */}
        <Card>
          <h2 className="text-xl font-heading font-semibold mb-4">Recent Activity</h2>
          {activity.length === 0 ? (
            <p className="text-muted">No recent activity</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {activity.map((e) => (
                <div key={e.id} className="flex gap-3">
                  <i className={`fa-solid ${eventIcon(e.type)} text-primary mt-0.5`} />
                  <div>
                    <p className="text-sm">{e.message}</p>
                    <p className="text-xs text-muted">{formatTime(e.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
