// import '../styles/globals.css'

// import here for global compponent
import '../styles/global.scss'

import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'

// gor stlyes per compoennt - create css modules 

// function MyApp({ Component, pageProps }) {
//   return <Component {...pageProps} />
// }

// export default MyApp
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}