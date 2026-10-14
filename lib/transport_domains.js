export const TRANSPORT_HOST = 'jw-motorrad-transport.de'
export const TRANSPORT_URL = `https://${TRANSPORT_HOST}`
export const TRANSPORT_ALIAS_HOSTS = ['jw-motorcycle-transport.com', 'jw-motorrad-transport.eu']
export const MAIN_HOST = 'jon-williams.dev'

// `path` is the Next.js page route; `publicPath` is the URL on the transport domain.
export const TRANSPORT_PAGES = {
    en: { path: '/transport', publicPath: '/en' },
    de: { path: '/transport/de', publicPath: '/' },
}

// Other routes that should keep working on the transport domain.
export const TRANSPORT_EXTRA_PATHS = ['/profit_calculator', '/api/quote', '/api/route_plan']
