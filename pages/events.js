import {gql} from '@apollo/client'
import Head from 'next/head' 
import client from '../apolloClientEngine'
import Layout, { siteTitle } from '../components/layout_bikes'
import NavBikes from '../components/nav_bikes'
import Link from 'next/link'
import Image from 'next/image'

export default function Events({events}) {

  return (
    <Layout bikes>
      <Head>
        <title>Jon Williams | Events</title>
      </Head>
      <NavBikes />

      <section className="hero">
         <div className="hero-body">
           <div className="container">
             <div className="content is-medium">
               <div className="block mb-6 mt-6">
                 <h1>Events</h1>
               </div>
                {events.map((event, i) => (
                     <div class="card mb-5">
                       <div class="card-content">
                         <div class="content">
                           <p class="title is-4">{event.title}</p>
                           {/*<p>{event.content}</p>*/}
                         </div>
                       </div>
                     </div>
                 ))}
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
        events(connectionPass:"fd9e310e506863eccbafba3f4d99c877") {
          id
          slug
          title
          content
        }
      }
    `
  })

  const {events} = data; 
  // console.log(bikes);

  return {
    props: {
      events
    }
  }
}
