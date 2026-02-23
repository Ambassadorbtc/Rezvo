import { Link } from 'react-router-dom'
import Navbar from '../../components/directory/Navbar'
import SEO from '../../components/seo/SEO'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-cream">
      <SEO title="Page Not Found" noindex />
      <Navbar />
      <div className="pt-32 pb-20 text-center px-6">
        <div className="text-8xl font-heading font-extrabold text-forest/10 mb-4">404</div>
        <h1 className="text-3xl font-heading font-extrabold text-forest mb-3">Page not found</h1>
        <p className="text-muted mb-8 font-body max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/" className="px-6 py-3 bg-forest text-white font-bold rounded-full hover:bg-sage transition-all">
            Go Home
          </Link>
          <Link to="/search" className="px-6 py-3 border-2 border-forest text-forest font-bold rounded-full hover:bg-forest/5 transition-all">
            Search
          </Link>
        </div>
      </div>
    </div>
  )
}
