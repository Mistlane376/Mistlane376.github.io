/* Local-only content manager for this Hexo workspace. */
const http = require('node:http')
const fs = require('node:fs')
const fsp = require('node:fs/promises')
const path = require('node:path')
const { spawn } = require('node:child_process')

const ROOT = path.resolve(__dirname, '..')
const POSTS = path.join(ROOT, 'source', '_posts')
const ALBUMS = path.join(ROOT, 'source', 'album', 'data.json')
const THEME_CONFIG = path.join(ROOT, '_config.butterfly.yml')
const UI = path.join(__dirname, 'blog-manager.html')
const PORT = Number(process.env.BLOG_ADMIN_PORT || 4173)
const PAGES = {
  about: ['关于页', 'source/about/index.html'],
  links: ['友链页', 'source/link/index.md'],
  bangumis: ['追番页', 'source/bangumis/index.md'],
  album: ['相册页', 'source/album.md']
}

const send = (res, status, data, type = 'application/json; charset=utf-8') => {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' })
  res.end(type.includes('json') ? JSON.stringify(data) : data)
}

const readBody = req => new Promise((resolve, reject) => {
  let size = 0
  const chunks = []
  req.on('data', chunk => {
    size += chunk.length
    if (size > 12 * 1024 * 1024) return reject(new Error('请求内容超过 12MB 限制'))
    chunks.push(chunk)
  })
  req.on('end', () => {
    try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')) } catch { reject(new Error('请求格式不正确')) }
  })
  req.on('error', reject)
})

const safeFile = name => {
  const value = path.basename(String(name || ''))
  if (!value || value !== name || value.includes('..')) throw new Error('无效文件名')
  return value
}

const yamlValue = value => JSON.stringify(String(value ?? ''))
const dateString = date => String(date || '').replace('T', ' ').replace(/:\d\d\.\d+Z$/, ':00').replace(/Z$/, '')

function parsePost(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/) 
  const front = match ? match[1] : ''
  const meta = {}
  const lines = front.split(/\r?\n/)
  for (let index = 0; index < lines.length; index += 1) {
    const item = lines[index].match(/^([A-Za-z_][\w-]*):\s*(.*)$/)
    if (!item) continue
    const [, key, raw] = item
    if (raw === '') {
      const values = []
      while (/^\s+-\s+/.test(lines[index + 1] || '')) values.push(lines[++index].replace(/^\s+-\s+/, '').replace(/^['"]|['"]$/g, ''))
      meta[key] = values.length ? values : ''
    } else {
      meta[key] = raw.replace(/^['"]|['"]$/g, '')
    }
  }
  return { meta, content: text.slice(match ? match[0].length : 0), front }
}

function serializePost(meta, content) {
  const priority = ['title', 'date', 'updated', 'abbrlink', 'tags', 'categories', 'description', 'cover', 'permalink', 'top_img', 'aside', 'comments']
  const keys = [...new Set([...priority, ...Object.keys(meta)])].filter(key => meta[key] !== undefined && meta[key] !== '')
  const lines = []
  for (const key of keys) {
    const value = meta[key]
    if (Array.isArray(value)) {
      lines.push(`${key}:`)
      value.filter(Boolean).forEach(item => lines.push(`  - ${yamlValue(item)}`))
    } else if (['true', 'false'].includes(String(value)) || /^\d+$/.test(String(value)) || ['top_img', 'aside', 'comments'].includes(key)) {
      lines.push(`${key}: ${value}`)
    } else {
      lines.push(`${key}: ${yamlValue(value)}`)
    }
  }
  return `---\n${lines.join('\n')}\n---\n\n${content.replace(/^\s+/, '')}`
}

async function listPosts() {
  const files = (await fsp.readdir(POSTS)).filter(file => file.endsWith('.md'))
  const records = await Promise.all(files.map(async file => {
    const parsed = parsePost(await fsp.readFile(path.join(POSTS, file), 'utf8'))
    return { file, title: parsed.meta.title || file.replace(/\.md$/, ''), date: parsed.meta.date || '', categories: parsed.meta.categories || [], tags: parsed.meta.tags || [], description: parsed.meta.description || '' }
  }))
  return records.sort((a, b) => String(b.date).localeCompare(String(a.date)))
}

async function getAnnouncement() {
  const text = await fsp.readFile(THEME_CONFIG, 'utf8')
  const lines = text.split(/\r?\n/)
  const start = lines.findIndex(line => /^  card_announcement:$/.test(line))
  const after = start < 0 ? [] : lines.slice(start + 1)
  const end = after.findIndex(line => /^  [A-Za-z_][\w-]*:/.test(line))
  const block = after.slice(0, end < 0 ? after.length : end)
  const content = block.find(line => /^    content:/.test(line))?.replace(/^    content:\s*/, '') || ''
  return { content: content.replace(/^['"]|['"]$/g, '') }
}

async function saveAnnouncement(content) {
  const text = await fsp.readFile(THEME_CONFIG, 'utf8')
  const next = text.replace(/(^  card_announcement:\r?\n[\s\S]*?^    content:)\s*.*$/m, `$1 ${yamlValue(content)}`)
  if (next === text) throw new Error('未找到公告配置')
  await fsp.writeFile(THEME_CONFIG, next, 'utf8')
}

const run = (command, args) => new Promise((resolve, reject) => {
  const child = spawn(command, args, { cwd: ROOT, shell: process.platform === 'win32' })
  let output = ''
  child.stdout.on('data', chunk => { output = (output + chunk).slice(-24000) })
  child.stderr.on('data', chunk => { output = (output + chunk).slice(-24000) })
  child.on('error', reject)
  child.on('close', code => code === 0 ? resolve({ output }) : reject(new Error(output || `命令退出码 ${code}`)))
})

async function listImages(folder = path.join(ROOT, 'source', 'images'), prefix = '/images') {
  if (!fs.existsSync(folder)) return []
  const entries = await fsp.readdir(folder, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async entry => {
    if (entry.isDirectory()) return listImages(path.join(folder, entry.name), `${prefix}/${entry.name}`)
    if (/\.(png|jpe?g|gif|webp|svg)$/i.test(entry.name)) return [`${prefix}/${entry.name}`]
    return []
  }))
  return nested.flat().sort()
}

async function route(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const method = req.method
  if (method === 'GET' && url.pathname === '/') return send(res, 200, await fsp.readFile(UI, 'utf8'), 'text/html; charset=utf-8')
  if (method === 'GET' && url.pathname === '/api/overview') {
    const [posts, albums, announcement] = await Promise.all([listPosts(), fsp.readFile(ALBUMS, 'utf8').then(JSON.parse), getAnnouncement()])
    return send(res, 200, { posts: posts.length, albums: albums.albums?.length || 0, photos: (albums.albums || []).reduce((sum, album) => sum + (album.photos?.length || 0), 0), announcement: announcement.content })
  }
  if (method === 'GET' && url.pathname === '/api/posts') return send(res, 200, await listPosts())
  if (method === 'GET' && url.pathname === '/api/post') {
    const file = safeFile(url.searchParams.get('file'))
    const parsed = parsePost(await fsp.readFile(path.join(POSTS, file), 'utf8'))
    return send(res, 200, { file, meta: parsed.meta, content: parsed.content })
  }
  if (method === 'POST' && url.pathname === '/api/post') {
    const input = await readBody(req)
    const isNew = !input.file
    const file = isNew ? safeFile(input.fileName || `${dateString(input.meta?.date).slice(0, 10)} ${input.meta?.title || '未命名文章'}.md`) : safeFile(input.file)
    const target = path.join(POSTS, file.endsWith('.md') ? file : `${file}.md`)
    if (isNew && fs.existsSync(target)) throw new Error('同名文章已存在，请更换文件名')
    const previous = fs.existsSync(target) ? parsePost(await fsp.readFile(target, 'utf8')).meta : {}
    const meta = { ...previous, ...input.meta, updated: dateString(new Date().toISOString()) }
    if (isNew && !meta.date) meta.date = dateString(new Date().toISOString())
    meta.tags = String(input.meta?.tags || '').split(',').map(item => item.trim()).filter(Boolean)
    meta.categories = String(input.meta?.categories || '').split(',').map(item => item.trim()).filter(Boolean)
    await fsp.writeFile(target, serializePost(meta, input.content || ''), 'utf8')
    return send(res, 200, { file: path.basename(target) })
  }
  if (method === 'DELETE' && url.pathname === '/api/post') {
    const input = await readBody(req)
    await fsp.unlink(path.join(POSTS, safeFile(input.file)))
    return send(res, 200, { ok: true })
  }
  if (method === 'GET' && url.pathname === '/api/announcement') return send(res, 200, await getAnnouncement())
  if (method === 'PUT' && url.pathname === '/api/announcement') { await saveAnnouncement((await readBody(req)).content || ''); return send(res, 200, { ok: true }) }
  if (method === 'GET' && url.pathname === '/api/albums') return send(res, 200, JSON.parse(await fsp.readFile(ALBUMS, 'utf8')))
  if (method === 'PUT' && url.pathname === '/api/albums') {
    const data = await readBody(req)
    if (!Array.isArray(data.albums)) throw new Error('相册数据需要包含 albums 数组')
    await fsp.writeFile(ALBUMS, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
    return send(res, 200, { ok: true })
  }
  if (method === 'GET' && url.pathname === '/api/pages') return send(res, 200, Object.fromEntries(Object.entries(PAGES).map(([id, [label]]) => [id, label])))
  if (method === 'GET' && url.pathname === '/api/page') {
    const page = PAGES[url.searchParams.get('id')]
    if (!page) throw new Error('未知页面')
    return send(res, 200, { content: await fsp.readFile(path.join(ROOT, page[1]), 'utf8') })
  }
  if (method === 'PUT' && url.pathname === '/api/page') {
    const input = await readBody(req); const page = PAGES[input.id]
    if (!page) throw new Error('未知页面')
    await fsp.writeFile(path.join(ROOT, page[1]), input.content || '', 'utf8')
    return send(res, 200, { ok: true })
  }
  if (method === 'GET' && url.pathname === '/api/images') return send(res, 200, await listImages())
  if (method === 'POST' && url.pathname === '/api/upload') {
    const input = await readBody(req)
    const name = safeFile(input.name || 'upload')
    if (!/\.(png|jpe?g|gif|webp|svg)$/i.test(name)) throw new Error('仅支持图片文件')
    const data = String(input.data || '').replace(/^data:[^;]+;base64,/, '')
    const buffer = Buffer.from(data, 'base64')
    if (!buffer.length) throw new Error('未读取到图片数据')
    const dir = path.join(ROOT, 'source', 'images', 'uploads')
    await fsp.mkdir(dir, { recursive: true })
    const output = `${Date.now()}-${name.replace(/[^\w.()-]/g, '-')}`
    await fsp.writeFile(path.join(dir, output), buffer)
    return send(res, 200, { path: `/images/uploads/${output}` })
  }
  if (method === 'POST' && url.pathname === '/api/action') {
    const action = (await readBody(req)).name
    const args = action === 'bangumi' ? ['tools/update-bangumi.js'] : action === 'build' ? ['run', 'build'] : null
    if (!args) throw new Error('未知操作')
    const result = await run(action === 'bangumi' ? 'node' : 'npm', args)
    return send(res, 200, result)
  }
  send(res, 404, { error: '未找到接口' })
}

http.createServer((req, res) => route(req, res).catch(error => send(res, 400, { error: error.message || '操作失败' }))).listen(PORT, '127.0.0.1', () => {
  console.log(`Mistlane 博客管理台: http://127.0.0.1:${PORT}`)
})
