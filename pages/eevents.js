import {gql} from '@apollo/client'
import Head from 'next/head' 
import client from '../apolloClient'
import Layout, { siteTitle } from '../components/layout_bikes'
import Link from 'next/link'
import Image from 'next/image'

export default function Events({bikessss}) {

  // console.log("bikessss");
  // console.log(bikessss);

  return (
    <Layout bikes>
      <Head>
        <title>Engine Events</title>
      </Head>
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

  const {bikessss} = data; 
  // console.log(bikessss);

  return {
    props: {
      bikessss
    }
  }
}
