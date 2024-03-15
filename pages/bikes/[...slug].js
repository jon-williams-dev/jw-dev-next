import React, { useState, useCallback } from "react";
// import Carousel, { Modal, ModalGateway } from "react-images";

import {gql} from '@apollo/client'
import client from '../../apolloClient'

import Layout, { siteTitle } from '../../components/layout_bikes'
import NavBikes from '../../components/nav_bikes'
import Image from 'next/image'
import Head from 'next/head'
import Date from '../../components/date'

import indexStyles from '../../styles/index.module.scss'
import { sha256, sha224 } from 'js-sha256';
// import Gallery from "react-photo-gallery";

import PhotoAlbum from "react-photo-album";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";


import Captions from "yet-another-react-lightbox/plugins/captions";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Video from "yet-another-react-lightbox/plugins/video";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";



// import slides from "@/data/slides";



export default function BikePage ({bike}) {

	// const [currentImage, setCurrentImage] = useState(0);
  // const [viewerIsOpen, setViewerIsOpen] = useState(false);

	// const openLightbox = useCallback((event, { photo, index }) => {
  // 	setCurrentImage(index);
  // 	setViewerIsOpen(true);
	// }, []);

	// const closeLightbox = () => {
  // 	setCurrentImage(0);
  // 	setViewerIsOpen(false);
	// };

	const [index, setIndex] = React.useState(-1);
	// const handleClick = (index: number, item: CustomImage) => setIndex(index);

	return (
		<Layout bikes>
  		<Head>
    		<title>Jon Williams | {bike.title}</title>
  		</Head>
  		<NavBikes />
  		<section className="hero">
    		<div className="hero-body pb-0">
      		<div className="container">
        		<div className="content is-medium">
        			<div class="columns">
          			<div class="column is-three-fifths is-offset-one-fifth">
            			<div className="block">
              			<h1>{bike.title}</h1>
										<Image
										  priority
										  src={bike.image.src}
										  height={800}
										  width={1067}
										  alt={bike.title}
										/>
                		<h3>{bike.header}</h3>
                		{bike.quote ? <blockquote className="has-text-grey"><i>{bike.quote}</i></blockquote> : ''}

          					<h4>Specs:</h4>
                    <table class="table">
                      <tbody>
                        {bike.make && (
													  <tr>
													    <td>Make</td>
													    <td>{bike.make}</td>
													  </tr>
													)}
                         {bike.model && (
													  <tr>
													    <td>Model</td>
													    <td>{bike.model}</td>
													  </tr>
													)}
                          {bike.year && (
													  <tr>
													    <td>Year</td>
													    <td>{bike.year}</td>
													  </tr>
													)}
													 {bike.km && (
													  <tr>
													    <td>Kilometers</td>
													    <td>{bike.km} KM</td>
													  </tr>
													)}
													 {bike.color && (
													  <tr>
													    <td>Colour</td>
													    <td>{bike.color}</td>
													  </tr>
													)}
                      </tbody>
                    </table>
                					



                		{bike.description && (
										  <h4>Description:</h4>
										)}
                		{bike.description && (
										  <div dangerouslySetInnerHTML={{ __html: bike.description.html }}></div>
										)}


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
        				{/*<Gallery photos={bike.gallery} onClick={openLightbox} direction={"row"} targetRowHeight={240} />*/}

        				<PhotoAlbum
        					layout="rows"
        					photos={bike.gallery}
        					onClick={({ index: current }) => setIndex(current)}
      					/>

      					 <Lightbox
				          open={index >= 0}
				          close={() => setIndex(-1)}
				          slides={bike.gallery}
				          // plugins={[Captions, Fullscreen, Slideshow, Thumbnails, Video, Zoom]}
				          plugins={[Fullscreen, Slideshow, Zoom]}
				        />

        			</div>
      			</div>
    		</div>            
  		</section>
		</Layout>
	)
}

export async function getStaticPaths() {
	const {data} = await client.query({
    	query: gql`
  		query {
    		bikes {
      			slug
    		}
  		}        
    	`
  	})
	const {bikes} = data; 
	const paths = bikes.map( bike => ({
		params: {slug: [bike.slug]}
	}))
	console.log(paths) 
	return {paths, fallback: false};
}

export async function getStaticProps({params}) {
	const slug = params.slug[0];
	const {data} = await client.query({
    query: gql`
      query BikeBySlug($slug: String!){
        bikes (where: { slug : $slug}) {
          title
          slug
          make
          model
          year
          km
          price
          color
          color_hex {
            hex
          }
          header
          quote
          description {
          	raw
          	html
            markdown
          }
          image {
            src:url
            width
            height
          }
          gallery(first: 50) {
      			src:url
      			width
      			height
    	  	}
        }
      }
        
    `,
    variables: {slug}
  })

  const {bikes} = data; 
  const bike = bikes[0];
  console.log(bike);

  // return { props:  {bike:bike}}
  return { props: {bike}}
}
