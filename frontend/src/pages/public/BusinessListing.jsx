import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../utils/api'
import Card from '../../components/shared/Card'
import Button from '../../components/shared/Button'

const BusinessListing = () => {
  const { slug } = useParams()
  const [business, setBusiness] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBusiness()
  }, [slug])

  const fetchBusiness = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/directory/search?query=${slug}`)
      if (response.results && response.results.length > 0) {
        const businessData = response.results[0]
        setBusiness(businessData)
        
        if (businessData._id) {
          const reviewsResponse = await api.get(`/reviews/business/${businessData._id}`)
          setReviews(reviewsResponse.results || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch business:', error)
    } finally {
      setLoading(false)
    }
  }

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

  if (!business) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-lg text-text-secondary">Business not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="aspect-video bg-gradient-to-br from-forest-30 to-forest-50 rounded-card mb-6"></div>

          <h1 className="text-4xl font-heading font-bold mb-4">{business.name}</h1>

          <div className="flex items-center space-x-6 mb-6">
            {business.rating && (
              <div className="flex items-center">
                <span className="text-gold text-xl mr-1">★</span>
                <span className="font-semibold text-lg">{business.rating}</span>
                <span className="text-text-secondary ml-2">
                  ({business.review_count} reviews)
                </span>
              </div>
            )}
            
            {business.price_level && (
              <span className="text-sage font-medium">
                {'£'.repeat(business.price_level)}
              </span>
            )}
          </div>

          <p className="text-text-secondary mb-4">{business.address}</p>

          {business.editorial_summary && (
            <p className="text-text mb-8">{business.editorial_summary}</p>
          )}

          <div className="border-t border-border pt-8">
            <h2 className="text-2xl font-heading font-bold mb-6">Reviews</h2>
            
            {reviews.length === 0 ? (
              <p className="text-text-secondary">No reviews yet</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review._id}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{review.user_name || 'Anonymous'}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-gold">
                            {'★'.repeat(review.rating)}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm text-text-secondary">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {review.body && <p className="text-text-secondary">{review.body}</p>}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <h3 className="text-xl font-heading font-semibold mb-4">Book a Table</h3>
            
            {business.claimed ? (
              <div className="space-y-4">
                <input
                  type="date"
                  className="input"
                  min={new Date().toISOString().split('T')[0]}
                />
                
                <select className="input">
                  <option>Select time</option>
                  <option>12:00 PM</option>
                  <option>12:30 PM</option>
                  <option>1:00 PM</option>
                  <option>1:30 PM</option>
                </select>
                
                <select className="input">
                  <option>Party size</option>
                  <option>1 person</option>
                  <option>2 people</option>
                  <option>3 people</option>
                  <option>4 people</option>
                </select>
                
                <Button variant="primary" className="w-full">
                  Book Now
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-text-secondary mb-4">
                  This business doesn't accept online bookings yet.
                </p>
                {business.phone && (
                  <p className="font-medium mb-4">
                    Call: {business.phone}
                  </p>
                )}
                <Button variant="outline" className="w-full">
                  Notify me when available
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default BusinessListing
