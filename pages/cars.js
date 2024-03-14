// import {gql} from '@apollo/client'
// import Head from 'next/head' 
// import client from '../apolloClient'
// import Layout, { siteTitle } from '../components/layout_bikes'
// import NavBikes from '../components/nav_bikes'
// import Link from 'next/link'
// import Image from 'next/image'

// export default function Cars({cars}) {

//   return (
//     <Layout bikes>
//       <Head>
//         <title>Jon Williams | Cars</title>
//       </Head>
//       <NavBikes />

//       <section className="hero">
//          <div className="hero-body">
//            <div className="container">
//              <div className="content is-medium">
//                <div className="block mb-6 mt-6">
//                  <h1>Cars</h1>
//                </div>
//                <div class="columns">
//                 {cars.map((car, i) => (
//                    <div class="column is-one-quarter cursor-hand">
//                      <Link href={`/cars/${car.slug}`}>
//                        <div class="card">
//                          <div class="card-image">
//                               <Image
//                                  priority
//                                  src={car.image.url}
//                                  height={480}
//                                  width={640}
//                                  alt="{bike.title}"
//                                />
//                          </div>
//                          <div class="card-content">
//                            <div class="content">
//                              <p class="title is-4">{car.title}</p>
//                            </div>
//                          </div>
//                        </div>
//                      </Link>
//                    </div>
//                  ))}
//                </div>
//              </div>
//            </div>
//          </div>            
//        </section>
//     </Layout>
//   )
// }

// export async function getStaticProps() {

//   const {data} = await client.query({
//     query: gql`
//       query {
//         cars {
//           id
//           title
//           slug
//           image {
//             url
//           }
//         }
//       }
//     `
//   })

//   const {cars} = data; 

//   return {
//     props: {
//       cars
//     }
//   }
// }
