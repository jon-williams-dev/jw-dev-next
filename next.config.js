module.exports = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.graphassets.com' },
    ],
  },
  turbopack: {},
  // Plain HTML pages in public/, served at their folder's address without /index.html.
  async rewrites() {
    return [
      { source: '/6/en/verbs/single-past', destination: '/6/en/verbs/single-past/index.html' },
    ]
  },
}
