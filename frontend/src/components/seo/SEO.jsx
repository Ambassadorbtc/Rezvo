import { Helmet } from 'react-helmet-async'

const SITE = {
  name: 'Rezvo',
  url: 'https://rezvo.co.uk',
  tagline: 'Your High Street, Booked',
  description: 'Discover and book the best independent restaurants, salons, barbers, and spas across the UK. Zero commission. Real-time availability.',
}

export default function SEO({
  title,
  description,
  path = '',
  type = 'website',
  image = '/images/og-default.jpg',
  noindex = false,
  schema,
}) {
  const pageTitle = title ? `${title} | ${SITE.name}` : `${SITE.name} — ${SITE.tagline}`
  const pageDesc = description || SITE.description
  const canonical = `${SITE.url}${path}`

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDesc} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDesc} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={`${SITE.url}${image}`} />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:locale" content="en_GB" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDesc} />
      <meta name="twitter:image" content={`${SITE.url}${image}`} />

      {/* Schema.org JSON-LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  )
}

export { SITE }
