import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/layout'
import Nav from '../components/nav'

import Image from 'next/image'
import React, { useState, useCallback } from "react";
import Carousel, { Modal, ModalGateway } from "react-images";
import Gallery from "react-photo-gallery";

// import style from '../styles/profile.module.scss'
import profileStyles from '../styles/profile.module.scss'
import TypeAnimation from 'react-type-animation';


// import '../styles.css'
// import style from 'style.module.css'


// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faTelescope, faLaptopCode, faBaby, faShuttleVan, faTools, faTree, faRunning, faMotorcycle, faExternalLink } from '@fortawesome/pro-duotone-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTelescope, faLaptopCode, faBaby, faShuttleVan, faTools, faTree, faRunning, faMotorcycle, faExternalLink } from '@fortawesome/free-solid-svg-icons'

export default function Profile() {

  const [currentImage, setCurrentImage] = useState(0);
  const [viewerIsOpen, setViewerIsOpen] = useState(false);

  const pageImages = [
    { src: "/images/cb750.jpg", height: 532, width: 924 },
    { src: "/images/saab900.jpg", height: 800, width: 1022 }
  ]

  const cb750_img = [{ src: "/images/cb750.jpg", height: 532, width: 924 }]
  const saab900_img = [{ src: "/images/saab900.jpg", height: 800, width: 1022 }]

  const openLightboxCustom = useCallback(
    (index) => (event) => {
      setCurrentImage(index);
      setViewerIsOpen(true);
    },
    []
  );

  const closeLightbox = () => {
    setCurrentImage(0);
    setViewerIsOpen(false);
  };



  return (
    <Layout profile>
      <div>
        <Head>
          <title>Jon Williams | Profile</title>
        </Head>

        <div className="container">
          <section className="hero is-fullheight">
            <div className="hero-body">
              <div className="content is-large">
                <div className="block">
                  <Image
                    priority
                    src="/images/logo.png"
                    height={160}
                    width={400}
                    alt="Jon Williams"
                  />
                </div>
                <div className="block">
                  <p className="title">Hi, my name is Jon.</p>
                  <p>I'm a Full Stack Developer working at the <a href="https://is.mpg.de" target="_blank">Max Planck Institute for Intelligent Systems</a>.</p>
                  <div>
                    <div className={profileStyles.typingTextContainer}>
                      <p className={profileStyles.typingText}>
                        When I'm not working, playing with my children or travelling in my van, I can be found
                        <TypeAnimation
                          cursor={true}
                          sequence={[
                            ' in the forest running.',
                            2000,
                            ' riding motorbikes.',
                            2000,
                            ' in my garage making things.',
                            2000,
                          ]}
                          wrapper="span"
                          repeat={Infinity}
                        />
                      </p>
                      {/* hack: choose the longest string renderd ... will set max size and prevert new line jumps */}
                      <p className={profileStyles.typingTextDummy}>When I'm not working, playing with my children or travelling in my van, I can be found in my garage making things.</p>
                    </div>
                  </div>
                  <div className="block has-text-grey mt-5 ">
                    <FontAwesomeIcon icon={faLaptopCode} className="fa-lg mr-5" />
                    <FontAwesomeIcon icon={faBaby} className="fa-lg mr-5" />
                    <FontAwesomeIcon icon={faShuttleVan} className="fa-lg mr-5" />
                    <FontAwesomeIcon icon={faTree} className="fa-lg mr-5" />
                    <FontAwesomeIcon icon={faRunning} className="fa-lg mr-5" />
                    <FontAwesomeIcon icon={faMotorcycle} className="fa-lg mr-5" />
                    <FontAwesomeIcon icon={faTools} className="fa-lg mr-5" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="hero is-blue">
          <div className="hero-body">
            <div className="content">
              <p className="is-size-3 has-text-centered">Full Stack Developer   with many years of experience</p>
            </div>
          </div>
        </section>

        <section className="hero">
          <div className="hero-body">
            <div className="container">
              <div className="content is-medium">
                <div className="columns">
                  <div className="column is-one-quarter">
                    <div className={profileStyles.stickyProfileImageContainer}>
                      <div className={profileStyles.stickyProfile}>
                        <figure className="image mt-6">
                          <Image
                            priority
                            src="/images/profile.jpg"
                            height={500}
                            width={500}
                            alt="Jon Williams"
                            className="is-rounded"
                          />
                        </figure>
                      </div>
                    </div>
                  </div>
                  <div className="column">

                    <div className="block mb-6 mt-6">
                      <h3>Professional Profile</h3>
                      <p>I am a reliable, motivated and enthusiastic developer with many years experience. I provide high attention to detail and have an instinct for good design.</p>
                      <p>My professional career began as a <em>Front End Developer</em>, however, I have always been interested in the overlap between design and development and soon moved into the world of <em>Full Stack Development</em>.</p>
                      <p>I strive to create attractive, usable and functional applications. I design, build, test and deploy applications covering all phases of the application development life cycle, from start to finish.</p>
                    </div>

                    <div className="block mb-6">
                      <h4>Current Work</h4>
                      <p>I am currently employed as Web Lead at the Max Planck Institute for Intelligent Systems. Here I am responsible for multiple projects and oversee a small web team to effectively achieve project and development goals. Im also an active (Rails) developer having developed many websites and applications.</p>
                      <p>My daily toolbox consists of, but not limited to: 
                        <span className="tag is-info mr-2 ml-2">Ruby on Rails</span>
                        <span className="tag is-info mr-2">RailsAPI</span>
                        <span className="tag is-info mr-2">ActiveRecord</span>
                        <span className="tag is-info mr-2">RSpec</span>
                        <span className="tag is-info mr-2">Phusion Passenger</span>
                        <span className="tag is-info mr-2">Docker</span>
                        <span className="tag is-info mr-2">Capistrano</span>
                        <span className="tag is-info mr-2">TurboLinks</span>
                        <span className="tag is-info mr-2">ElasticSearch</span>
                        <span className="tag is-info mr-2">MySQL</span>
                        <span className="tag is-info mr-2">OAuth</span>
                        <span className="tag is-info mr-2">HTML & CSS</span>
                        <span className="tag is-info mr-2">JavaScript <small>ES6</small></span>
                        <span className="tag is-info mr-2">BootStrap</span>
                        <span className="tag is-info mr-2">Bulman</span>
                        <span className="tag is-info mr-2">React</span> 
                        <span className="tag is-info mr-2">NextJS</span>
                        <span className="tag is-info mr-2">GraphQL</span>
                        <span className="tag is-info mr-2">Git</span>
                        <span className="tag is-info mr-2">Jira</span>
                        <span className="tag is-info mr-2">Bamboo</span>
                        <span className="tag is-info mr-2">NGINX</span>
                        <span className="tag is-info mr-2">Apache</span>
                        <span className="tag is-info mr-2">Adobe Suite (PhotoShop)</span>
                        <span className="tag is-light mr-2">PHP</span>
                        <span className="tag is-light mr-2">Laravel</span>
                        and other varying tools, libraries and technologies related to and required by each.
                      </p>
                      <p>
                        Im always interested (and willing) to learn new skills, tools and technologies, some of which currently on the hitlist include: 
                        <span className="tag is-primary mr-2 ml-2">Hotwire</span>
                        <span className="tag is-primary mr-2">Stimulus JS</span>
                        <span className="tag is-primary mr-2">TailwindCSS</span>
                        <span className="tag is-primary mr-2">Gatsby</span>
                        <span className="tag is-primary mr-2">MongoDB</span>
                        <span className="tag is-primary mr-2">Firestore</span>
                        <span className="tag is-primary mr-2">WebSockets</span>
                        <span className="tag is-primary mr-2">Redis</span>
                        <span className="tag is-primary mr-2">Sidekiq</span>
                        <span className="tag is-primary mr-2">Actioncable</span>
                        to name but a few.
                      </p>
                      <p>My most recent (ongoing) project is the "Scientific Web Engine", a Custom Content Management System (CMS) which I have developed to support Institute websites for groups, projects, collaborations and general scientific and research requirements. The CMS is under continuous development already running many websites, some of which including Cyber Valley, European Laboratory for Learning and Intelligent Systems (ELLIS), International Max Planck Research School for Intelligent Systems (IMPRS-IS) and Center for Learning Systems (CLS).</p>
                    </div>

                    <div className="block mb-6">
                      <h4>Previous Work</h4>
                      <p>Prior to my current position, I worked at Integral GmbH as a Software Engineer within a small yet advanced and experienced team developing complex software products and Internet Applications. I was mainly responsible for product based front end work (user interfaces and components) developed using the Adobe Flex/Flash (ActionScript 3, MXML) technology, later moving to Javascript Solutions (Angular) along with other supporting technologies (Java, JSP, GSP, JS, BlazeDS, MS/MySQL etc). Some of the products I worked on include: FusionReactor, FusionAnalytics and ShareDox.</p>
                      <p>I worked at Intergral for approx. 7 years and have fond memories of the company and team. When I started I was less experienced than my peers and struggled at times, but in turn learned a great amount and gained a lot of valuable knowledge and experience from a team of great people which helped form me into the developer I am today.</p>
                      <p>Previous to Intergral, I worked at Hewlett Packard (HP) as a Data Retrieval Expert / Web / App Developer working on internal business process related projects and applications.</p>
                    </div>

                    <div className="block mb-6">
                      <h4>Side Projects</h4>
                      <p>I'm always interested in exciting side projects!</p>
                      <p>If you have an interesting project and/or would like to work with me, shoot me an <a href="mailto:jon.williams@hey.com">email</a>.</p>
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
              <div className="content is-medium">
                <div className="block mb-6">
                  <div className="block mb-6">
                    <h3>Personal Profile</h3>
                    <blockquote className="is-size-4">
                      "<em>... when I'm not working, playing with my children or travelling in my van, I can be found in the forest running, riding motorbikes or in my garage making things ...</em>"
                    </blockquote>
                    <p>I am British being born in Liverpool and spending my childhood growing up in the English countryside. I am currently located in South East Germany.</p>  
                    <p>From a young age I developed an interest in tech with a focus on the Web. I decided to explore more deeply which continued onto higher education where I confirmed my calling for Web development. </p>
                    <p>I have many other interests, hobbies and activities. Much of my leisure time is taken up raising three children together with my partner.</p>
                    <p>I love running. Im not the fastest or fittest, but have a few marathons under my belt of which I am quite proud. I love to run in the local forest , I find it clears my head and helps to keep me fit.</p>
                    <p>From a very young age I have had a fascination for motorcycles. I remember fixing up old broken motor bikes to the best of my abilities using whatever tools I could find in my parents garage. I was then able to ride them over local fields being too young to hold a license.</p>
                    <p>As I get older my passion for motorcycles has not diminished. I love learning about, riding and working on them. In recent years I have become particularly interested in 90s sports bikes, now modern classics (the bikes that I dreamt about when I was a lad) although I'm interested in anything on (two) wheels and always tend to have a few bikes in the garage. My current project being a 
                      <a onClick={openLightboxCustom(0)}> Honda CB750 </a> cafe racer build. I of course, also like older cars with my daily driver being a 30 Year old <a onClick={openLightboxCustom(1)}> Saab 900</a>.</p>
                     
                    <ModalGateway>
                      {viewerIsOpen ? (
                        <Modal onClose={closeLightbox} allowFullscreen={false}>
                          <Carousel
                            currentIndex={currentImage}
                            trackProps={{ viewsToMove: 1 }}
                            hasNextView={false}
                            views={pageImages.map(x => ({
                              ...x,
                              srcset: x.srcSet,
                              caption: x.title
                            }))}
                          />
                        </Modal>
                      ) : null}
                    </ModalGateway>

                    <p>At the end of 2020 we bought a house from the 50s which has become a large and ongoing renovation project. Although a lot of work, it's enjoyable work which we are doing in our own time and without (too much) stress. The advantage (and hope) being that we will one day have a nice family home which we can enjoy for many years, and the disadvantage (realism) is having to live on a constant building site.</p>
                    <p>I love travelling, having visited many countries and continents. Since becoming a father, a camper van seemed like a good and fun way to travel. I did some research and bought an empty "builders-van" which I have since converted (still converting) into a "camper-van-lite". As a family, we have used the van for many successful and enjoyable trips in and around Europe and plan many more in the future.</p>
                    <p>To relax and take my mind off everyday life every I enjoy exploring (trips and walks) with the family, meeting up with friends for a bit of banter and a beer or simply kicking back, listening to music or watching a film.</p>
                  </div>             
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>        
    </Layout>
  )
}




// Full stack software engineer with experience in Ruby on Rails,
// Hotwire/Turbolinks, Stimulus JS, and TailwindCSS. I also possess the
// necessary talent to learn new technologies quickly, solve problems, and
// collaborate with my team. I have strong communication and interpersonal
// skills and thrive in a distributed work environment.

// skills
// Front-end development
// Back-end development
// Test-driven development
// Project management
// UX/UI Design

// Ruby on Rails
// React
// Bridgetown
// RSpec
// CSS3
// TailwindCSS
// Bulma
// JavaScript
// Stimulus JS
// Hotwire/Turbolinks
// HTML5
// PostgreSQL
