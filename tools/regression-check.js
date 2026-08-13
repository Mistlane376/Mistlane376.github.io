'use strict'

const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const publicDir = path.join(root, 'public')
const failures = []
const passes = []

const assert = (condition, message) => {
  if (condition) passes.push(message)
  else failures.push(message)
}

const read = relative => {
  const target = path.join(publicDir, relative)
  return fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : ''
}

assert(fs.existsSync(publicDir), 'public output exists')
const home = read('index.html')
assert(Boolean(home), 'home page generated')

const requiredAssets = [
  '/css/mistlane/markdown.css',
  '/css/mistlane/site-polish.css',
  '/css/mistlane/content-paths.css',
  '/css/mistlane/rss.css',
  '/css/mistlane/code-enhancements.css',
  '/js/mistlane/music-manager.js',
  '/js/mistlane/appearance-settings.js',
  '/js/mistlane/code-enhancements.js'
  ,'/js/mistlane/rss.js'
]
requiredAssets.forEach(asset => assert(home.includes(asset), `global asset included: ${asset}`))

const idCount = (html, id) => (html.match(new RegExp(`id=["']${id}["']`, 'g')) || []).length
assert(idCount(home, 'mistlane-settings-toggle') === 1, 'one settings toggle on home page')
assert(/id=["']rightside["'][\s\S]*id=["']mistlane-settings-toggle["']/.test(home), 'settings toggle is integrated into rightside tools')
assert(idCount(home, 'mistlane-global-audio') === 1, 'one persistent audio element on home page')
assert(home.includes('new Pjax('), 'PJAX navigation is initialized')
assert(/<script[^>]+src=["'][^"']*pjax[^"']*\.js/.test(home), 'PJAX runtime is loaded')
assert(home.includes('src="/js/pjax.min.js"'), 'PJAX runtime is served locally')
assert(home.includes('data-pjax'), 'persistent third-party scripts retain PJAX marker')

const musicManager = read('js/mistlane/music-manager.js')
assert(musicManager.includes('fm:play-state'), 'music views share Firefly-style state events')
assert(musicManager.includes('fetchMeting'), 'music manager supports Meting API fallbacks')
assert(!musicManager.includes('mistlane-music-state-v2'), 'music manager does not restore playback after navigation')
assert(!musicManager.includes('mistlane-music-mode'), 'play mode remains in memory only')
assert(home.includes('preload="none"'), 'global audio does not preload or autoplay')

const rss = read('rss/index.html')
assert(Boolean(rss), 'rss page generated')
assert(rss.includes('/atom.xml'), 'rss page exposes Atom feed address')
assert(rss.includes('data-rss-copy'), 'rss page includes copy action')

assert(Boolean(read(path.join('series', 'index.html'))), 'learning paths page generated')
assert(Boolean(read(path.join('moments', 'index.html'))), 'moments page generated')
assert(!fs.existsSync(path.join(publicDir, 'projects', 'index.html')), 'removed projects page stays absent')

const search = read('search.xml') || read('search.json')
assert(!search.includes('/album/private/'), 'private album paths are excluded from search')

const featurePages = ['about/index.html', 'album/index.html', 'link/index.html']
featurePages.forEach(relative => assert(Boolean(read(relative)), `${relative} generated`))
assert(home.includes('/series/') && home.includes('/moments/'), 'learning paths and moments are present in navigation')
assert(!home.includes('id="pagination"'), 'home pagination is removed')
assert(home.includes('card-today') && home.includes('card-calendar'), 'left sidebar includes year progress and calendar')
assert(home.includes('card-announcement') && home.includes('card-visitor-stats') && home.includes('card-quick-links'), 'right sidebar includes announcement, visitor stats and quick links')
assert(home.includes('href="/rss/"') && home.includes('SUBSCRIBE'), 'quick links include RSS subscription')

passes.forEach(message => console.log(`[pass] ${message}`))
if (failures.length) {
  failures.forEach(message => console.error(`[fail] ${message}`))
  process.exitCode = 1
} else {
  console.log(`Regression check complete: ${passes.length} checks passed.`)
}
