import Image from 'next/image'
import path from 'path'
import matter from 'gray-matter'
import remark from 'remark'
import html from 'remark-html'
import { sha256, sha224 } from 'js-sha256';
import fs from 'fs'

const bikesDirectory = path.join(process.cwd(), 'bikes')

export function getBikesData() {
  // Get file names under /bikes
  const fileNames = fs.readdirSync(bikesDirectory)
  const allBikesData = fileNames.map(fileName => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '')

    // Read markdown file as string
    const fullPath = path.join(bikesDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    // Use gray-matter to parse the bike metadata section
    const matterResult = matter(fileContents)

    // Combine the data with the id
    return {
      id,
      ...matterResult.data
    }
  })
  // Sort bikes by date
  return allBikesData.sort(({ date: a }, { date: b }) => {
    if (a < b) {
      return 1
    } else if (a > b) {
      return -1
    } else {
      return 0
    }
  })
}

export function getAllBikeIds() {
  const fileNames = fs.readdirSync(bikesDirectory)

  return fileNames.map(fileName => {
    return {
      params: {
        id: fileName.replace(/\.md$/, '')
      }
    }
  })
}

export async function getBikeData(id) {
  const fullPath = path.join(bikesDirectory, `${id}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')

  // Use gray-matter to parse the bike metadata section
  const matterResult = matter(fileContents)

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
    ...matterResult.data
  }
}



const rs_sign = "7e8ffe640c61040110e0f21879b1ea383261b10b00e9eae7559a80a910474d02"

export async function getCollectionImages(collectionID) {
  
  const refs = await getCollectionRefs(collectionID)

  const resourcePaths_col = await getImageResourcePaths(refs.data, "col")
  const resourcePaths_pre = await getImageResourcePaths(refs.data, "pre")
  const resourcePaths_scr = await getImageResourcePaths(refs.data, "scr")
  
  return {
      resourcePaths_col,
      resourcePaths_pre,
      resourcePaths_scr
  }
}

export async function getCollectionRefs(collectionID) {
  const query = "user=admin&function=do_search&search=%21collection" + collectionID
  const res = await fetch('https://jwdev.free.resourcespace.com/api/?' + query + "&sign=" + sha256(rs_sign + query));
  const data = await res.json();

  return {
    data: data.map((obj) => obj.ref)
  }
}

export async function getImageResourcePaths(refs, size) {
  const query = "user=admin&function=get_resource_path&ref=%5B" + encodeURIComponent(refs).replace("%2C", "%2C+") + "%5D&getfilepath=bike&size=" + size
  const res = await fetch('https://jwdev.free.resourcespace.com/api/?' + query + "&sign=" + sha256(rs_sign + query));
  const data = await res.json();

  return {
    data
  }
}