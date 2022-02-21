import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/layout'
import Nav from '../components/nav'
import Image from 'next/image'
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
                <p>When I'm not working, playing with my children or travelling in my van, I can be found 
                  <TypeAnimation
                    cursor={true}
                    // sequence={['This text will be repeated infinitely.', 1000, '']}
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

                    {/* 
                        Professional Profile 
                    */}
                    <div className="block mb-6 mt-6">
                      <h3>Professional Profile</h3>
                      <p>I am a reliable, motivated and enthusiastic developer with many years experience. I provide high attention to detail and have an instinct for good design.</p>
                      <p>My professional career began as a <em>Front End Developer</em>, however, I have always been interested in the overlap between design and development and soon moved into the world of <em>Full Stack Development</em>.</p>
                      <p>I strive to create attractive, usable and functional applications. I design, build, test and deploy applications covering all phases of the application development life cycle, from start to finish.</p>
                    </div>
                    
                    {/*(AnyCable GO (better))*/}
                    {/*Load balancing ... */}

                    {/* 
                        Current Projects
                    */}
                    <div className="block mb-6">
                      <h4>Current Work</h4>
                      <p>I am currently employed as Web Lead at the Max Planck Institute for Intelligent Systems. Here I am responsible for multiple projects and oversee a small web team to effectively achieve project and development goals. Im also an active (Rails) developer having developed many websites and applications.</p>
                      {/*<p>I am currently working as a Rails Developer at the <a href="https://is.mpg.de" target="_blank">Max Planck Institute for Intelligent Systems</a> where I have developed and am responsible for many websites and applications.</p>*/}
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
                        <span className="tag is-info mr-2">Git</span>
                        <span className="tag is-info mr-2">Jira</span>
                        <span className="tag is-info mr-2">Bamboo</span>
                        <span className="tag is-info mr-2">NGINX</span>
                        <span className="tag is-info mr-2">Apache</span>
                        <span className="tag is-info mr-2">Adobe Suite (PhotoShop)</span>
                        <span className="tag is-light mr-2">PHP</span>
                        <span className="tag is-light mr-2">Laravel</span>
                        and all the other various tools, libraries and technologies related to and required by them.
                      </p>
                      <p>
                        {/*In my (limited) spare time I like to dabble with and learn new relevant skills and techologies, some of which currently on the hitlist include: Node React Gatsby Django laravel MongoDB ... I also oftently find myself helping out friends with any technical or layout aspects of there Worpress websites and blogs*/}
                        Im always interested (and willing) to learn new skills, tools and technologies, some of which currently on the hitlist include: 
                        <span className="tag is-primary mr-2 ml-2">Hotwire</span>
                        <span className="tag is-primary mr-2">Stimulus JS</span>
                        <span className="tag is-primary mr-2">TailwindCSS</span>
                        <span className="tag is-primary mr-2">Gatsby</span>
                        <span className="tag is-primary mr-2">MongoDB</span>
                        <span className="tag is-primary mr-2">Firestore</span>
                        <span className="tag is-primary mr-2">GraphQL</span>
                        <span className="tag is-primary mr-2">WebSockets</span>
                        <span className="tag is-primary mr-2">Redis</span>
                        <span className="tag is-primary mr-2">Sidekiq</span>
                        <span className="tag is-primary mr-2">Actioncable</span>
                         {/*drails gems: evise, aasm, cancancan, graphql, draper, ransac, sablon*/}


                        to name but a few.
                      </p>
                      <p>My most recent (ongoing) project is the "Scientific Web Engine", a Custom Content Management System (CMS) which I have developed to support Institute websites for groups, projects, collaborations and general scientific and research requirements. The CMS is under continuous development already running many websites, some of which including Cyber Valley, European Laboratory for Learning and Intelligent Systems (ELLIS), International Max Planck Research School for Intelligent Systems (IMPRS-IS) and Center for Learning Systems (CLS).</p>
                    </div>


                    {/* 
                        Previous Work
                    */}
                    <div className="block mb-6">
                      <h4>Previous Work</h4>

                      Prior to my current employemnt .... 

                      Software Engineer working within a small yet advanced and experienced
team developing complex software products and Internet Applications.
Current and recent projects that I have worked on have mainly been product based RIA front
end work (user interfaces / components) that have been developed using the Adobe Flex /
Flash (ActionScript 3, MXML) technology along with other supporting technologies (including
Java, JSP, GSP, JS, BlazeDS, MS/MySQL etc ...). These products include: FusionReactor,
FusionAnalytics and ShareDox:
                    </div>


                    {/* 
                        Side Projects
                    */}
                    <div className="block mb-6">
                      <h4>Side Projects</h4>
                      <p>I'm always interested in interesting side projects!</p>
                      <p>A current project im working on being a custom CRM for OverCross "<em>a tour operator for motorbike tours, off-road vehicle tours, round trips and group tours</em>" which will be deployed later this year.</p>
                      <p>If you would like to work with me, please contact me with/for more information: <a href="mailto:jon.williams@hey.com">jon.williams@hey.com</a>.</p>

                        
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


                      <p className="is-size-4 has-text-centered">"<em>... when I'm not working, playing with my children or travelling in my van, I can be found in the forest running, riding motorbikes or in my garage making things ...</em>"</p>
                      <p>I am British, was born in Liverpool and grew up in the English countryside. I am currently located in South East Germany.</p>
                      <p>I have always had an interest tech with a focus on web from a young age and decided to dig deeper, continuing onto higher education where I confirmed my calling for web development.</p>
                      <p>I have many other interests, hobbies and activities that keep me busy including bringing up (playing) with my three children which consumes most of my time.</p>
                      <p>I love running, im not the fastest or fittest, but have a few marathons under my belt which im pretty proud of. I love to get out in the local forest for a run as often as I can to both keep fit and clear my head.</p>
                      <p>Since a young age I have had a great interest in motorcycles. I remember getting old broken motorbikes which Id fix up to the best of my abilities using whatever tools I could find in my parents garage to then use (ride over a local field, as I was then too young have license).</p>
                      <p>Growing older, my passion for motorcycles has remained. I love learning about, riding and working on them. In recent years I have become particularly interested in 90s sports bike (the bikes that I dreamt about when I was a lad) although I'm interested in anything on (two) wheels and always tend to have a few in the garage. My current project being a Honda CB750 cafe racer build. I of course, also like older cars with my daily driver being a 30 Year old Saab 900.</p>
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
