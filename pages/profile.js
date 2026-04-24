import Head from 'next/head'
import Layout from '../components/layout'
import Image from 'next/image'
import profileStyles from '../styles/profile.module.scss'
import TypeAnimation from 'react-type-animation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLaptopCode, faBaby, faShuttleVan, faTools, faTree, faRunning, faMotorcycle } from '@fortawesome/free-solid-svg-icons'


export default function Profile() {


  return (
    <Layout profile>
      <div>
        <Head>
          <title>Jon Williams | Profile</title>
        </Head>

        <div className="container">
          <section className="hero is-fullheight" style={{position: 'relative'}}>
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
                  <p className="title">Jon Williams</p>
                  <p>I'm a Full Stack Developer working at the <a href="https://is.mpg.de" target="_blank" rel="noreferrer">Max Planck Institute for Intelligent Systems</a>.</p>
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
                      <p className={profileStyles.typingTextDummy}>When I'm not working, playing with my children or travelling in my van, I can be found in my garage making things.</p>
                    </div>
                  </div>
                  <div className="block has-text-grey mt-5">
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

            <div style={{position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', cursor: 'pointer'}} onClick={() => document.getElementById('profile-content').scrollIntoView({ behavior: 'smooth' })}>
              <svg width="32" height="20" viewBox="0 0 32 20" fill="rgba(0,0,0,0.2)">
                <polygon points="0,0 32,0 16,20" />
              </svg>
            </div>
          </section>
        </div>

        <section id="profile-content" className="hero is-blue">
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
                      <p>A full stack developer with a strong background in both front-end and back-end engineering. Detail-oriented with an instinct for good design, I focus on building applications that are clean, performant, and maintainable.</p>
                      <p>My career began in front-end development before expanding into full stack work, driven by an interest in the overlap between design and engineering.</p>
                      <p>I design, build, test and deploy across the full application lifecycle — from architecture through to production.</p>
                    </div>

                    <div className="block mb-6">
                      <h4>Current Work</h4>
                      <p>Currently serving as Web Lead at the Max Planck Institute for Intelligent Systems, responsible for multiple projects and a small web team. I remain hands-on as a developer, actively contributing to several applications alongside my leadership responsibilities.</p>
                      <div className={profileStyles.tagGroups}>
                        <div className={profileStyles.tagGroup}>
                          <p className={profileStyles.tagGroupLabel}>Back End</p>
                          <div className="tags">
                            <span className="tag is-info">Ruby on Rails</span>
                            <span className="tag is-info">Rails API</span>
                            <span className="tag is-info">RSpec</span>
                            <span className="tag is-info">MySQL</span>
                            <span className="tag is-info">PostgreSQL</span>
                            <span className="tag is-info">MongoDB</span>
                            <span className="tag is-info">ElasticSearch</span>
                            <span className="tag is-info">OAuth</span>
                            <span className="tag is-info">Redis</span>
                            <span className="tag is-info">Sidekiq</span>
                            <span className="tag is-info">GraphQL</span>
                            <span className="tag is-info">ActionMailer</span>
                            <span className="tag is-light">PHP</span>
                            <span className="tag is-light">Laravel</span>
                          </div>
                        </div>
                        <div className={profileStyles.tagGroup}>
                          <p className={profileStyles.tagGroupLabel}>Front End</p>
                          <div className="tags">
                            <span className="tag is-info">React</span>
                            <span className="tag is-info">Next.js</span>
                            <span className="tag is-info">GraphQL</span>
                            <span className="tag is-info">JavaScript ES6</span>
                            <span className="tag is-info">HTML & CSS</span>
                            <span className="tag is-info">Sass</span>
                            <span className="tag is-info">TailwindCSS</span>
                            <span className="tag is-info">Hotwire</span>
                            <span className="tag is-info">Stimulus JS</span>
                            <span className="tag is-info">TypeScript</span>
                            <span className="tag is-info">Bulma</span>
                            <span className="tag is-info">Bootstrap</span>
                          </div>
                        </div>
                        <div className={profileStyles.tagGroup}>
                          <p className={profileStyles.tagGroupLabel}>DevOps & Tools</p>
                          <div className="tags">
                            <span className="tag is-info">Docker</span>
                            <span className="tag is-info">Capistrano</span>
                            <span className="tag is-info">NGINX</span>
                            <span className="tag is-info">Apache</span>
                            <span className="tag is-info">Phusion Passenger</span>
                            <span className="tag is-info">Kamal</span>
                            <span className="tag is-info">Git</span>
                            <span className="tag is-info">GitHub Actions</span>
                            <span className="tag is-info">Heroku</span>
                            <span className="tag is-info">Linux</span>
                            <span className="tag is-info">LLMs</span>
                            <span className="tag is-info">Prompt Engineering</span>
                            <span className="tag is-info">Jira</span>
                            <span className="tag is-info">Bamboo</span>
                          </div>
                        </div>
                      </div>
                      <p>My most recent (ongoing) project is the "Scientific Web Engine", a Custom Content Management System (CMS) which I have developed to support Institute websites for groups, projects, collaborations and general scientific and research requirements. The CMS is under continuous development already running many websites, including Cyber Valley, European Laboratory for Learning and Intelligent Systems <small>(ELLIS)</small>, International Max Planck Research School for Intelligent Systems <small>(IMPRS-IS)</small>, Center for Learning Systems <small>(CLS)</small>, AI Incubator, The Max Planck Artificial Intelligence Network <small>(MP-AIX)</small>, The Robotics Institute Germany <small>(RIGI)</small>, and Science & Innovation Days <small>(sidays)</small>.</p>
                    </div>

                    <div className="block mb-6">
                      <h4>Previous Work</h4>
                      <p>Between 2024 and 2025 I worked as a freelance Rails developer at <a href="https://kickdown.com" target="_blank" rel="noreferrer">Kickdown</a>, a marketplace for classic and vintage cars — a one year engagement alongside my main role. It was a startup environment with a small, committed and enthusiastic team. Working on a topic I genuinely love made it a particularly enjoyable experience. I learned a great deal during this time, especially around Hotwire, Turbo Streams and modern Rails patterns, knowledge I have since carried into my own projects.</p>
                      <p>Prior to my current position, I worked at <a href="https://www.intergral.com/" target="_blank" rel="noreferrer">Intergral GmbH</a> as a Software Engineer within a small yet advanced and experienced team developing complex software products and Internet Applications. I was mainly responsible for product based front end work (user interfaces and components) developed using the Adobe Flex/Flash (ActionScript 3, MXML) technology, later moving to Javascript Solutions (Angular) along with other supporting technologies (Java, JSP, GSP, JS, BlazeDS, MS/MySQL etc). Some of the products I worked on include: FusionReactor, FusionAnalytics and ShareDox.</p>
                      <p>Eight years at Intergral provided a strong foundation in software engineering. Working within a talented and experienced team, I grew considerably as a developer — gaining broad technical knowledge and a solid understanding of what it takes to build and ship complex software products.</p>
                      <p>Previous to Intergral, I worked at <a href="https://www.hp.com" target="_blank" rel="noreferrer">Hewlett Packard</a> as a Data Retrieval Expert / Web / App Developer working on internal business process related projects and applications.</p>
                    </div>

                    <div className="block mb-6">
                      <h4>Side Projects</h4>
                      <p><a href="https://Moto90" target="_blank" rel="noreferrer">Moto90</a> — a marketplace for late 80s, 90s and early 2000s motorcycles. Built out of a personal interest in the era, it's a Rails project I work on in my own time alongside my day job.</p>
                      <p>Always open to interesting side projects and collaborations — feel free to <a href="mailto:jon.williams@hey.com">get in touch</a>.</p>
                    </div>

                    
                    <div className="block mb-6">

                    {/* <div class="is-divider" data-content="Timeline"></div> */}
                    <hr />

                      <h4>Professional Journey <small>(Work & Study)</small></h4>
                      <div class="timeline">
                        {/* today */}
                        <header class="timeline-header">
                          <span class="tag is-medium is-primary">Today</span>
                        </header>
                        <div class="timeline-item pb-0">
                          <div class="timeline-marker is-icon">
                            <i class="fa fa-flag"></i>
                          </div>
                          <div class="timeline-content">
                            <p class="heading">2013 - Present</p>
                            <p className='is-size-4 mb-2'><a href="https://is.mpg.de" target="_blank" rel="noreferrer">Max Planck Institute for Intelligent Systems</a> <span className='is-size-6 mb-1'>(11 years)</span></p>
                          </div>
                        </div>
                        <div class="timeline-item pb-0">
                          <div class="timeline-marker">
                            <i class="fa fa-flag"></i>
                          </div>
                          <div class="timeline-content">
                            <p class="heading">2022 - Present</p>
                            <p className='is-size-5 mb-1'>Web Lead <span className='is-size-6 mb-1'>(2 years)</span></p>
                            <p className='is-size-6 is-italic'>Managing multiple projects and guiding a small web team to efficiently achieve project and development goals. In addition, I'm hands-on as a developer, actively contributing to several projects and applications simultaneously.</p>
                          </div>
                        </div>
                        <div class="timeline-item">
                          <div class="timeline-marker">
                            <i class="fa fa-flag"></i>
                          </div>
                          <div class="timeline-content">
                            <p class="heading">2013 - 2022</p>
                            <p className='is-size-5 mb-1'>Full-stack Developer <span className='is-size-6 mb-1'>(9 years)</span></p>
                            <p className='is-size-6 is-italic'>Developing internal and public website and application solutions, specializing in custom (in-house) CMS development. Seamlessly integrating front-end and back-end tech to meet organizational needs and user expectations.</p>
                          </div>
                        </div>
                        {/* 2026 */}
                        <header class="timeline-header">
                          <span class="tag is-primary">2026</span>
                        </header>
                        <div class="timeline-item">
                          <div class="timeline-marker is-icon">
                            <i class="fa fa-flag"></i>
                          </div>
                          <div class="timeline-content">
                            <p class="heading">2026 - Present</p>
                            <p className='is-size-4 mb-0'><a href="https://Moto90" target="_blank" rel="noreferrer">Moto90</a> <span className='is-size-6 mb-1'>(Founder)</span></p>
                            <p className='is-size-6 is-italic'>A marketplace for late 80s, 90s and early 2000s motorcycles — a personal project built with Ruby on Rails.</p>
                          </div>
                        </div>
                        {/* 2024 */}
                        <header class="timeline-header">
                          <span class="tag is-primary">2024</span>
                        </header>
                        <div class="timeline-item">
                          <div class="timeline-marker is-icon">
                            <i class="fa fa-flag"></i>
                          </div>
                          <div class="timeline-content">
                            <p class="heading">2024 - 2025</p>
                            <p className='is-size-4 mb-0'><a href="https://kickdown.com" target="_blank" rel="noreferrer">Kickdown</a> <span className='is-size-6 mb-1'>(1 year)</span></p>
                            <p className='is-size-5 mb-1'>Rails Developer</p>
                            <p className='is-size-6 is-italic'>Rails developer within a small, enthusiastic team building a marketplace for classic and vintage cars. A startup environment with a lot of energy — I learned a great deal, particularly around Hotwire, Turbo and modern Rails patterns.</p>
                          </div>
                        </div>
                        {/* 2012 */}
                        <header class="timeline-header">
                          <span class="tag is-primary">2012</span>
                        </header>
                        <div class="timeline-item">
                          <div class="timeline-marker is-icon">
                            <i class="fa fa-flag"></i>
                          </div>
                          <div class="timeline-content">
                            <p class="heading">2006 - 2012</p>
                            <p className='is-size-4 mb-0'><a href="https://www.intergral.com/" target="_blank" rel="noreferrer">Intergral Information Solutions</a> <span className='is-size-6 mb-1'>(8 years)</span></p>
                            <p className='is-size-5 mb-1'>Software Engineer</p>
                            <p className='is-size-6 is-italic'>Software Engineer working within a small yet advanced and experienced team developing complex software products and Internet Applications.</p>
                          </div>
                        </div>
                        {/* 2012 */}
                        <header class="timeline-header">
                          <span class="tag is-primary">2010</span>
                        </header>
                        <div class="timeline-item">
                          <div class="timeline-marker is-icon">
                            <i class="fa fa-flag"></i>
                          </div>
                          <div class="timeline-content">
                            <p class="heading">2007 - 2010</p>
                            <p className='is-size-4 mb-0'>Foxford Services <span className='is-size-6 mb-1'>(Freelance: ca 3 years)</span></p>
                            <p className='is-size-5 mb-1'>Designer / Developer</p>
                            <p className='is-size-6 is-italic'>Designining and implmenting diverse, small-scale websites tailored for local businesses.</p>
                          </div>
                        </div>
                        {/* 2008 */}
                        <header class="timeline-header">
                          <span class="tag is-primary">2008</span>
                        </header>
                        <div class="timeline-item">
                          <div class="timeline-marker is-icon">
                            <i class="fa fa-flag"></i>
                          </div>
                          <div class="timeline-content">
                            <p class="heading">2005 - 2008</p>
                            <p className='is-size-4 mb-0'><a href="https://www.staffs.ac.uk/" target="_blank" rel="noreferrer">Staffordshire University</a> <span className='is-size-6 mb-1'>(3 years)</span></p>
                            <p className='is-size-5 mb-1'>Master of Science - MSc, Computer Science</p>
                            <p className='is-size-6'>Grade: 1st Class (Distinction)</p>
                          </div>
                        </div>
                        {/* 2005 */}
                        <header class="timeline-header">
                          <span class="tag is-primary">2005</span>
                        </header>
                        <div class="timeline-item">
                          <div class="timeline-marker is-icon">
                            <i class="fa fa-flag"></i>
                          </div>
                          <div class="timeline-content">
                            <p class="heading">2001 - 2005</p>
                            <p className='is-size-4 mb-0'><a href="https://www.staffs.ac.uk/" target="_blank" rel="noreferrer">Staffordshire University</a> <span className='is-size-6 mb-1'>(4 years)</span></p>
                            <p className='is-size-5 mb-1'>Bachelor of Science - BSc, Computer Science</p>
                            <p className='is-size-6'>Grade: 1st Class</p>
                          </div>
                        </div>
                        {/* 2004 */}
                        <header class="timeline-header">
                          <span class="tag is-primary">2004</span>
                        </header>
                        <div class="timeline-item">
                          <div class="timeline-marker is-icon">
                            <i class="fa fa-flag"></i>
                          </div>
                          <div class="timeline-content">
                            <p class="heading">2003 - 2004</p>
                            <p className='is-size-4 mb-0'><a href="https://www.hp.com" target="_blank" rel="noreferrer">Hewlett Packard</a>, Germany <span className='is-size-6 mb-1'>(Work experience: 1 year 4 months)</span></p>
                            <p className='is-size-5 mb-1'>Data Retrieval Expert / Web / App Developer</p>
                            <p className='is-size-6 is-italic'>Working on internal business process related projects and applications.</p>
                          </div>
                        </div>
                        {/* 2003 */}
                        <header class="timeline-header">
                          <span class="tag is-primary">2003</span>
                        </header>
                        <div class="timeline-item">
                          <div class="timeline-marker is-icon">
                            <i class="fa fa-flag"></i>
                          </div>
                          <div class="timeline-content">
                            <p class="heading">2000 - 2003</p>
                            <p className='is-size-4 mb-0'>Promotional Marketing Solutions</p>
                            <p className='is-size-5 mb-1'>Graphic Design / Web Developer</p>
                          </div>
                        </div>
                        {/* 2000 */}
                        <header class="timeline-header">
                          <span class="tag is-primary">2000</span>
                        </header>
                      </div>
                    </div>
                    <p>For more information about my additional work experience and qualifications unrelated to development, please feel free to <a href="mailto:jon.williams@hey.com">contact me</a>.</p>
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
                    <p>I love running. I'm not the fastest or fittest, but have a few marathons under my belt of which I am quite proud. I love to run in the local forest — it clears my head and helps to keep me fit.</p>
                    <p>From a very young age I have had a fascination for motorcycles. I remember fixing up old broken motor bikes to the best of my abilities using whatever tools I could find in my parents garage. I was then able to ride them over local fields being too young to hold a license.</p>
                    <p>As I get older my passion for motorcycles has not diminished. I love learning about, riding and working on them. In recent years I have become particularly interested in <a href="https://moto90.net" target="_blank" rel="noreferrer">90s motorbikes</a>, now modern classics (the bikes that I dreamt about when I was a lad) although I'm interested in anything on (two) wheels and always tend to have a few bikes in the garage. My current project is a Honda CB750 cafe racer build. I of course, also like older cars with my daily driver being a 30 year old Saab 900.</p>
                    <p>At the end of 2020 we bought a house from the 50s which has become a large and ongoing renovation project. Although a lot of work, it's enjoyable work which we are doing in our own time and without (too much) stress. The advantage (and hope) being that we will one day have a nice family home which we can enjoy for many years, and the disadvantage (realism) is having to live on a constant building site.</p>
                    <p>I love travelling, having visited many countries and continents. Since becoming a father, a camper van seemed like a good and fun way to travel. I did some research and bought an empty builders van which I have since converted (still converting) into a camper. As a family, we have used the van for many successful and enjoyable trips in and around Europe and plan many more in the future.</p>
                    <p>To unwind, I enjoy family adventures, catching up with friends and having a beer, and simply relaxing with music or a good film.</p>
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
