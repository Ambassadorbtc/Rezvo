import { useState, useEffect } from 'react'
import { useTier } from '../../contexts/TierContext'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../utils/api'
import Card from '../../components/shared/Card'

const Dashboard = () => {
  const { business } = useTier()
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (business?.id) {
      fetchStats()
    } else {
      setLoading(false)
    }
  }, [business])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/analytics/business/${business.id}/overview`)
      setStats(response)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest mx-auto"></div>
        <p className="mt-4 text-text-secondary">Loading...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold mb-2">Dashboard</h1>
        <p className="text-text-secondary">
          Welcome back, {user?.name}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <p className="text-text-secondary text-sm mb-2">Total Bookings</p>
          <p className="text-3xl font-heading font-bold text-forest">
            {stats?.bookings?.total || 0}
          </p>
        </Card>

        <Card>
          <p className="text-text-secondary text-sm mb-2">Confirmed</p>
          <p className="text-3xl font-heading font-bold text-forest-50">
            {stats?.bookings?.confirmed || 0}
          </p>
        </Card>

        <Card>
          <p className="text-text-secondary text-sm mb-2">Cancellation Rate</p>
          <p className="text-3xl font-heading font-bold text-red">
            {stats?.bookings?.cancellation_rate || 0}%
          </p>
        </Card>

        <Card>
          <p className="text-text-secondary text-sm mb-2">Average Rating</p>
          <div className="flex items-center">
            <span className="text-gold text-2xl mr-2">★</span>
            <p className="text-3xl font-heading font-bold">
              {business?.rating || 'N/A'}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-heading font-semibold mb-4">Recent Activity</h2>
          <p className="text-text-secondary">No recent activity</p>
        </Card>

        <Card>
          <h2 className="text-xl font-heading font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button className="w-full btn-primary text-left">
              View Today's Bookings
            </button>
            <button className="w-full btn-secondary text-left">
              Add New Service
            </button>
            <button className="w-full btn-secondary text-left">
              Manage Staff
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
