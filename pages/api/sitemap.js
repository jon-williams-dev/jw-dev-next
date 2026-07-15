const BASE = 'https://jon-williams.dev'

const PAGES = [
  { path: '/',             priority: '1.0', changefreq: 'weekly'  },
  { path: '/beacon',       priority: '1.0', changefreq: 'weekly'  },
  { path: '/beacon-story', priority: '0.8', changefreq: 'monthly' },
  { path: '/bikes',        priority: '0.7', changefreq: 'weekly'  },
  { path: '/transport',    priority: '0.7', changefreq: 'monthly' },
  { path: '/profile',      priority: '0.5', changefreq: 'monthly' },
]

export default function handler(req, res) {
  const now = new Date().toISOString().split('T')[0]

  const urls = PAGES.map(p => `
  <url>
    <loc>${BASE}${p.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`

  res.setHeader('Content-Type', 'application/xml')
  res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600')
  res.status(200).send(xml)
}
