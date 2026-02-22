import { Outlet, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { isRezvoApp } from '../../utils/domain'
import RedirectToMarketing from '../RedirectToMarketing'

const PublicLayout = () => {
  const { isAuthenticated, user } = useAuth()

  if (isRezvoApp()) return <RedirectToMarketing />

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-heading font-bold text-forest">Rezvo</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/restaurants" className="text-text hover:text-forest transition-colors">
                Restaurants
              </Link>
              <Link to="/barbers" className="text-text hover:text-forest transition-colors">
                Barbers
              </Link>
              <Link to="/salons" className="text-text hover:text-forest transition-colors">
                Salons
              </Link>
              <Link to="/spas" className="text-text hover:text-forest transition-colors">
                Spas
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {user?.role === 'owner' && (
                    <Link to="/dashboard" className="btn-primary">
                      Dashboard
                    </Link>
                  )}
                  <Link to="/profile" className="text-text hover:text-forest">
                    {user?.name}
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-forest hover:text-forest-90 font-medium">
                    Log in
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-forest text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-heading font-bold text-xl mb-4">Rezvo</h3>
              <p className="text-white/80">Your High Street, Booked</p>
            </div>
            
            <div>
              <h4 className="font-heading font-semibold mb-4">For Diners</h4>
              <ul className="space-y-2">
                <li><Link to="/restaurants" className="text-white/80 hover:text-white">Find Restaurants</Link></li>
                <li><Link to="/barbers" className="text-white/80 hover:text-white">Find Barbers</Link></li>
                <li><Link to="/salons" className="text-white/80 hover:text-white">Find Salons</Link></li>
                <li><Link to="/spas" className="text-white/80 hover:text-white">Find Spas</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-heading font-semibold mb-4">For Business</h4>
              <ul className="space-y-2">
                <li><Link to="/list-your-business" className="text-white/80 hover:text-white">List Your Business</Link></li>
                <li><Link to="/pricing" className="text-white/80 hover:text-white">Pricing</Link></li>
                <li><Link to="/features" className="text-white/80 hover:text-white">Features</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-heading font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-white/80 hover:text-white">About</Link></li>
                <li><Link to="/contact" className="text-white/80 hover:text-white">Contact</Link></li>
                <li><Link to="/privacy" className="text-white/80 hover:text-white">Privacy</Link></li>
                <li><Link to="/terms" className="text-white/80 hover:text-white">Terms</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/20 text-center text-white/60">
            <p>&copy; 2026 Rezvo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PublicLayout
