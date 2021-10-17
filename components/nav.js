import Image from 'next/image'

export default function Nav({ children, home }) {
  return (
  	<div className="container">
      {/*<nav class="navbar is-fixed-top mt-5" role="navigation" aria-label="main navigation">*/}
      <nav class="navbar mt-5 pt-3 pb-3" role="navigation" aria-label="main navigation">
        <div class="navbar-brand">
          <a class="navbar-item" href="/">
            <Image
                  priority
                  src="/images/logo.png"
                  height={160}
                  width={400}
                  alt="Jon Williams"
            />
          </a>

         {/* <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>*/}
        </div>
      </nav>
    </div>
  )
}