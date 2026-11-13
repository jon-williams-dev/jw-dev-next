import Head from 'next/head'
import Link from 'next/link'
import Layout from '../../components/layout'
import Image from 'next/image'
import profileStyles from '../../styles/profile.module.scss'
import TypeAnimation from 'react-type-animation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRobot, faLightbulb, faRocket, faCompassDrafting, faMagnifyingGlass, faUsers, faServer, faPenRuler } from '@fortawesome/free-solid-svg-icons'

// The AI-era profile. The original developer profile stays at /profile.

const HOW = [
  [faLightbulb, 'Idea to shipped', 'I take an idea from a rough sketch to a working product in production, with AI doing most of the typing and me making the calls.'],
  [faMagnifyingGlass, 'Experience is the edge', 'AI writes code fast. Knowing what good looks like, spotting what will break and deciding what not to build is where 25 years pays off.'],
  [faRocket, 'Still hands-on', 'I design, review, test and deploy everything that ships. I direct the work closely and stay accountable for it.'],
]

const BRINGS = [
  [faCompassDrafting, 'Architecture', 'Systems that stay clean and maintainable after the first version, not just a demo that works once.'],
  [faPenRuler, 'An eye for design', 'I started in front end and design, and I still care how things look and feel to use.'],
  [faServer, 'Production know-how', 'Servers, deploys, databases and the boring parts that keep things running.'],
  [faUsers, 'Leading teams', 'Years of guiding a web team carry straight over to guiding AI agents: clear briefs, reviews and standards.'],
]

const PROCESS = [
  ['Understand the problem', 'Talk it through, work out what actually needs building and, just as important, what doesn\'t.'],
  ['Shape it', 'Decide the architecture, data model and look and feel before any code is written, so the AI is building towards something clear.'],
  ['Build with AI', 'Work with AI agents in small, reviewable steps: one feature, one change at a time, with me steering each one.'],
  ['Review and test', 'Read what comes back, question it, test it in the real app and send it back when it isn\'t right.'],
  ['Ship and look after it', 'Deploy to production, keep an eye on it and keep improving it, the same as any software I\'ve ever run.'],
]

const HELP = [
  ['Prototypes and MVPs', 'Get an idea in front of real people quickly, built well enough to grow into the real thing.'],
  ['Internal tools and dashboards', 'The small apps a team needs but never gets round to building.'],
  ['Websites and content systems', 'From a simple site to a full custom CMS, with 10+ years of CMS work behind it.'],
  ['Modernising older apps', 'Bringing an ageing codebase up to date without starting from scratch.'],
  ['Working with AI as a team', 'Helping developers and teams get real results from AI tools, from someone who uses them every day.'],
]

const AI_TOOLS = ['Claude Code', 'GitHub Copilot', 'Many AI Models', 'AI Agents', 'LLMs', 'Prompt Engineering', 'Rapid Prototyping']
const FOUNDATIONS = ['Ruby on Rails', 'React', 'Next.js', 'PostgreSQL', 'MySQL', 'GraphQL', 'Hotwire', 'Docker', 'Kamal', 'NGINX', 'Linux', 'Git', 'GitHub Actions']

const JOURNEY = [
  ['2022 - Present', 'Web Lead', 'Max Planck Institute for Intelligent Systems', 'Leading multiple projects and a small web team, while still building and shipping myself.'],
  ['2013 - 2022', 'Full-stack Developer', 'Max Planck Institute for Intelligent Systems', 'Internal and public websites and applications, specialising in custom CMS development.'],
  ['2024 - 2025', 'Rails Developer (freelance)', 'Kickdown', 'A one year engagement on a startup marketplace for classic and vintage cars.'],
  ['2006 - 2012', 'Software Engineer', 'Intergral Information Solutions', 'Front end for complex software products such as FusionReactor, in a small, experienced team.'],
  ['2007 - 2010', 'Designer / Developer (freelance)', 'Foxford Services', 'Designing and building websites for local businesses.'],
  ['2003 - 2004', 'Web / App Developer', 'Hewlett Packard, Germany', 'Internal business process projects and applications.'],
  ['2001 - 2008', 'BSc & MSc Computer Science, both 1st Class', 'Staffordshire University', null],
]

export default function ProfileAI() {
  return (
    <Layout profile>
      <div>
        <Head>
          <title>Jon Williams | Building with AI</title>
          <meta name="description" content="Jon Williams: Web Lead at the Max Planck Institute for Intelligent Systems. 25 years of building for the web, now building products with AI." />
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
                  <p>I build things with AI. Web Lead at the <a href="https://is.mpg.de" target="_blank" rel="noreferrer">Max Planck Institute for Intelligent Systems</a>, and open to independent projects.</p>
                  <div className={profileStyles.typingTextContainer}>
                    <p className={profileStyles.typingText}>
                      I don't write code by hand much anymore. I work with AI to
                      <TypeAnimation
                        cursor={true}
                        sequence={[
                          ' turn ideas into products.',
                          2000,
                          ' ship in days, not months.',
                          2000,
                          ' build the things I always wanted to.',
                          2000,
                        ]}
                        wrapper="span"
                        repeat={Infinity}
                      />
                    </p>
                    <p className={profileStyles.typingTextDummy}>I don't write code by hand much anymore. I work with AI to build the things I always wanted to.</p>
                  </div>
                  <div className="block has-text-grey mt-5">
                    <FontAwesomeIcon icon={faRobot} className="fa-lg mr-5" />
                    <FontAwesomeIcon icon={faLightbulb} className="fa-lg mr-5" />
                    <FontAwesomeIcon icon={faRocket} className="fa-lg mr-5" />
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
              <p className="is-size-3 has-text-centered">25 years of building for the web. Now with AI on the team.</p>
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
                      <h3>What I Do Now</h3>
                      <p>AI has changed my job. I used to spend my days writing code; now I spend them deciding what to build, directing AI to build it, and making sure what comes out is good enough to ship.</p>
                      <p>The result is that I build more, and more ambitious, things than I ever could by hand. Projects that would once have taken a team months now take me days or weeks, and side ideas that would have stayed on a list actually get built.</p>
                      <p>The part that hasn't changed is the part that matters most: years of experience knowing how software should be built, and what happens when it isn't. AI is a brilliant, tireless collaborator, but it needs someone who knows where it's going and can tell when it's wrong.</p>
                      <p>I don't tie myself to one tool. I use Claude Code, GitHub Copilot and a wide range of AI models, picking whichever fits the job best, and keep trying new ones as they arrive.</p>
                    </div>

                    <div className="block mb-6">
                      <h4>How I Work</h4>
                      <div className={profileStyles.cards}>
                        {HOW.map(([icon, title, text]) => (
                          <div key={title} className={profileStyles.card}>
                            <FontAwesomeIcon icon={icon} className={profileStyles.cardIcon} />
                            <p className={profileStyles.cardTitle}>{title}</p>
                            <p className={profileStyles.cardText}>{text}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="block mb-6">
                      <h4>My Process</h4>
                      <ol className={profileStyles.process}>
                        {PROCESS.map(([title, text]) => (
                          <li key={title}>
                            <p className={profileStyles.cardTitle}>{title}</p>
                            <p className={profileStyles.cardText}>{text}</p>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="block mb-6">
                      <h4>Why Experience Still Matters</h4>
                      <p>Anyone can prompt an AI. Getting something real, reliable and maintainable out of it takes someone who has built and shipped software for a long time. That's what I bring:</p>
                      <div className={profileStyles.cards}>
                        {BRINGS.map(([icon, title, text]) => (
                          <div key={title} className={profileStyles.card}>
                            <FontAwesomeIcon icon={icon} className={profileStyles.cardIcon} />
                            <p className={profileStyles.cardTitle}>{title}</p>
                            <p className={profileStyles.cardText}>{text}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="block mb-6">
                      <h4>Current Work</h4>
                      <p>I'm Web Lead at the Max Planck Institute for Intelligent Systems, responsible for multiple projects and a small web team, including the "Scientific Web Engine", the custom CMS behind many of the Institute's research websites. AI is now central to how I and the team work.</p>
                      <p>The job looks different from a few years ago. Less time writing code line by line, more time on planning, reviewing, standards and helping the team get the most out of AI, while still building and shipping myself every day.</p>
                      <div className={profileStyles.tagGroups}>
                        <div className={profileStyles.tagGroup}>
                          <p className={profileStyles.tagGroupLabel}>Building with AI</p>
                          <div className="tags">
                            {AI_TOOLS.map((tag) => <span key={tag} className="tag is-info">{tag}</span>)}
                          </div>
                        </div>
                        <div className={profileStyles.tagGroup}>
                          <p className={profileStyles.tagGroupLabel}>Foundations I still lean on</p>
                          <div className="tags">
                            {FOUNDATIONS.map((tag) => <span key={tag} className="tag is-light">{tag}</span>)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="block mb-6">
                      <h4>What I Can Help With</h4>
                      <p>Alongside my role at the Institute, I take on independent projects. Some of the things I can help with:</p>
                      <div className={profileStyles.helpList}>
                        {HELP.map(([title, text]) => (
                          <div key={title} className={profileStyles.helpItem}>
                            <p className={profileStyles.cardTitle}>{title}</p>
                            <p className={profileStyles.cardText}>{text}</p>
                          </div>
                        ))}
                      </div>
                      <p className="mt-5">If you have something in mind, <a href="mailto:jon.williams@hey.com">get in touch</a>.</p>
                    </div>

                    <hr />

                    <div className="block mb-6">
                      <h4>Experience</h4>
                      <div className={profileStyles.journey}>
                        {JOURNEY.map(([years, role, where, what]) => (
                          <div key={years + role} className={profileStyles.journeyItem}>
                            <p className={profileStyles.journeyYears}>{years}</p>
                            <p className={profileStyles.journeyRole}>{role}</p>
                            <p className={profileStyles.journeyWhere}>{where}</p>
                            {what && <p className={profileStyles.journeyWhat}>{what}</p>}
                          </div>
                        ))}
                      </div>
                      <p>The full story, with every role and the technologies along the way, is on my <Link href="/profile">developer profile</Link>.</p>
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
                  <h3>Personal Profile</h3>
                  <blockquote className="is-size-4">
                    "<em>... when I'm not working, playing with my children or travelling in my van, I can be found in the forest running, riding motorbikes or in my garage making things ...</em>"
                  </blockquote>
                  <p>British, born in Liverpool, now living in South East Germany with my partner and our three children. I run in the forest, ride and rebuild motorbikes (90s ones especially), drive a 30 year old Saab, and am slowly renovating a house from the 50s and a camper van at the same time.</p>
                  <p>Motorbikes have been a thing since I was a kid fixing up broken bikes in my parents' garage. These days it's 90s modern classics, the bikes I dreamt about as a lad, and a Honda CB750 cafe racer build. As a family we travel Europe in a builder's van I converted into a camper myself.</p>
                  <p>Building with AI has given me back something I loved about the web in the first place: making things just because they're fun.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}
