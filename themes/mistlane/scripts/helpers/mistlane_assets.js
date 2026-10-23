'use strict'

// Mistlane asset injection.
//
// The bundles are produced by themes/mistlane/build/build.mjs. This helper
// decides which bundles a page needs, renders the tags for the initial HTML
// and emits a marker the browser-side loader uses after PJAX navigation
// (see assets-src/js/lib/page-assets.js).

const fs = require('fs')
const path = require('path')

const MANIFEST_FILE = path.join('source', 'js', 'mistlane', 'dist', 'manifest.json')
const JS_DIR = '/js/mistlane/dist/'
const CSS_DIR = '/css/mistlane/dist/'

let manifestCache = { mtimeMs: 0, data: null }

const readManifest = () => {
  const file = path.join(hexo.theme_dir, MANIFEST_FILE)
  try {
    const stat = fs.statSync(file)
    if (manifestCache.data && manifestCache.mtimeMs === stat.mtimeMs) return manifestCache.data
    manifestCache = { mtimeMs: stat.mtimeMs, data: JSON.parse(fs.readFileSync(file, 'utf8')) }
    return manifestCache.data
  } catch (error) {
    throw new Error(`[mistlane] 资源清单不可用：${file}，请先运行 npm run assets:prepare（${error.message}）`)
  }
}

// Bundle set per page kind. Keep in sync with themed entries in
// themes/mistlane/assets-src/js and assets-src/css.
const resolveBundles = (pageType, page) => {
  const js = ['core']
  const css = ['core']

  if (pageType !== 'post') {
    js.push('sidebar')
    css.push('sidebar')
  }

  switch (page && page.type) {
    case 'archive-hub':
      js.push('archive')
      break
    case 'album':
      js.push('album')
      css.push('album')
      break
    case 'categories':
    case 'category':
      js.push('browse')
      break
    case 'bangumis':
      js.push('browse')
      break
    case 'link':
      js.push('browse')
      css.push('link')
      break
    case 'guestbook':
      css.push('guestbook')
      break
    case 'about':
      css.push('about')
      break
  }

  if (pageType === 'home') js.push('home')
  if (pageType === 'category') js.push('browse')

  return { js: [...new Set(js)], css: [...new Set(css)] }
}

const bundleUrl = (kind, name, manifest) => {
  const file = manifest[kind][name]
  if (!file) throw new Error(`[mistlane] 资源清单缺少 ${kind} 包：${name}`)
  return (kind === 'js' ? JS_DIR : CSS_DIR) + file
}

hexo.extend.helper.register('mistlane_assets', function (pageType, page) {
  const manifest = readManifest()
  const bundles = resolveBundles(pageType, page)
  const url = (kind, name) => this.url_for(bundleUrl(kind, name, manifest))

  return [
    ...bundles.css.map(name => `<link rel="stylesheet" href="${url('css', name)}" id="mistlane-css-${name}" data-mistlane-css="${name}">`),
    ...bundles.js.map(name => `<script defer src="${url('js', name)}" data-mistlane="${name}"></script>`)
  ].join('')
})

// The marker travels inside #body-wrap, so after PJAX swaps the page content
// the runtime loader (assets-src/js/lib/page-assets.js) can read the bundle
// urls for the new page and pull in whatever is not loaded yet.
hexo.extend.helper.register('mistlane_page_bundles', function (pageType, page) {
  const manifest = readManifest()
  const bundles = resolveBundles(pageType, page)
  const urls = (kind, names) => Object.fromEntries(names.map(name => [name, this.url_for(bundleUrl(kind, name, manifest))]))
  const json = JSON.stringify({ js: urls('js', bundles.js), css: urls('css', bundles.css) })

  return `<div id="mistlane-page-bundles" hidden data-bundles='${json.replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/</g, '&lt;')}'></div>`
})
