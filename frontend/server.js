import { createServer } from 'http'
import { readFileSync, existsSync, statSync } from 'fs'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PORT = process.env.PORT || 3000
const DIST = join(__dirname, 'dist')

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

const indexHtml = readFileSync(join(DIST, 'index.html'))

createServer((req, res) => {
  const url = req.url.split('?')[0]
  const filePath = join(DIST, url === '/' ? 'index.html' : url)
  
  if (existsSync(filePath) && !statSync(filePath).isDirectory()) {
    const ext = extname(filePath)
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
    res.end(readFileSync(filePath))
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(indexHtml)
  }
}).listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
