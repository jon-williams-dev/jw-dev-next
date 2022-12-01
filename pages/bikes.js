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
                 <p>I love motorbikes and usually have a few in the garage, some of which id consider letting go to make space for others (listed below):</p>
                 <p>I try to add an honest description with as many details and photos as possible, however, if you have further questions <a href="mailto:jon.williams@hey.com">get in touch</a>.</p>
                 <p>
                  I'm always interested in (and looking for) new bikes and have a specific interest in 90s Sport Bikes (although am open to anything).<br />
                  If you have something interesting that you would like to move on, <a href="mailto:jon.williams@hey.com">let me know</a>.
                 </p>
               </div>
               <div class="columns">
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
                             {/*<p class="subtitle is-6">{bike.year}</p>*/}
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
        bikes(orderBy: order_ASC) {
          title
          slug
          make
          model
          year
          mileage
          price
          color
          color_hex {
            hex
          }
          header
          quote
          description {
            markdown
          }
          image {
            url
          }
        }
      }
    `
  })

  const {bikes} = data; 
  // console.log(bikes);

  return {
    props: {
      bikes
    }
  }
}
