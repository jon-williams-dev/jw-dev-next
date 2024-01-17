import { getBikePhotos } from '../lib/bikes'

export default function BikeGallery({ collection, bikePhotos }) {

  return (
  	<div className="container">
      <h1>BIKE GALLERY</h1>
      { collection }
    </div>
  )
}
