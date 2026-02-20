import { useState, useEffect } from 'react'
import { useTier } from '../../contexts/TierContext'
import api from '../../utils/api'
import Card from '../../components/shared/Card'
import Button from '../../components/shared/Button'
import Input from '../../components/shared/Input'

const Settings = () => {
  const { business } = useTier()
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (business?._id) {
      fetchSettings()
    }
  }, [business])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/settings/business/${business._id}`)
      setSettings(response)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch(`/settings/business/${business._id}`, settings)
      alert('Settings saved successfully')
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest mx-auto"></div>
        <p className="mt-4 text-text-secondary">Loading settings...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold mb-2">Settings</h1>
        <p className="text-text-secondary">
          Manage your business settings
        </p>
      </div>

      <div className="space-y-6 max-w-3xl">
        <Card>
          <h2 className="text-xl font-heading font-semibold mb-4">
            Business Information
          </h2>
          <div className="space-y-4">
            <Input
              label="Business Name"
              value={business?.name || ''}
              disabled
            />
            <Input
              label="Address"
              value={business?.address || ''}
              disabled
            />
            <Input
              label="Phone"
              value={business?.phone || ''}
            />
            <Input
              label="Website"
              value={business?.website || ''}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-heading font-semibold mb-4">
            Booking Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-confirm bookings</p>
                <p className="text-sm text-text-secondary">
                  Automatically confirm bookings without manual approval
                </p>
              </div>
              <input type="checkbox" className="w-6 h-6" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Require deposit</p>
                <p className="text-sm text-text-secondary">
                  Require customers to pay a deposit when booking
                </p>
              </div>
              <input type="checkbox" className="w-6 h-6" />
            </div>

            <Input
              label="Minimum advance booking (hours)"
              type="number"
              defaultValue="2"
            />

            <Input
              label="Maximum advance booking (days)"
              type="number"
              defaultValue="60"
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-heading font-semibold mb-4">
            Subscription
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-text-secondary mb-2">Current Plan</p>
              <p className="text-2xl font-heading font-bold">
                {business?.rezvo_tier || 'Free'}
              </p>
            </div>

            <Button variant="outline">
              Upgrade Plan
            </Button>
          </div>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button variant="secondary">
            Cancel
          </Button>
          <Button variant="primary" loading={saving} onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Settings
