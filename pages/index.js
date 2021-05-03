// import Head from 'next/head'
// import Image from 'next/image'
// import styles from '../styles/Home.module.css'
// import Link from 'next/link'


// export default function Home() {
//   return (
//     <div className={styles.container}>
//       <Head>
//         <title>Jon Williams</title>
//         <meta name="description" content="Jon Williams Full Stack Web Developer" />
//         <meta name="keywords" content="web,developer,web developer,full stack,freelance,freelancer,tuebingen,tübingen,germany,uk,england,ruby,rails,ruby on rails,ror,hotwire,react,next,html,css,javascript" />
//         <link rel="icon" href="/favicon.ico" />
//       </Head>

//       <main className={styles.main}>
//         {/*<h1 className={styles.title}>
//           Jon Williams
//         </h1>*/}

//         <h1 className="title">
//           Jon Williams{' - '}
//           <Link href="/profile">
//             <a>Profile</a>
//           </Link>
//         </h1>
//       </main>

//       <footer className={styles.footer}>
       
//       </footer>
//     </div>
//   )
// }



import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'


export default function Home() {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
         <Link href="/profile">
          <a>Profile</a>
         </Link>
      </section>
    </Layout>
  )
}