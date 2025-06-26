import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/layout'
import Nav from '../components/nav'

import Image from 'next/image'
import React, { useState, useCallback } from "react";
import Carousel, { Modal, ModalGateway } from "react-images";
import Gallery from "react-photo-gallery";
import profileStyles from '../styles/profile.module.scss'
import TypeAnimation from 'react-type-animation';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTelescope, faLaptopCode, faBaby, faShuttleVan, faTools, faTree, faRunning, faMotorcycle, faExternalLink } from '@fortawesome/free-solid-svg-icons'

export default function Profile() {

  return (
    <Layout profile>
      <div>
        <Head>
          <title>Jon Williams | Profile</title>
        </Head>

        <section className="hero">
          <div className="hero-body">
            <div className="container">
              <div className="content is-medium">
                <div className="columns">
                  <div className="column">
                    <div className="block mb-6 mt-6">
                        <h1>Curriculum Vitae, Jon Williams</h1>
                        <h2>Personal and Contact Details</h2>
                        <div className="columns">
                            <div className="column">
                                <h3>Personal Details</h3>
                                <table class="table">
                                    <tr>
                                        <td>Full Name</td>
                                        <td>Jonathan Williams</td>
                                    </tr>
                                    <tr>
                                        <td>Date of Birth</td>
                                        <td>17th March 1983</td>
                                    </tr>
                                    <tr>
                                        <td>Place of Birth</td>
                                        <td>Liverpool, England</td>
                                    </tr>
                                    <tr>
                                        <td>Nationality:</td>
                                        <td>British</td>
                                    </tr>
                                </table>
                            </div>
                            <div className="column">
                                <h3>Current Contact Details</h3>
                                <table class="table">
                                    <tr>
                                        <td>Address:</td>
                                        <td>Tübingen, Germany</td>
                                    </tr>
                                    <tr>
                                        <td>Mobile</td>
                                        <td>+49 (0) 17684323676</td>
                                    </tr>
                                    <tr>
                                        <td>Email</td>
                                        <td><a href="mailto:jon.williams@hey.com">jon.williams@hey.com</a></td>
                                    </tr>
                                    <tr>
                                        <td>Website:</td>
                                        <td><a href='https://jon-williams.dev/profile' target="_blank">https://jon-williams.dev/profile</a></td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                        <div className='columns'>
                            <div className='column'>
                                <h3>Career aim</h3>
                                <h4>Resume:</h4>
                                <p>A highly motivated and experienced individual with strong and wide ranging skills in software development and graphic design.</p>
                                <h4>Objectives:</h4>
                                <p>Seeking a position which focuses on software design and / or development allowing the involvement and creation of interesting and exciting projects and artefacts. The feld of Web, Mobile and Rich Internet Applications (RIA) particularly appeals to me and I have much interest and experience in this area (tools, environments and architectures) allowing me to combine my skills in order to create aesthetically pleasing, structural and interactive and dynamic sites, tools (components) and applications.</p>
                                <p>Additional experience and interests lie within all development areas (see section 4) along with a willingness and enthusiasm to study / learn and experience new and diferent options and possibilities (including those that may not initially appeal).</p>
                                <h4>Current Position:</h4>
                                <p>Software Engineer working within a small yet advanced and experienced team developing complex software products and Internet Applications.</p>
                                <p>Current and recent projects that I have worked on have mainly been product based RIA front end work (user interfaces / components) that have been developed using the Adobe Flex / Flash (ActionScript 3, MXML) technology along with other supporting technologies (including Java, JSP, GSP, JS, BlazeDS, MS/MySQL etc ...). These products include: FusionReactor, FusionAnalytics and ShareDox.</p>
                                <h4>Earlier Education</h4>
                                <p>Daventry Tertiary College (1999–2001) - Advanced Information Technology–GNVQ - Qualifcation: Merit</p>
                                <p>Daventry William Parker School (1995-1999) – All relevant GCSE's including English, Maths & Science</p>
                                
                            </div>    
                            <div className='column'>
                                keywords
                            </div>    
                        </div>
                        <div className='columns'>
                            <div className='column'>
                                <h2>Education and Qualifcations</h2>
                                <h3>Professional Qualifcations</h3>
                                <p>Adobe Systems Incorporated - Adobe Certifed Flex Developer</p>
                                <h3>Masters (MSc) Degree</h3>
                                <p>Stafordshire University – (2005-2008) – MSc Mobile Computer Systems – Qualifcation : <strong>1st Class (Distinction)</strong></p>
                                <h3>Bachelors (BSc Hons) Degree</h3>
                                <p>Stafordshire University – (2001-2005) – BSc (hons) Multimedia Computing – Qualifcation : <strong>1st Class</strong></p>
                            </div>
                        </div>
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
