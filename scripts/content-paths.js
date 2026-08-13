'use strict'

const fs = require('fs')
const path = require('path')
const frontMatter = require('hexo-front-matter')

const asTimestamp = value => {
  const time = new Date(value || 0).getTime()
  return Number.isFinite(time) ? time : 0
}

const sortSeriesPosts = posts => posts.slice().sort((a, b) => {
  const orderA = Number.isFinite(Number(a.series_order)) ? Number(a.series_order) : Infinity
  const orderB = Number.isFinite(Number(b.series_order)) ? Number(b.series_order) : Infinity
  if (orderA !== orderB) return orderA - orderB
  return asTimestamp(a.date) - asTimestamp(b.date)
})

const buildSeries = posts => {
  const groups = new Map()
  posts.forEach(post => {
    if (!post.series || post.draft) return
    const name = String(post.series).trim()
    if (!name) return
    if (!groups.has(name)) groups.set(name, [])
    groups.get(name).push(post)
  })

  return [...groups.entries()].map(([name, items]) => {
    const ordered = sortSeriesPosts(items)
    const latest = ordered.reduce((value, post) => Math.max(value, asTimestamp(post.updated || post.date)), 0)
    return {
      name,
      slug: encodeURIComponent(name),
      count: ordered.length,
      latest,
      description: ordered.find(post => post.series_description)?.series_description || '',
      posts: ordered.map((post, index) => ({
        title: post.title,
        path: post.path,
        description: post.description || post.excerpt || '',
        date: post.date,
        updated: post.updated,
        cover: post.cover,
        index: index + 1
      }))
    }
  }).sort((a, b) => b.latest - a.latest)
}

const readMoments = hexo => {
  const directory = path.join(hexo.source_dir, '_moments')
  if (!fs.existsSync(directory)) return []

  return fs.readdirSync(directory)
    .filter(file => /\.md$/i.test(file))
    .map(file => {
      const source = fs.readFileSync(path.join(directory, file), 'utf8')
      const data = frontMatter.parse(source)
      const published = data.date || data.published
      return {
        id: path.basename(file, path.extname(file)),
        date: published,
        timestamp: asTimestamp(published),
        mood: data.mood || '',
        location: data.location || '',
        tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [],
        images: Array.isArray(data.images) ? data.images : data.images ? [data.images] : [],
        pinned: data.pinned === true,
        content: hexo.render.renderSync({ text: data._content || '', engine: 'markdown' })
      }
    })
    .filter(item => item.date && item.content.trim())
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.timestamp - a.timestamp)
}

const pad = value => String(value).padStart(2, '0')
const localDateTime = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
const momentFileName = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}.md`

hexo.extend.console.register('moment', 'Create a short local moment.', {
  usage: 'hexo moment <content>'
}, function (args) {
  const content = args._.join(' ').trim()
  if (!content) {
    hexo.log.info('Usage: npm run moment:new -- "今天完成了..."')
    return
  }

  const now = new Date()
  const directory = path.join(hexo.source_dir, '_moments')
  const target = path.join(directory, momentFileName(now))
  const document = [
    '---',
    `date: ${localDateTime(now)}`,
    'mood: ',
    'location: ',
    'tags:',
    '  - 学习记录',
    'images: []',
    'pinned: false',
    '---',
    '',
    content,
    ''
  ].join('\n')

  fs.mkdirSync(directory, { recursive: true })
  fs.writeFileSync(target, document, 'utf8')
  hexo.log.info(`Created ${path.relative(hexo.base_dir, target)}`)
})

hexo.extend.generator.register('mistlane-content-paths', locals => {
  const seriesGroups = buildSeries(locals.posts.toArray())
  const moments = readMoments(hexo)
  hexo._mistlaneSeries = seriesGroups

  return [
    {
      path: 'series/index.html',
      layout: ['page'],
      data: {
        title: '学习路径',
        type: 'series',
        comments: false,
        aside: true,
        seriesGroups
      }
    },
    {
      path: 'moments/index.html',
      layout: ['page'],
      data: {
        title: '动态',
        type: 'moments',
        comments: false,
        aside: true,
        moments
      }
    }
  ]
})

hexo.extend.helper.register('seriesContext', function (post) {
  if (!post || !post.series) return null
  const groups = hexo._mistlaneSeries || buildSeries(hexo.locals.get('posts').toArray())
  const group = groups.find(item => item.name === String(post.series).trim())
  if (!group) return null
  const currentIndex = group.posts.findIndex(item => item.path === post.path)
  if (currentIndex < 0) return null

  return {
    ...group,
    current: currentIndex + 1,
    percent: Math.round(((currentIndex + 1) / group.count) * 100),
    previous: group.posts[currentIndex - 1] || null,
    next: group.posts[currentIndex + 1] || null
  }
})
