import React, { useState, useCallback } from "react";
import Carousel, { Modal, ModalGateway } from "react-images";

import Layout, { siteTitle } from '../../components/layout_bikes'
import Image from 'next/image'
import Head from 'next/head'
import Date from '../../components/date'
// import { getAllBikeIds, getBikeData } from '../../lib/bikes'
import { getAllBikeIds, getBikeData, getCollectionImages } from '../../lib/bikes'
import Link from 'next/link'
import NavBikes from '../../components/nav_bikes'

import indexStyles from '../../styles/index.module.scss'

import { sha256, sha224 } from 'js-sha256';
import Gallery from "react-photo-gallery";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendar } from '@fortawesome/free-solid-svg-icons'


function bikeImageLoader({ src }) {
  return 'https://jwdev.free.resourcespace.com/' + src;
}

export default function Bike({ bikeData, bikeImages, bikeImages2 }) {

  const [currentImage, setCurrentImage] = useState(0);
  const [viewerIsOpen, setViewerIsOpen] = useState(false);

  const openLightbox = useCallback((event, { photo, index }) => {
    setCurrentImage(index);
    setViewerIsOpen(true);
  }, []);

  const closeLightbox = () => {
    setCurrentImage(0);
    setViewerIsOpen(false);
  };

  return (
    <Layout bikes>
    	<Head>
        <title>Jon Williams | {bikeData.make} {bikeData.model}</title>
      </Head>
      <NavBikes />
       <section className="hero">
        <div className="hero-body">
          <div className="container">
            <div className="content is-medium">

            <div class="columns">
              <div class="column is-three-fifths is-offset-one-fifth">

                <div className="block mb-6 mt-6">
                  <h1>{bikeData.make} {bikeData.model}</h1>
                   <Image
                      priority
                      loader={bikeImageLoader}
                      src={bikeData.previewImage_pre}
                      height={800}
                      width={1067}
                      alt={bikeData.make + " " +  bikeData.model}
                    />
                    <h3>{bikeData.header}</h3>
                    

                    {bikeData.quote ? <blockquote className="has-text-grey"><i>{bikeData.quote}</i></blockquote> : ''}


                    <h4>Specs:</h4>
                    <table class="table">
                      <tbody>
                        {/*<tr>
                          <td className="table-col-bike-width">Price</td>
                          <td> {bikeData.price}</td>
                        </tr>*/}
                        <tr>
                          <td>Make</td>
                          <td>{bikeData.make}</td>
                        </tr>
                         <tr>
                          <td>Model</td>
                          <td>{bikeData.model}</td>
                        </tr>
                         <tr>
                          <td>Year</td>
                          <td>{bikeData.year}</td>
                        </tr>
                        <tr>
                          <td>Mileage</td>
                          <td>{bikeData.km}</td>
                        </tr>
                        <tr>
                          <td>Color</td>
                          <td>{bikeData.color}</td>
                        </tr>
                        {/*<tr>
                          <td>Location</td>
                          <td>{bikeData.location}</td>
                        </tr>*/}
                      </tbody>
                    </table>
                    <h4>Description:</h4>
                    <p><div dangerouslySetInnerHTML={{ __html: bikeData.contentHtml }} /></p>
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
              {/*<Gallery photos={bikeImages2} />*/}
               <Gallery photos={bikeImages2} onClick={openLightbox} columns={6} />
                <ModalGateway>
                  {viewerIsOpen ? (
                    <Modal onClose={closeLightbox}>
                      <Carousel
                        currentIndex={currentImage}
                        views={bikeImages2.map(x => ({
                          ...x,
                          srcset: x.srcSet,
                          caption: x.title
                        }))}
                      />
                    </Modal>
                  ) : null}
                </ModalGateway>
              

              

{/*              <div class="columns is-multiline is-variable is-1">


                {bikeImages.map(img => {
                  return (
                    <div class="column is-one-fifth pb-0 pt-0">
                      <Image
                        loader={bikeImageLoader}
                        src={img[0]["url_pre"]}
                        width={640}
                        height={480}
                        blurDataURL={img[0]["url_col"]}
                        placeholder="blur"
                        alt={bikeData.make + " " +  bikeData.model}
                      />
                    </div>
                  );
                })}
              </div>  */}
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
  const bikeImages = await getCollectionImages(bikeData.resourceSpaceCollection)

  const bikeImagesArr = [];
  const bikeImagesArr2 = await [];

  for(var i in bikeImages.resourcePaths_pre.data) {
    // bikeImagesArr.push( [ i, bikeImages.resourcePaths_pre.data[i] ] );
    bikeImagesArr.push(
      [{
        "ref": i, 
        "url_col": bikeImages.resourcePaths_col.data[i].replace("https://jwdev.free.resourcespace.com/", ""),
        "url_pre": bikeImages.resourcePaths_pre.data[i].replace("https://jwdev.free.resourcespace.com/", ""),
        "url_scr": bikeImages.resourcePaths_scr.data[i].replace("https://jwdev.free.resourcespace.com/", "")
      }] 
    );


    bikeImagesArr2.push(
        {
          "src": bikeImages.resourcePaths_scr.data[i],
          "srcSet": [
            bikeImages.resourcePaths_col.data[i] + " 100w",
            bikeImages.resourcePaths_pre.data[i] + " 640w",
            bikeImages.resourcePaths_scr.data[i] + " 1067w"
          ],
          sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
          width: 1,
          height: 1
        }
    );



    // src: "https://source.unsplash.com/2ShvY8Lf6l0/1600x1200",
    
    // sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
    // width: 4,
    // height: 3
  }

  console.log(bikeImagesArr2)

    return {
      props: {
        bikeData: bikeData,
        bikeImages: bikeImagesArr,
        bikeImages2: bikeImagesArr2
      }
    }
}


{/*<div class="column">{img[0]["url_pre"]}</div>*/}