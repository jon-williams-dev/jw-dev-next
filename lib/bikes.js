import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const bikesDirectory = path.join(process.cwd(), 'bikes')

export function getSortedBikesData() {
  // Get file names under /bikes
  const fileNames = fs.readdirSync(bikesDirectory)
  const allbikesData = fileNames.map(fileName => {
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
  return allbikesData.sort((a, b) => {
    if (a.date < b.date) {
      return 1
    } else {
      return -1
    }
  })
}