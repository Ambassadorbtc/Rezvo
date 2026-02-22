/**
 * Check if we're on the rezvo.app domain (partner/booking portal).
 * rezvo.app = marketing + booking app only (NO consumer directory)
 * rezvo.co.uk = consumer directory + booking
 */
export const isRezvoApp = () => {
  if (typeof window === 'undefined') return false
  const h = window.location.hostname
  return h === 'rezvo.app' || h === 'www.rezvo.app'
}
