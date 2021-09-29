import Head from 'next/head'
import Image from 'next/image'
import Layout, { siteTitle } from '../components/layout'
import Link from 'next/link'
import Nav from '../components/nav'
import indexStyles from '../styles/index.module.scss'
import Date from '../components/date'
import { getBikesData } from '../lib/bikes'

function bikeImageLoader({ src }) {
  return 'https://jwdev.free.resourcespace.com/' + src;
}

export default function Bikes ({ allBikesData }) {

  return (
    <Layout bikes>
      <Head>
        <title>Jon Williams | Bikes</title>
      </Head>
      <Nav />
      <section className="hero">
        <div className="hero-body">
          <div className="container">
            <div className="content is-medium">
              <div className="block mb-6 mt-6">
                <h1>Bikes</h1>
                <p>I love motorbikes and usually have a few in the garage, most of which are for sale, and some of which are listed below.</p>
                <p>If you are interested in any of the bikes on this page, have a look. I try to add an honest description and as many details and photos as possible, but if you have further questions regarding any of the bikes please get in touch: <a href="mailto:jon.williams@hey.com">jon.williams@hey.com</a>.</p>
                <p>I'm always looking for new bikes and have a specific interest in 90s Sport Bikes (although am open to anything). If you have something interesting, <a href="mailto:jon.williams@hey.com">let me know</a>.</p>
              </div>
              <div class="columns">
               {allBikesData.map(({ id, make, model, year, previewImage_pre }) => (
                  <div class="column is-one-quarter">
                    <Link href={`/bikes/${id}`}>
                      <div class="card">
                        <div class="card-image">
                             <Image
                                priority
                                loader={bikeImageLoader}
                                src={previewImage_pre}
                                height={480}
                                width={640}
                                alt="{make}"
                              />
                        </div>
                        <div class="card-content">
                          <div class="content">
                            <p class="title is-4">{make} {model}</p>
                            <p class="subtitle is-6">{year}</p>
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

  const allBikesData = getBikesData()

  return {
    props: {
      allBikesData
    }
  }
}