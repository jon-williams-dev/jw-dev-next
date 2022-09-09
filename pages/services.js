import {gql} from '@apollo/client'
import Head from 'next/head' 
import client from '../apolloClient'
import Layout, { siteTitle } from '../components/layout_bikes'
import NavBikes from '../components/nav_bikes'
import Link from 'next/link'
import Image from 'next/image'

export default function Services() {

  return (
    <Layout bikes>
      <Head>
        <title>Jon Williams | Services</title>
      </Head>
      <NavBikes />

      <section className="hero">
         <div className="hero-body">
           <div className="container">
             <div className="content is-medium">
               <div className="block mb-6 mt-6">
                 <h1>Services</h1>
                 <p>Phasellus tortor magna, ullamcorper nec suscipit ac, varius sed nulla. Duis sollicitudin vitae magna a pharetra. Donec non congue augue. Integer eget tristique odio, at varius ipsum. Vivamus eget dictum nulla, nec tincidunt massa. Phasellus sollicitudin feugiat lacinia. Morbi sed purus a dui hendrerit varius nec eget est. Curabitur turpis neque, sodales quis mauris in, interdum hendrerit enim. Quisque vehicula quis sem sagittis tristique.</p>
               </div>
             </div>
           </div>
         </div>            
       </section>


       <section className="section">
        <div className="container">

           <div class="tile is-ancestor">
              <div class="tile is-vertical is-8">
                <div class="tile">
                  <div class="tile is-parent is-vertical">
                    <article class="tile is-child notification is-green">
                      <p class="title">Website Development</p>
                      <p class="subtitle">Suspendisse blandit tincidunt accumsan. Aenean laoreet rhoncus maximus. Praesent ipsum dui, pretium ut lacus vitae, condimentum porta libero. Maecenas facilisis tortor sit amet finibus gravida. Aliquam tempus eleifend risus, in condimentum nulla facilisis at. Quisque velit eros, sodales ut lectus eget, pellentesque varius eros. Phasellus pulvinar lectus quis maximus ornare. In id erat dictum ante suscipit viverra.</p>
                    </article>
                    <article class="tile is-child notification is-yellow">
                      <p class="title">Custom Web Applications</p>
                      <p class="subtitle">Cras scelerisque pulvinar aliquet. Curabitur iaculis fringilla magna, ac condimentum justo tristique suscipit. Nam eleifend faucibus augue ut posuere. Aenean tortor diam, eleifend et sapien id, viverra consequat lacus. Ut ut viverra turpis, vel porta velit. Nam finibus dolor vel erat rutrum euismod. In tristique tempor enim, id rutrum dui. Mauris in dictum ex, auctor fermentum mi. Ut non fringilla justo. Fusce cursus molestie leo, a pretium justo feugiat in.</p>
                    </article>
                  </div>
                  <div class="tile is-parent">
                    <article class="tile is-child notification is-blue">
                      <p class="title">Content Management Systems</p>
                      <p class="subtitle">Quisque sed metus velit. Cras sit amet felis turpis. Integer ac arcu malesuada, posuere lorem a, pulvinar arcu. Proin semper diam at urna vulputate, quis vestibulum eros pharetra. Sed id orci id libero pulvinar vestibulum vel sit amet enim. Aliquam erat volutpat. Nullam tincidunt posuere pretium.</p>
                    </article>
                  </div>
                </div>
                <div class="tile is-parent">
                  <article class="tile is-child notification is-pink">
                    <p class="title">Website Auditing</p>
                    <p class="subtitle">Donec non efficitur est. Curabitur sit amet malesuada risus, in vehicula tellus. Donec ullamcorper sem et odio volutpat dapibus quis in nisl. Mauris nunc lorem, tincidunt non molestie non, vulputate a purus. Proin et volutpat ex. Praesent scelerisque augue nibh, quis vestibulum lacus congue sit amet. Suspendisse sagittis vulputate elit, vel maximus nisl fermentum a. Morbi finibus ac ligula non tempor. Duis tempor ac elit eu aliquam. Vestibulum enim ex, sodales tempor consequat at, tristique nec mauris. Ut id lacinia sapien.</p>
                    <div class="content">
                    asasasa
                    </div>
                  </article>
                </div>
              </div>
              <div class="tile is-parent">
                <article class="tile is-child notification is-green">
                  <div class="content">
                    <p class="title">UX Design & Development</p>
                    <p class="subtitle">Etiam scelerisque nibh sit amet commodo vulputate. Vestibulum risus erat, molestie vel risus eget, iaculis consequat dui. Nam sed finibus odio, non aliquam purus. Aliquam eu lacinia libero, quis bibendum est. Praesent quis enim eget justo porta porta. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Quisque malesuada quam non enim sagittis tempus. Aenean iaculis, diam sit amet viverra lobortis, risus sapien ullamcorper urna, a ullamcorper augue nibh in lorem. Duis fringilla viverra ligula vel venenatis. Sed nulla ante, consectetur vel risus vitae, fermentum congue sem.</p>
                    <div class="content">
                    asasasa
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>

       </section>


       
    </Layout>
  )
}