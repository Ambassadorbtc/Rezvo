import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../utils/api'
import Card from '../../components/shared/Card'

const CategoryHub = () => {
  const { category, location } = useParams()
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBusinesses()
  }, [category, location])

  const fetchBusinesses = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category) params.append('category', category)
      if (location) params.append('location', location)

      const response = await api.get(`/directory/search?${params.toString()}`)
      setBusinesses(response.results || [])
    } catch (error) {
      console.error('Failed to fetch businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  const categoryNames = {
    restaurants: 'Restaurants',
    barbers: 'Barbers',
    salons: 'Salons',
    spas: 'Spas'
  }

  const title = location
    ? `${categoryNames[category]} in ${location}`
    : categoryNames[category]

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-heading font-bold mb-8">{title}</h1>

      {businesses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-text-secondary mb-4">No businesses found</p>
          <Link to="/" className="text-forest hover:text-forest-90">
            Back to home
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <Card key={business._id}>
              <div className="aspect-video bg-gradient-to-br from-forest-30 to-forest-50 rounded-lg mb-4"></div>
              
              <h3 className="text-xl font-heading font-semibold mb-2">
                <Link
                  to={`/${business.category}/${business.location_id}/${business.slug}`}
                  className="hover:text-forest"
                >
                  {business.name}
                </Link>
              </h3>
              
              <p className="text-text-secondary text-sm mb-3">{business.address}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {business.rating && (
                    <>
                      <span className="text-gold mr-1">★</span>
                      <span className="font-medium">{business.rating}</span>
                      <span className="text-text-secondary text-sm ml-1">
                        ({business.review_count})
                      </span>
                    </>
                  )}
                </div>
                
                {business.price_level && (
                  <span className="text-sage">
                    {'£'.repeat(business.price_level)}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default CategoryHub
