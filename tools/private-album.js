'use strict'

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const inputPath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'private-albums', 'album.json')
const outputPath = process.argv[3] ? path.resolve(process.argv[3]) : path.join(root, 'source', 'album', 'private', 'album.json')
const password = process.env.ALBUM_PASSWORD || process.argv[4]

if (!password || password.length < 8) {
  console.error('Usage: $env:ALBUM_PASSWORD="at-least-8-chars"; npm run album:encrypt -- <input.json> <output.json>')
  process.exit(1)
}

const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'))
if (!Array.isArray(input.photos) || input.photos.length === 0) throw new Error('Private album needs at least one photo')

const mimeTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif'
}

const payload = {
  id: String(input.id || path.basename(inputPath, path.extname(inputPath))),
  name: String(input.name || '私密相册'),
  date: String(input.date || ''),
  location: String(input.location || ''),
  description: String(input.description || ''),
  photos: input.photos.map((photo, index) => {
    const filePath = path.resolve(path.dirname(inputPath), String(photo.file || ''))
    const extension = path.extname(filePath).toLowerCase()
    const mime = mimeTypes[extension]
    if (!mime) throw new Error(`Unsupported image type: ${extension || '(none)'}`)
    const bytes = fs.readFileSync(filePath)
    return {
      src: `data:${mime};base64,${bytes.toString('base64')}`,
      alt: String(photo.alt || `私密照片 ${index + 1}`),
      caption: String(photo.caption || ''),
      date: String(photo.date || input.date || '')
    }
  })
}

const salt = crypto.randomBytes(16)
const iv = crypto.randomBytes(12)
const iterations = 210000
const key = crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256')
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
const ciphertext = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final()])
const tag = cipher.getAuthTag()

const envelope = {
  version: 1,
  algorithm: 'AES-GCM',
  kdf: 'PBKDF2-SHA256',
  iterations,
  salt: salt.toString('base64'),
  iv: iv.toString('base64'),
  data: Buffer.concat([ciphertext, tag]).toString('base64')
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, `${JSON.stringify(envelope)}\n`)
console.log(`Encrypted ${payload.photos.length} photos to ${path.relative(root, outputPath)}`)
