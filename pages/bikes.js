// import {gql} from '@apollo/client'
import Head from 'next/head' 
import Link from 'next/link'
import client from '../apolloClient'

export default function Bikes({bikes}) {

  console.log(bikes);

  return (
    <div>
      <Head>
        <title>Jon Williams | Bikes</title>
      </Head>
      <h1>Bikes</h1>
    </div>
  )
}


export async function getStaticProps() {

  const {data: bikes} = await client.query({
    query: gql`
      query {
        bikes {
          title
          slug
          make
          model
          year
          mileage
          price
          color
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

  console.log(bikes);

  return {
    props: {
      bikes
    }
  }
}



