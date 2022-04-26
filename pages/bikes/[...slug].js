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



export default function BikePage ({bike}) {

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
        		<title>Jon Williams | {bike.title}</title>
      		</Head>
      		<NavBikes />
      		<section className="hero">
        		<div className="hero-body">
          			<div className="container">
            			<div className="content is-medium">
            				<div class="columns">
              					<div class="column is-three-fifths is-offset-one-fifth">
                					<div className="block mb-6 mt-6">
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
					                        <tr>
					                          <td>Make</td>
					                          <td>{bike.make}</td>
					                        </tr>
					                         <tr>
					                          <td>Model</td>
					                          <td>{bike.model}</td>
					                        </tr>
					                         <tr>
					                          <td>Year</td>
					                          <td>{bike.year}</td>
					                        </tr>
					                        <tr>
					                          <td>Kilometers</td>
					                          <td>{bike.mileage}KM</td>
					                        </tr>
					                        <tr>
					                          <td>Color</td>
					                          <td>{bike.color}</td>
					                        </tr>
					                      </tbody>
					                    </table>
                    					
                    					<h4>Description:</h4>
                    					<p><div dangerouslySetInnerHTML={{ __html: bike.description.html }} /></p>
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
               				{/*<Gallery photos={bike.gallery} onClick={openLightbox} columns={4} direction={"column"} />*/}
               				<Gallery photos={bike.gallery} onClick={openLightbox} direction={"row"} targetRowHeight={240} />
               				

                			<ModalGateway>
                  				{viewerIsOpen ? (
                    				<Modal onClose={closeLightbox}>
                      					<Carousel
                        					currentIndex={currentImage}
                        					views={bike.gallery.map(x => ({
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
          mileage
          price
          color
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
          gallery {
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