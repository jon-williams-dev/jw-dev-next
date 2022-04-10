

// import style from '../../../styles/profile.module.scss'
// import profileStyles from '../../../styles/profile.module.scss'

import Head from 'next/head'
import React, { useState, useCallback } from "react";
import Carousel, { Modal, ModalGateway } from "react-images";
import Layout from '../../../components/layout_blank'
import Image from 'next/image'
import indexStyles from '../../../styles/index.module.scss'
import { sha256, sha224 } from 'js-sha256';
import Gallery from "react-photo-gallery";




export default function GaragePlans({planImages}) {

  const photos = [
    { src: '/images/garage/plans/1.png',width: 1,height: 1 },
    { src: '/images/garage/plans/2.png',width: 1,height: 1 },
    { src: '/images/garage/plans/3.png',width: 1,height: 1 },
    { src: '/images/garage/plans/4.png',width: 1,height: 1 },
    // { src: '/images/garage/plans/5.png',width: 1,height: 1 },
    { src: '/images/garage/plans/6.png',width: 1,height: 1 },
    { src: '/images/garage/plans/7.png',width: 1,height: 1 },
    { src: '/images/garage/plans/8.png',width: 1,height: 1 },
    { src: '/images/garage/plans/9.png',width: 1,height: 1 },
    { src: '/images/garage/plans/10.png',width: 1,height: 1 },
    { src: '/images/garage/plans/11.png',width: 1,height: 1 },
    { src: '/images/garage/plans/12.png',width: 1,height: 1 },
    { src: '/images/garage/plans/13.png',width: 1,height: 1 },
    { src: '/images/garage/plans/14.png',width: 1,height: 1 },
    { src: '/images/garage/plans/15.png',width: 1,height: 1 },
    { src: '/images/garage/plans/16.png',width: 1,height: 1 },
    { src: '/images/garage/plans/17.png',width: 1,height: 1 },
  ];

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
    <Layout profile>
      <div>
        <Head>
          <title>Jon Williams | Garage Plans</title>
        </Head>

        <div className="container">

          {/*<NavBikes />*/}

           <section className="hero">
            
              <div className="hero-body">
              <div className="container">
                <div className="content is-medium">

                <div className="columns">
                  <div className="column is-three-fifths is-offset-one-fifth">

                    <div className="block mb-6 mt-6">
                      <h1>Garage Plans <small>(Stäuperle 13)</small></h1>

                        <Image
                          priority
                          src="/images/garage/plans/teaser.png"
                          height={800}
                          width={1000}
                        />
                       {/* <Image
                          priority
                          src="/images/garage/plans/top-back-right.png"
                          height={1184}
                          width={1479}
                        />*/}

                        {/*<p>Garage extension on both left and right side. Extensions on both sides being wooden sheds with "Rhombusleiste" styled cladding. The roof should extene the complete construction (both garage and both sheds).</p>*/}
                       
                        <h3>Measurements</h3>
                        <p>
                          Measurements in cemntimeters.<br/>Measurements approximate.
                        </p>
                        <table className="table">
                          <tbody>
                            <tr>
                              <td>Roof Measurements <small>(view: top-down)</small></td>
                              <td>Shed Measurements <small>(view: bottom-up)</small></td>
                            </tr>
                            <tr>
                              <td><span className="tag is-info mr-2">T1</span> 350cm</td>
                              <td>Shed 1 <small>(Stäuperle 13)</small>:</td>
                            </tr>
                            <tr>
                              <td><span className="tag is-info mr-2">T2</span> 514cm</td>
                              <td><span className="tag is-primary mr-2">B1</span> 350cm</td>
                            </tr>
                            <tr>
                              <td><span className="tag is-info mr-2">T3</span> 1560cm</td>
                              <td><span className="tag is-primary mr-2">B2</span> 290cm</td>
                            </tr>
                            <tr>
                              <td><span className="tag is-info mr-2">T4</span> 1000cm</td>
                              <td>Shed 2 <small>(Stäuperle 13/1)</small>:</td>
                            </tr>
                            <tr>
                              <td><span className="tag is-info mr-2">T5</span> 360cm</td>
                              <td><span className="tag is-primary mr-2">B3</span> 460cm</td>
                            </tr>
                            <tr>
                              <td><span className="tag is-info mr-2">T6</span> 290cm</td>
                              <td><span className="tag is-primary mr-2">B4</span> 350cm</td>
                            </tr>
                            <tr>
                              <td><span className="tag is-info mr-2">T7</span> 100cm</td>
                            </tr>
                          </tbody>
                        </table>
                    </div>

                  </div>
                </div>
                      
                </div>
              </div>
              </div>
                      
          </section>

          

      </div>  

      <section className="hero">
      <div className="hero-body">
        <div className="container">
            <Gallery photos={photos} onClick={openLightbox} columns={6} />
            <ModalGateway>
              {viewerIsOpen ? (
                <Modal onClose={closeLightbox}>
                  <Carousel
                    currentIndex={currentImage}
                    views={photos.map(x => ({
                      ...x,
                      srcset: x.srcSet,
                      caption: x.title
                    }))}
                  />
                </Modal>
              ) : null}
            </ModalGateway>

            </div>
            </div>
        </section>
          
      </div>


    </Layout>
  )
}




export async function getStaticProps() {

  console.log("asasasas");


  const planImages = ["1", "2", "3", "4", "5"]

  for (var i = 0; i < 17; i++) {
        console.log(i);
    } 
  
  
  // for(var i in bikeImages.resourcePaths_pre.data) {
  //   bikeImagesArr.push(
  //     [{
  //       "ref": i, 
  //       "url_col": bikeImages.resourcePaths_col.data[i].replace("https://jwdev.free.resourcespace.com/", ""),
  //       "url_pre": bikeImages.resourcePaths_pre.data[i].replace("https://jwdev.free.resourcespace.com/", ""),
  //       "url_scr": bikeImages.resourcePaths_scr.data[i].replace("https://jwdev.free.resourcespace.com/", "")
  //     }] 
  //   );


    // bikeImagesArr2.push(
    //     {
    //       "src": bikeImages.resourcePaths_scr.data[i],
    //       "srcSet": [
    //         bikeImages.resourcePaths_col.data[i] + " 100w",
    //         bikeImages.resourcePaths_pre.data[i] + " 640w",
    //         bikeImages.resourcePaths_scr.data[i] + " 1067w"
    //       ],
    //       sizes: ["(min-width: 480px) 50vw,(min-width: 1024px) 33.3vw,100vw"],
    //       width: 1,
    //       height: 1
    //     }
    // );
  // }

  // console.log(bikeImagesArr2)

    return {
      props: {
        planImages: planImages
      }
    }
}
