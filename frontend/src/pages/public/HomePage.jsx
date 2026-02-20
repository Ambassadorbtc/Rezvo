import { Link } from 'react-router-dom'
import { useState } from 'react'

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const categories = [
    { name: 'Restaurants', slug: 'restaurants', icon: '🍽️' },
    { name: 'Barbers', slug: 'barbers', icon: '💈' },
    { name: 'Salons', slug: 'salons', icon: '💅' },
    { name: 'Spas', slug: 'spas', icon: '🧖' }
  ]

  return (
    <div>
      <section className="bg-gradient-to-br from-forest to-forest-70 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">
            Your High Street, Booked
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-white/90">
            Discover and book local restaurants, barbers, salons, and spas
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-pill p-2 flex items-center shadow-lg">
              <input
                type="text"
                placeholder="Search for a business or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-6 py-3 bg-transparent text-text placeholder-text-placeholder focus:outline-none"
              />
              <Link
                to={`/search?q=${searchQuery}`}
                className="bg-forest hover:bg-forest-90 text-white px-8 py-3 rounded-pill font-medium transition-colors"
              >
                Search
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-heading font-bold text-center mb-12">
            Browse by Category
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.slug}
                to={`/${category.slug}`}
                className="card hover:shadow-xl transition-all duration-200 text-center"
              >
                <div className="text-6xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-heading font-semibold text-forest">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-forest-30/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-heading font-bold mb-6">
                For Business Owners
              </h2>
              <p className="text-lg text-text-secondary mb-8">
                Get more bookings, manage your business, and grow your customer base with Rezvo's all-in-one platform.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-forest-50 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Online booking system</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-forest-50 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Customer management & CRM</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-forest-50 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Analytics & insights</span>
                </li>
              </ul>
              <Link to="/register" className="btn-primary">
                List Your Business
              </Link>
            </div>
            <div className="bg-white rounded-card shadow-card p-8">
              <div className="aspect-video bg-gradient-to-br from-forest-30 to-forest-50 rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
