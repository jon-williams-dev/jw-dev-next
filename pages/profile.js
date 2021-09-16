import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/layout'
import Nav from '../components/nav'
import Image from 'next/image'
// import style from '../styles/profile.module.scss'
import profileStyles from '../styles/profile.module.scss'

// import '../styles.css'
// import style from 'style.module.css'


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

                    {/* 
                        Professional Profile 
                    */}
                    <div className="block mb-6 mt-6">
                      <h3>Professional Profile</h3>
                      <p>I am a reliable, motivated and enthusiastic Developer with many years experience. I provide high attention to detail and have an instinct for good design.</p>
                      <p>My professional career began as a Front-End Developer, however, I have always been interested in the overlap between design and development and soon moved into the world of Full Stack Development.</p>
                      <p>I strive to create attractive, usable and functional applications. I design, build, test and deploy applications covering all phases of the application development life cycle, from start to finish.</p>
                      <p>I am currently working as a Rails Developer and my daily toolbox consists of, but not limited to: 
                      <p>
                        <span className="tag is-info mr-2">Ruby on Rails</span>
                        <span className="tag is-info mr-2">RailsAPI</span>
                        <span className="tag is-info mr-2">RSpec</span>
                        <span className="tag is-info mr-2">Phusion Passenger</span>
                        <span className="tag is-info mr-2">NGINX</span>
                        <span className="tag is-info mr-2">Apache</span>
                        <span className="tag is-info mr-2">Capistrano</span>
                        <span className="tag is-info mr-2">TurboLinks</span>
                        <span className="tag is-info mr-2">ElasticSearch</span>
                        <span className="tag is-info mr-2">MySQL</span>
                        <span className="tag is-info mr-2">OAuth</span>
                        <span className="tag is-info mr-2">BootStrap</span>
                        <span className="tag is-info mr-2">Bulman</span>
                        <span className="tag is-info mr-2">NextJS</span>
                        <span className="tag is-info mr-2">React</span> 
                        <span className="tag is-info mr-2">GitLab</span>
                        <span className="tag is-info mr-2">Bamboo</span>
                        <span className="tag is-info mr-2">Adobe Suite (PhotoShop)</span>
                        and all the other various tools, libraries and technologies related to and required by them.</p>
                      </p>
                       {/* <p>
                          <span className="tag is-dark">Dark</span>
                          <span className="tag is-white">White</span>
                          <span className="tag is-link">Link</span>
                          <span className="tag is-info">Info</span>
                          <span className="tag is-warning">Warning</span>
                          <span className="tag is-danger">Danger</span>
                        </p>*/}
                      <p>
                        {/*In my (limited) spare time I like to dabble with and learn new relevant skills and techologies, some of which currently on the hitlist include: Node React Gatsby Django laravel MongoDB ... I also oftently find myself helping out friends with any technical or layout aspects of there Worpress websites and blogs*/}
                        Im a fast learner and am interested in learning (and willing to learn) new skills, tools and technologies, some of which currently on the hitlist include: 
                        <span className="tag is-primary mr-2  ml-2">Docker</span>
                        <span className="tag is-primary mr-2">Hotwire</span>
                        <span className="tag is-primary mr-2">Stimulus JS</span>
                        <span className="tag is-primary mr-2">TailwindCSS</span>
                        <span className="tag is-primary mr-2">Gatsby</span>
                        <span className="tag is-primary mr-2">MongoDB</span>
                        <span className="tag is-primary mr-2">GraphQL</span>
                        <span className="tag is-primary mr-2">WebSockets</span>
                        <span className="tag is-primary mr-2">Redis</span>
                        <span className="tag is-primary mr-2">Sidekiq</span>
                        <span className="tag is-primary mr-2">Actioncable</span>
                        to name but a few.
                      </p>
                    </div>
                    
                    {/*(AnyCable GO (better))*/}
                    {/*Load balancing ... */}

                    {/* 
                        Current Projects
                    */}
                    <div className="block mb-6">
                      <h3>Current Projects</h3>
                      <p>I am currently working at the Max Planck Institute for Intelligent Systems where I have developed and am responsible for many websites and applications.</p>
                      <p>My most recent (ongoing) project is a Custom Content Management System (CMS) named as the "Scientific Web Engine" ... which I have developed to support Institute websites for groups, projects, collaborations and general scientific and research requirements.</p>
                      <p>The CMS is continually in development with already many websites running on it, some of which high profile including Cyber Valley, ELLIS, IMPRS-IS and CLS:</p>
                    </div>


                    {/* 
                        Summary
                    */}
                    <div className="block mb-6">
                      <h3>Summary</h3>
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
                    {/* 
                        Personal Profile
                    */}
                    <div className="block mb-6">
                      <h3>Personal Profile</h3>
                    
                        <p>
                        Etiam pharetra vehicula enim, quis faucibus tellus. Aenean tincidunt est at purus varius, non semper massa rutrum. Pellentesque eget aliquet est, malesuada sagittis risus. Nulla nec metus ligula. Pellentesque finibus ex mi, in ultricies orci varius sed. In ac massa sed nisi tristique blandit. Ut in viverra est, malesuada fermentum nunc. Pellentesque luctus sodales semper. Praesent id mi et sapien convallis euismod. Sed eget suscipit turpis. Aenean vitae fermentum metus, sit amet porta massa. Integer vel lacinia orci, in mollis mauris. Vestibulum at nisl malesuada, molestie arcu in, pellentesque neque. Morbi fringilla porttitor eros vitae pretium. Nunc quis libero eget eros efficitur iaculis.
                        </p>
                        <p>
                        Donec et nunc et mauris consequat pellentesque nec sit amet eros. Aenean pulvinar malesuada semper. Ut nec tortor vel tortor facilisis sagittis quis tempor neque. Quisque dignissim urna dignissim dui tempor, a suscipit arcu pretium. Phasellus eget risus enim. Phasellus vel dui risus. Pellentesque tristique accumsan dolor sed dignissim. Curabitur libero dolor, laoreet sed eros in, cursus varius nulla. Praesent fringilla ligula et malesuada bibendum. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Integer dapibus condimentum nisl at convallis.
                        </p>
                        <p>
                        Cras ipsum dui, dapibus tempor mi ut, fringilla tincidunt dolor. Donec lacinia laoreet ullamcorper. In eget tellus at erat ullamcorper tristique at et risus. Donec eu augue id elit fermentum iaculis. Mauris dictum ex id dictum mattis. Proin facilisis dolor nec ex ullamcorper, ac suscipit nibh finibus. Nam ipsum ligula, ullamcorper et mi vel, interdum pellentesque tortor.
                        </p>
                        <p>
                        Donec mauris magna, eleifend vel elit scelerisque, porttitor volutpat ipsum. Aliquam eros tortor, posuere in tempor et, egestas suscipit quam. Donec et felis convallis, lobortis dui non, hendrerit massa. Nulla eu nunc in sem iaculis ultrices at non enim. Duis molestie velit vitae lacus semper maximus. Sed lobortis orci in urna pharetra suscipit. Aliquam quis neque at magna iaculis pellentesque. In at nunc tellus. Mauris vitae libero imperdiet erat vestibulum tempor. Donec egestas ut nunc sit amet laoreet. Maecenas eget sem a enim malesuada vehicula id quis metus. Interdum et malesuada fames ac ante ipsum primis in faucibus. Quisque a vulputate dolor. In urna erat, maximus in tellus non, iaculis dignissim dolor.
                        </p>
                        <p>
                        Cras a suscipit neque, non sagittis lectus. Pellentesque a elit a neque elementum tristique vel fringilla libero. Fusce nisl erat, tempor at egestas eleifend, malesuada sed magna. In tristique blandit lorem, vel vulputate neque lobortis auctor. Nam at interdum odio. Morbi malesuada, felis quis pellentesque pellentesque, sem massa rutrum leo, id mattis eros mauris sed nibh. Aenean luctus posuere euismod. Maecenas tempus, tellus in convallis mattis, magna tortor pretium augue, eget facilisis neque quam ut velit. Nam bibendum risus nec risus vestibulum, ac egestas turpis laoreet. Sed quis metus non justo dapibus egestas. Nunc massa felis, sagittis eget mi nec, luctus fermentum orci. Maecenas ornare mattis metus, non egestas augue tristique vitae. Ut condimentum dolor eu risus laoreet convallis.
                        </p>
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
