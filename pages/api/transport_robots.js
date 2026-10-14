import { TRANSPORT_URL } from '../../lib/transport_domains'

export default function handler(req, res) {
    res.setHeader('Content-Type', 'text/plain')
    res.status(200).send(`User-agent: *
Disallow: /profit_calculator
Disallow: /api/

Sitemap: ${TRANSPORT_URL}/sitemap.xml
`)
}
