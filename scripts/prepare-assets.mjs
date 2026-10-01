import fs from 'node:fs/promises'
import sharp from 'sharp'
import QRCode from 'qrcode'
import { SITE } from '../src/constants/site.ts'

await fs.mkdir('public/images', { recursive: true })
await fs.mkdir('public/qr', { recursive: true })
for (const name of ['ube-root', 'ube-trellis']) {
  await sharp(`design/assets/${name}.png`).resize({ width: name === 'ube-root' ? 1100 : 1000, withoutEnlargement: true }).webp({ quality: 88, alphaQuality: 95 }).toFile(`public/images/${name}.webp`)
}
for (const farm of SITE.farms) {
  await fs.writeFile(`public/qr/${farm.id}.svg`, await QRCode.toString(farm.id, { type: 'svg', margin: 3, width: 280, errorCorrectionLevel: 'M', color: { dark: SITE.colors.ink, light: SITE.colors.paper } }))
}
await fs.writeFile('public/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="${SITE.colors.cream}"/><path d="M16 46C9 26 29 12 49 16C53 35 40 53 16 46Z" fill="${SITE.colors.green}"/><path d="M17 47L42 24" stroke="${SITE.colors.lime}" stroke-width="3"/></svg>`)
console.log('Botanical WebP assets, sample farm QR codes, and palette favicon prepared.')
