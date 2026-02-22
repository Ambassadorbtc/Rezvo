/**
 * Domain silos — rezvo.app and rezvo.co.uk are separate frontends.
 * Treat as if on different servers. Use this as the single source of truth.
 *
 * rezvo.app = marketing + partner booking portal (NO consumer directory)
 * rezvo.co.uk = consumer directory + search + booking
 */

export const DOMAIN_REZVO_APP = 'rezvo.app'
export const DOMAIN_REZVO_CO_UK = 'rezvo.co.uk'

/** Current domain: 'rezvo.app' | 'rezvo.co.uk' | null (SSR/unknown) */
export const getDomain = () => {
  if (typeof window === 'undefined') return null
  const h = window.location.hostname
  if (h === 'rezvo.app' || h === 'www.rezvo.app') return DOMAIN_REZVO_APP
  if (h === 'rezvo.co.uk' || h === 'www.rezvo.co.uk') return DOMAIN_REZVO_CO_UK
  return null
}

/** rezvo.app = marketing + booking app only */
export const isRezvoApp = () => getDomain() === DOMAIN_REZVO_APP

/** rezvo.co.uk = consumer directory + booking */
export const isRezvoCoUk = () => getDomain() === DOMAIN_REZVO_CO_UK

/** Domain-specific config. Use for links, defaults, support email. */
export const getDomainConfig = () => {
  const d = getDomain()
  const base = typeof window !== 'undefined' ? window.location.origin : null
  if (d === DOMAIN_REZVO_APP) {
    return {
      domain: DOMAIN_REZVO_APP,
      baseUrl: base || 'https://rezvo.app',
      supportEmail: 'support@rezvo.app',
      bookingPathPrefix: '/book/',
    }
  }
  if (d === DOMAIN_REZVO_CO_UK) {
    return {
      domain: DOMAIN_REZVO_CO_UK,
      baseUrl: base || 'https://rezvo.co.uk',
      supportEmail: 'support@rezvo.app',
      bookingPathPrefix: '/book/',
    }
  }
  return {
    domain: null,
    baseUrl: base || '',
    supportEmail: 'support@rezvo.app',
    bookingPathPrefix: '/book/',
  }
}
