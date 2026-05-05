// One-shot generator for Techtastic PWA icons.
// Creates solid-green rounded-square icons with a white "T" wordmark in the center.
// Uses only Node built-ins (zlib for PNG compression).
//
// Run: node scripts/generate-icons.mjs

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const ACCENT = [0x00, 0xc8, 0x96] // #00C896
const WHITE = [0xff, 0xff, 0xff]
const BG_PAD = [0xfa, 0xfa, 0xf8] // matches app bg for non-maskable corners

// CRC table for PNG chunks
const crcTable = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function encodePNG(width, height, pixels /* Uint8Array RGBA */) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8       // bit depth
  ihdr[9] = 6       // color type RGBA
  ihdr[10] = 0      // compression
  ihdr[11] = 0      // filter
  ihdr[12] = 0      // interlace

  // Add per-scanline filter byte (0 = none) before each row
  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0
    pixels.subarray(y * stride, y * stride + stride).copy
      ? pixels.subarray(y * stride, y * stride + stride).copy(raw, y * (stride + 1) + 1)
      : Buffer.from(pixels.subarray(y * stride, y * stride + stride)).copy(raw, y * (stride + 1) + 1)
  }
  const idat = deflateSync(raw, { level: 9 })

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0))
  ])
}

// Simple anti-aliased rounded-rect filled with accent, with a centered white "T".
function makeIcon(size, opts = {}) {
  const { maskable = false } = opts
  const px = Buffer.alloc(size * size * 4)
  const radius = maskable ? 0 : Math.round(size * 0.22) // iOS rounds non-maskable itself, but a soft radius reads nicely

  // Pad area outside rounded corners (only when maskable=false)
  const pad = BG_PAD
  const accent = ACCENT
  const white = WHITE

  // T glyph: bar across top, vertical stem
  const barW = Math.round(size * 0.62)
  const barH = Math.round(size * 0.13)
  const stemW = Math.round(size * 0.16)
  const stemH = Math.round(size * 0.55)
  const cx = size / 2
  const topY = Math.round(size * 0.24)
  const barX0 = Math.round(cx - barW / 2)
  const barX1 = barX0 + barW
  const barY0 = topY
  const barY1 = topY + barH
  const stemX0 = Math.round(cx - stemW / 2)
  const stemX1 = stemX0 + stemW
  const stemY0 = barY0
  const stemY1 = topY + stemH

  // Small notch under bar (rocket-flame hint) — purely decorative
  const flameTopY = stemY1
  const flameBotY = Math.min(size - 2, flameTopY + Math.round(size * 0.08))
  const flameW = Math.round(stemW * 0.7)
  const flameX0 = Math.round(cx - flameW / 2)
  const flameX1 = flameX0 + flameW

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r, g, b, a = 255

      // Determine if inside rounded square
      let inside = true
      if (!maskable) {
        const dx = x < radius ? radius - x : x >= size - radius ? x - (size - 1 - radius) : 0
        const dy = y < radius ? radius - y : y >= size - radius ? y - (size - 1 - radius) : 0
        const d2 = dx * dx + dy * dy
        const r2 = radius * radius
        if (d2 > r2) inside = false
      }

      if (!inside) {
        ;[r, g, b] = pad
      } else if (
        (x >= barX0 && x < barX1 && y >= barY0 && y < barY1) ||
        (x >= stemX0 && x < stemX1 && y >= stemY0 && y < stemY1) ||
        (x >= flameX0 && x < flameX1 && y >= flameTopY && y < flameBotY)
      ) {
        ;[r, g, b] = white
      } else {
        ;[r, g, b] = accent
      }

      const i = (y * size + x) * 4
      px[i] = r
      px[i + 1] = g
      px[i + 2] = b
      px[i + 3] = a
    }
  }

  return encodePNG(size, size, px)
}

function write(name, buf) {
  const p = join(root, name)
  mkdirSync(dirname(p), { recursive: true })
  writeFileSync(p, buf)
  console.log(`wrote ${name} (${buf.length.toLocaleString()} bytes)`)
}

write('public/icons/icon-192.png', makeIcon(192))
write('public/icons/icon-512.png', makeIcon(512))
write('public/apple-touch-icon.png', makeIcon(180))
console.log('done.')
