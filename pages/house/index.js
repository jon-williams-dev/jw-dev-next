// // HOUSE INDEX
// export default function Index() {
//   return <h1>HOUSE INDEX</h1>
// }


import Link from 'next/link'

export default function Index() {
  return (
    <>
      <h1>HOUSE INDEX</h1>
      <h2>
        <Link href="/">
          <a>Back to home</a>
        </Link>
      </h2>
    </>
  )
}