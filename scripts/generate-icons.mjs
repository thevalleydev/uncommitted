import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

const svgBuffer = readFileSync(join(publicDir, 'favicon.svg'))

// Generate PNG icons for manifest
const sizes = [192, 512]

for (const size of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(join(publicDir, `icon-${size}.png`))
  console.log(`Created icon-${size}.png`)
}

// Generate apple touch icon (180x180) from favicon
await sharp(svgBuffer)
  .resize(180, 180)
  .png()
  .toFile(join(publicDir, 'apple-touch-icon.png'))
console.log('Created apple-touch-icon.png')

// Generate OG image (1200x630)
const ogSvg = readFileSync(join(publicDir, 'og-default.svg'))
await sharp(ogSvg)
  .resize(1200, 630)
  .png()
  .toFile(join(publicDir, 'og-default.png'))
console.log('Created og-default.png')

console.log('Done!')
