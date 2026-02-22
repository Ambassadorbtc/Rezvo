import { useState, useEffect } from 'react'
import { useTier } from '../../contexts/TierContext'
import api from '../../utils/api'
import Card from '../../components/shared/Card'
import Button from '../../components/shared/Button'
import Input from '../../components/shared/Input'

const Staff = () => {
  const { business, hasFeature } = useTier()
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    if (business?.id && hasFeature('staff')) {
      fetchStaff()
    } else {
      setLoading(false)
    }
  }, [business])

  const fetchStaff = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/staff/business/${business.id}/staff`)
      setStaff(response)
    } catch (error) {
      console.error('Failed to fetch staff:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!hasFeature('staff')) {
    return (
      <div>
        <h1 className="text-3xl font-heading font-bold mb-8">Staff</h1>
        <Card>
          <div className="text-center py-12">
            <p className="text-lg text-text-secondary mb-4">
              Staff management is only available for team and venue tier businesses
            </p>
            <Button variant="primary">
              Upgrade Tier
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest mx-auto"></div>
        <p className="mt-4 text-text-secondary">Loading staff...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Staff</h1>
          <p className="text-text-secondary">
            {staff.length} staff {staff.length === 1 ? 'member' : 'members'}
          </p>
        </div>

        <Button variant="primary" onClick={() => setShowAddForm(true)}>
          Add Staff Member
        </Button>
      </div>

      {staff.length === 0 ? (
        <Card>
          <p className="text-center text-text-secondary py-8">
            No staff members yet. Add your first team member!
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((member) => (
            <Card key={member.id}>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-forest-30 flex items-center justify-center">
                  <span className="text-2xl font-semibold text-forest">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{member.name}</h3>
                  <p className="text-sm text-text-secondary">{member.role}</p>
                </div>
              </div>

              {member.email && (
                <p className="text-sm text-text-secondary mb-2">
                  {member.email}
                </p>
              )}

              {member.specialties && member.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {member.specialties.map((specialty, idx) => (
                    <span
                      key={idx}
                      className="badge badge-success text-xs"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 flex space-x-2">
                <button className="btn-secondary text-sm flex-1">
                  Edit
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default Staff
