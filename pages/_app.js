// import '../styles/globals.css'

// import here for global compponent
import '../styles/global.scss'

// import { config } from '@fortawesome/fontawesome-svg-core'
// import '@fortawesome/fontawesome-svg-core/styles.css'
// // You change this configuration value to false so that the Font Awesome core SVG library will not try and insert <style> elements into the <head> of the page. Next.js blocks this from happening anyway so you might as well not even try.
// config.autoAddCss = false

// gor stlyes per compoennt - create css modules 

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

// export default MyApp
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}