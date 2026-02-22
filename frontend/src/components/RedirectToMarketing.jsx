import { useEffect } from 'react'

/**
 * On rezvo.app, the directory/consumer pages should never show.
 * Redirect to the marketing homepage (full page load so nginx serves it).
 */
const RedirectToMarketing = () => {
  useEffect(() => {
    window.location.replace('/')
  }, [])
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
    </div>
  )
}

export default RedirectToMarketing
