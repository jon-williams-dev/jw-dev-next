import React, { useState, useCallback } from "react";
import Carousel, { Modal, ModalGateway } from "react-images";

import {gql} from '@apollo/client'
import client from '../../apolloClient'

import Layout, { siteTitle } from '../../components/layout_bikes'
import NavBikes from '../../components/nav_bikes'
import Image from 'next/image'
import Head from 'next/head'
import Date from '../../components/date'

import indexStyles from '../../styles/index.module.scss'
import { sha256, sha224 } from 'js-sha256';
import Gallery from "react-photo-gallery";



export default function CarPage ({car}) {

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
        		<title>Jon Williams | {car.title}</title>
      		</Head>
      		<NavBikes />
      		<section className="hero">
        		<div className="hero-body pb-0">
          			<div className="container">
            			<div className="content is-medium">
            				<div class="columns">
              					<div class="column is-three-fifths is-offset-one-fifth">
                					<div className="block">
                  						<h1>{car.title}</h1>
						                   <Image
						                      priority
						                      src={car.image.src}
						                      height={800}
						                      width={1067}
						                      alt={car.title}
						                    />


                    					<h3>{car.header}</h3>
                    					{car.quote ? <blockquote className="has-text-grey"><i>{car.quote}</i></blockquote> : ''}

                    					<h4>Specs:</h4>
					                    <table class="table">
					                      <tbody>
					                        <tr>
					                          <td>Make</td>
					                          <td>{car.make}</td>
					                        </tr>
					                         <tr>
					                          <td>Model</td>
					                          <td>{car.model}</td>
					                        </tr>
					                         <tr>
					                          <td>Year</td>
					                          <td>{car.year}</td>
					                        </tr>
					                        <tr>
					                          <td>Kilometers</td>
					                          <td>{car.km} KM</td>
					                        </tr>
					                        <tr>
					                          <td>Colour</td>
					                          <td>{car.color}</td>
					                        </tr>
					                      </tbody>
					                    </table>
                    					
                    					<h4>Description:</h4>
                    					<p><div dangerouslySetInnerHTML={{ __html: car.description.html }} /></p>
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

               				<Gallery photos={car.gallery} onClick={openLightbox} direction={"row"} targetRowHeight={240} />
               				
                			<ModalGateway>
                  				{viewerIsOpen ? (
                    				<Modal onClose={closeLightbox}>
                      					<Carousel
                        					currentIndex={currentImage}
                        					views={car.gallery.map(x => ({
                          						...x,
                          						srcset: x.url
                        					}))}
                      					/>
                    				</Modal>
                  				) : null}
                			</ModalGateway>
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
    		cars {
      			slug
    		}
  		}        
    	`
  	})
	const {cars} = data; 
	const paths = cars.map( car => ({
		params: {slug: [car.slug]}
	}))
	
	return {paths, fallback: false};
}

export async function getStaticProps({params}) {
	const slug = params.slug[0];
	const {data} = await client.query({
    query: gql`
      query CarBySlug($slug: String!){
        cars (where: { slug : $slug}) {
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

  const {cars} = data; 
  const car = cars[0];

  return { props: {car  }}
}