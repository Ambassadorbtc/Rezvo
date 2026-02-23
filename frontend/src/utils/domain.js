/**
 * Domain config for Rezvo directory (rezvo.co.uk).
 */

export const isRezvoApp = () => false
export const isRezvoCoUk = () => true

export const getDomainConfig = () => ({
  domain: 'rezvo.co.uk',
  baseUrl: 'https://rezvo.co.uk',
  supportEmail: 'support@rezvo.app',
  bookingPathPrefix: '/book/',
})
