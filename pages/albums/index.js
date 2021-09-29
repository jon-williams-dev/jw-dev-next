import { sha256, sha224 } from 'js-sha256';


export const getStaticProps = async () => {
  // const res = await fetch('https://jsonplaceholder.typicode.com/albums');



  const query = "user=admin&function=get_collection&ref=5"
  // const sign = this.sha256("7e8ffe640c61040110e0f21879b1ea383261b10b00e9eae7559a80a910474d02" . $query);
  const sign = sha256("7e8ffe640c61040110e0f21879b1ea383261b10b00e9eae7559a80a910474d02" + query);
  

  const res = await fetch('https://jwdev.free.resourcespace.com/api/?' + query + "&sign=" + sign);
  const data = await res.json();

  return {
    props: { albums: data }
  }

}

const Albums = ({ albums }) => {
  console.log(albums)

  return (
    <div>
      <h1>All Albums</h1>
      {/*{albums.map(album => (
        <div key={album.id}>
          <a>
            <h3>{ album.title }</h3>
          </a>
        </div>
      ))}*/}

    <h3>{albums.name}</h3>
    </div>
  );
}
 
export default Albums;









// let query = "user=" + this.user + "&function=get_resource_path&ref=" + refid + "&getfilepath=false"; 
//  if (size !== undefined && size!=''){ 
//              query+="&size="+size+ "&generate=true"; 
//  } if (extension !== undefined && extension!=''){
//              query+="&extension="+extension; 
//  }
//  let sign = (this.key + query); 

// return $.get( "https://starklearning.free.resourcespace.com/api/?" + query + "&sign=" + sign);

// any help would be appriciated