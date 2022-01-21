module.exports = {
  images: {
    domains: ['jwdev.free.resourcespace.com'],
  },
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      // config.node = {
      //   fs: 'empty'
      // }
      {
        resolve: {
          fallback: {
            fs: false
          }
        }
      }

    }
    return config
  }
}