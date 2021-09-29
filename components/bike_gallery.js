import { getBikePhotos } from '../lib/bikes'

export default function BikeGallery({ collection, bikePhotos }) {

  return (
  	<div className="container">
      <h1>BIKE GALLERY</h1>
      { collection }
    </div>
  )
}

// export async function componentDidMount({ params }) {
//   const bikePhotos = await getBikePhotos(5)

//   console.log("TEST blabla")
//   console.log("TEST blabla")
//   console.log("TEST blabla")
//   console.log("TEST blabla")
//   console.log("TEST blabla")
//   console.log("TEST blabla")

//   return {
//     props: {
//       bikePhotos: bikePhotos.data
//     }
//   }
// }
