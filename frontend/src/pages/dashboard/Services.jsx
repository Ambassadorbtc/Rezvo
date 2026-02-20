import { useState, useEffect } from 'react'
import { useTier } from '../../contexts/TierContext'
import api from '../../utils/api'
import Card from '../../components/shared/Card'
import Button from '../../components/shared/Button'

const Services = () => {
  const { business } = useTier()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (business?._id) {
      fetchServices()
    }
  }, [business])

  const fetchServices = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/services/business/${business._id}/services`)
      setServices(response)
    } catch (error) {
      console.error('Failed to fetch services:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest mx-auto"></div>
        <p className="mt-4 text-text-secondary">Loading services...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Services</h1>
          <p className="text-text-secondary">
            {services.length} {services.length === 1 ? 'service' : 'services'}
          </p>
        </div>

        <Button variant="primary">
          Add Service
        </Button>
      </div>

      {services.length === 0 ? (
        <Card>
          <p className="text-center text-text-secondary py-8">
            No services yet. Add your first service!
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {services.map((service) => (
            <Card key={service.id}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{service.name}</h3>
                  {service.description && (
                    <p className="text-text-secondary text-sm mb-2">
                      {service.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-forest font-medium">
                      £{service.price.toFixed(2)}
                    </span>
                    <span className="text-text-secondary">
                      {service.duration_minutes} minutes
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="btn-secondary text-sm">
                    Edit
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

export default Services
