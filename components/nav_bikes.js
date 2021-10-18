import Image from 'next/image'

export default function NavBikes({ children, home }) {
  return (
  	<div className="container">
      <nav class="navbar mt-5 pt-3 pb-3" role="navigation" aria-label="main navigation">
        <div class="navbar-brand">
          <a class="navbar-item" href="/bikes">
            <Image
                  priority
                  // src="/images/jwBikes.png"
                  src="/images/logo.png"
                  height={160}
                  // width={524}
                  width={400}
                  alt="JW Bikes"
            />
          </a>
        </div>
      </nav>
    </div>
  )
}