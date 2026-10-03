import fs from 'node:fs/promises'
import sharp from 'sharp'
import QRCode from 'qrcode'
import { DEMO_DATA, THEME } from '../src/constants/site.ts'

const input = 'design/assets/origin'
const output = 'public/images/origin'
await fs.mkdir(output, { recursive: true })
await fs.mkdir('public/qr', { recursive: true })
const stats = []
const encoderModified = (await fs.stat(import.meta.filename)).mtimeMs
for (const name of ['master', 'landscape', 'plant', 'foreground', 'farm-one', 'farm-two', 'soil']) {
  const path = `${input}/${name}.png`
  try {
    const meta = await sharp(path).metadata()
    for (const width of [800, 1600]) {
      const deliveryName = name.startsWith('farm-') ? `${name}-v2` : name
      const destination = `${output}/${deliveryName}-${width}.webp`
      const source = await fs.stat(path)
      const previous = await fs.stat(destination).catch(() => null)
      if (!previous || previous.mtimeMs < Math.max(source.mtimeMs, encoderModified)) await sharp(path).resize({ width: name.startsWith('farm-') ? Math.min(width, 800) : width, withoutEnlargement: true }).webp({ quality: name.startsWith('farm-') ? 80 : 86, alphaQuality: 95 }).toFile(destination)
      stats.push({ name, variant: width, bytes: (await fs.stat(destination)).size, alpha: meta.hasAlpha, width: meta.width, height: meta.height })
    }
  } catch (error) {
    if (name === 'soil' && error.message.includes('missing')) continue
    throw error
  }
}
for (const farm of DEMO_DATA.farms) await fs.writeFile(`public/qr/${farm.id}.svg`, await QRCode.toString(farm.id, { type: 'svg', margin: 4, width: 320, errorCorrectionLevel: 'M', color: { dark: THEME.colors.surfaceDeep, light: THEME.colors.buttonFill } }))
await fs.writeFile('public/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="10" fill="${THEME.colors.header}"/><path d="M32 8C9 24 14 45 32 56C50 45 55 24 32 8ZM32 8V56M32 29L20 19M32 39L15 30M32 29L44 19M32 39L49 30" fill="none" stroke="${THEME.colors.text}" stroke-width="2"/></svg>`)
await fs.writeFile(`${input}/delivery-manifest.json`, JSON.stringify(stats, null, 2))
console.log(`Prepared ${stats.length} responsive photographic files and sample farm QR artwork.`)
