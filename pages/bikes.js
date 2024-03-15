import {gql} from '@apollo/client'
import Head from 'next/head' 
import client from '../apolloClient'
import Layout, { siteTitle } from '../components/layout_bikes'
import NavBikes from '../components/nav_bikes'
import Link from 'next/link'
import Image from 'next/image'

export default function Bikes({bikes}) {

  // console.log("bikes");
  // console.log(bikes);

  return (
    <Layout bikes>
      <Head>
        <title>Jon Williams | Bikes</title>
      </Head>
      <NavBikes />

      <section className="hero">
         <div className="hero-body">
           <div className="container">
             <div className="content is-medium">
               <div className="block mb-6 mt-6">
                 <h1>Bikes</h1>
                 <p>I have a passion for motorcycles and typically keep several in the garage. Occasionally, I consider parting with some to make room for new additions (listed below)</p>
                 <p>I make sure to provide an honest description, along with ample details and photos. However, should you have any additional questions, feel free to  <a href="mailto:jon.williams@hey.com"> reach out</a>.</p>
                 <p>
                  I'm always interested in (and looking for) new bikes, particularly 90s Sport Bikes, although I'm open to anything intriguing.<br />
                  If you're considering parting ways with something interesting, I'd love to <a href="mailto:jon.williams@hey.com">hear from you</a>.
                 </p>
               </div>
               <div class="columns is-multiline is-mobile">
                {bikes.map((bike, i) => (
                   <div class="column is-one-quarter cursor-hand">
                     <Link href={`/bikes/${bike.slug}`}>
                       <div class="card">
                         <div class="card-image">
                              <Image
                                 priority
                                 src={bike.image.url}
                                 height={480}
                                 width={640}
                                 alt="{bike.title}"
                               />
                         </div>
                         <div class="card-content">
                           <div class="content">
                             <p class="title is-4">{bike.title}</p>
                           </div>
                         </div>
                       </div>
                     </Link>
                   </div>
                 ))}
               </div>
             </div>
           </div>
         </div>            
       </section>
    </Layout>
  )
}


export async function getStaticProps() {

  const {data} = await client.query({
    query: gql`
      query {
        bikes {
          id
          title
          slug
          image {
            url
          }
        }
      }
    `
  })

  const {bikes} = data; 
  console.log(bikes);

  return {
    props: {
      bikes
    }
  }
}
