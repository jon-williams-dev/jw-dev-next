import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/layout'
import Nav from '../components/nav'
import Image from 'next/image'

// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faTelescope, faLaptopCode, faBaby, faShuttleVan, faTools, faTree, faRunning, faMotorcycle, faExternalLink } from '@fortawesome/pro-duotone-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTelescope, faLaptopCode, faBaby, faShuttleVan, faTools, faTree, faRunning, faMotorcycle, faExternalLink } from '@fortawesome/free-solid-svg-icons'

export default function Profile() {
  return (
    <Layout profile>
      <div>
        <Head>
        {/*<link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="Learn how to build a personal website using Next.js"
        />
        <meta
          property="og:image"
          content={`https://og-image.vercel.app/${encodeURI(
            siteTitle
          )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
        />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />*/}
          <title>Jon Williams | Profile</title>
        </Head>

        {/*<Nav />*/}
  

        {/*<section className="hero is-fullheight is-fullheight-with-navbar-jw">*/}
        <div className="container">
        <section className="hero is-fullheight">
          <div className="hero-body">
            <div className="content is-large">
              <div className="block">

               {/* <h1 className="title">
                  Read{' '}
                  <Link href="/house">
                    <a>house index</a>
                  </Link>
                </h1>*/}

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
                <p>When I'm not working, playing with my children or travelling in my van, I can be found in the forest running, riding motorbikes or in my garage making things.</p>
              </div>
              <div className="block has-text-grey">
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
        </section>
      </div>

        <section className="hero is-blue">
          <div className="hero-body">
            <div className="content">
              <p className="is-size-3 has-text-centered">Full Stack Developer with many years of experience</p>
            </div>
          </div>
        </section>



        <section className="hero">
          <div className="hero-body">
            <div className="container">
              <div className="content is-medium">

                <div class="columns">
                  <div class="column is-one-quarter">
                    <figure class="image">
                      <Image
                        priority
                        src="/images/profile.jpg"
                        height={500}
                        width={500}
                        alt="Jon Williams"
                        class="is-square is-rounded"
                      />
                    </figure>
                  </div>
                  <div class="column">

                    {/* 
                        Professional Profile 
                    */}
                    <div className="block mb-6">
                      <h3>Professional Profile</h3>
                      <p>I am a reliable, motivated and enthusiastic Developer with many years experience. I provide high attention to detail and have an instinct for good design.</p>
                      <p>My professional career began as a Front-End Developer, however, I have always been interested in the overlap between design and development and soon moved into the world of Full Stack Development.</p>
                      <p>I strive to create attractive, usable and functional applications. I design, build, test and deploy applications covering all phases of the application development life cycle, from start to finish.</p>
                      <p>I am currently working as a Rails Developer and my daily toolbox consists of, but is not limited to: , , , GitHLab, PhotoShop, Sketch, React, MySQL … and all the other various tools, libraries and technologies related to them.</p>
                      <p>
                        <span class="tag is-info mr-1">Ruby on Rails</span><span class="tag is-info is-light mr-1">RSpec</span><span class="tag is-light mr-1">Phusion Passenger</span><span class="tag is-light mr-1">Capistrano</span>
                        <span class="tag is-info mr-1">ElasticSearch</span>
                        <span class="tag is-info mr-1">NextJS</span><span class="tag is-info mr-1">React</span> 

                        BootStrap
                        TurboLinks
                        RailsAPI
                        OAuth
                        Sidekiq
                        WebSockets
                        Redis
                        Actioncable (AnyCable GO (better))
                        Bamboo

                        Bulman
                        Adobe Suite
                        Sketch
                        Load balancing ... 
                      </p>
                       {/* <p>
                          <span class="tag is-dark">Dark</span>
                          <span class="tag is-white">White</span>
                          <span class="tag is-link">Link</span>
                          <span class="tag is-info">Info</span>
                          <span class="tag is-warning">Warning</span>
                          <span class="tag is-danger">Danger</span>
                        </p>*/}
                      <p>
                        {/*In my (limited) spare time I like to dabble with and learn new relevant skills and techologies, some of which currently on the hitlist include: Node React Gatsby Django laravel MongoDB ... I also oftently find myself helping out friends with any technical or layout aspects of there Worpress websites and blogs*/}
                        Im a fast learner and am interested in learning new skills, tools and technologies, some of which currently on the hitlist include:
                      </p>
                      <p>
                        <span class="tag is-info mr-1">Hotwire</span><span class="tag is-info mr-1">Stimulus JS</span><span class="tag is-info mr-1">TailwindCSS</span>
                        <span class="tag is-info mr-1">Gatsby</span><span class="tag is-info mr-1">MongoDB</span><span class="tag is-info mr-1">GraphQL</span>
                        Docker 
                      </p>
                    </div>

                    {/* 
                        Current Projects
                    */}
                    <div className="block mb-6">
                      <h3>Current Projects</h3>
                      <p>I am currently working at the Max Planck Institute for Intelligent Systems where I have developed and am responsible for multiple websites and applications (including the Institute website).</p>
                      <p>My most recent (ongoing) project is a Custom Content Management System (Scientific Web Engine) which I have developed to support Institute websites for groups, projects, collaborations and general scientific and research requirements.</p>
                      <p>The CMS is continually in development with already many websites running on it, some of which high profile including Cyber Valley, ELLIS, IMPRS-IS and CLS:</p>
                    </div>


                    {/* 
                        Summary
                    */}
                    <div className="block mb-6">
                      <h3>Summary</h3>
                    </div>


                     {/* 
                        Personal Profile
                    */}
                    <div className="block mb-6">
                      <h3>Personal Profile</h3>
                    </div>
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
