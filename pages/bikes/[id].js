import Layout, { siteTitle } from '../../components/layout'
import Image from 'next/image'
import Head from 'next/head'
import Date from '../../components/date'
import BikeGallery from '../../components/bike_gallery'
// import { getAllBikeIds, getBikeData } from '../../lib/bikes'
import { getAllBikeIds, getBikeData, getCollectionImages } from '../../lib/bikes'
import Link from 'next/link'
import Nav from '../../components/nav'
import indexStyles from '../../styles/index.module.scss'
import { sha256, sha224 } from 'js-sha256';

function bikeImageLoader({ src }) {
  return 'https://jwdev.free.resourcespace.com/' + src;
}

export default function Bike({ bikeData, bikeImages_pre }) {
  return (
    <Layout bikes>
    	<Head>
        <title>Jon Williams | {bikeData.make} {bikeData.model}</title>
      </Head>
      <Nav />
       <section className="hero">
        <div className="hero-body">
          <div className="container">
            <div className="content is-medium">

            <div class="columns is-mobile">
              <div class="column is-three-fifths is-offset-one-fifth">

                <div className="block mb-6 mt-6">
                  <h1>{bikeData.make} {bikeData.model}</h1>
                  <p>
                    {bikeData.year}<br />
                    {bikeData.km}<br />
                    {bikeData.price}<br />
                  </p>
                   <Image
                      priority
                      loader={bikeImageLoader}
                      src={bikeData.previewImage_pre}
                      height={800}
                      width={1067}
                      alt={bikeData.make + " " +  bikeData.model}
                    />
                  <p>
                    <div dangerouslySetInnerHTML={{ __html: bikeData.contentHtml }} />
                  </p>

                </div>

              </div>
            </div>
                  
            </div>
          </div>
        </div>            
      </section>

      <section className="hero">
        <div className="hero-body">
          <div className="container">
            <div className="content">
              <div class="columns is-multiline is-variable is-1">
                {bikeImages_pre.map(img => {
                  return (
                    <div class="column is-one-fifth pb-0 pt-0">
                      <Image
                        priority
                        src={img[1]}
                        height={480}
                        width={640}
                        alt={bikeData.make + " " +  bikeData.model}
                      />
                    </div>
                  );
                })}
              </div>  
            </div>
          </div>
        </div>            
      </section>
    </Layout>
  )
}

export async function getStaticPaths() {
  const paths = getAllBikeIds()
  return {
    paths,
    fallback: false
  }
}

// getStaticProps (Static Generation)
// getServerSideProps (Server-side Rendering)
export async function getStaticProps({ params }) {
  
  const bikeData = await getBikeData(params.id)
  const bikeImages_pre = await getCollectionImages(5)

  const bikeImagesArr_pre = [];
  for(var i in bikeImages_pre.resourcePaths_pre.data)
    bikeImagesArr_pre.push( [ i, bikeImages_pre.resourcePaths_pre.data[i] ] );

  return {
    props: {
      bikeData: bikeData,
      bikeImages_pre: bikeImagesArr_pre
    }
  }
}


