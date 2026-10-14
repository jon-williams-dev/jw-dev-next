import { TRANSPORT_PAGES, TRANSPORT_URL } from '../../lib/transport_domains'

export default function handler(req, res) {
    const lastmod = new Date().toISOString().split('T')[0]
    const pages = Object.entries(TRANSPORT_PAGES)
    const alternates = pages
        .map(([lang, { publicPath }]) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${TRANSPORT_URL}${publicPath}"/>`)
        .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${TRANSPORT_URL}${TRANSPORT_PAGES.en.publicPath}"/>`)
        .join('\n')

    const urls = pages.map(([, { publicPath }]) => `
  <url>
    <loc>${TRANSPORT_URL}${publicPath}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
${alternates}
  </url>`).join('')

    res.setHeader('Content-Type', 'application/xml')
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600')
    res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}
</urlset>`)
}
