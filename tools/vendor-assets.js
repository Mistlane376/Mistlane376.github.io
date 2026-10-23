'use strict'

// Copy the third-party libraries that used to be pulled from jsdelivr into
// the theme so every page serves them from /vendor. Re-run through
// `npm run assets:prepare`; the outputs are git-ignored build products.

const fs = require('fs')
const path = require('path')
const esbuild = require('esbuild')

const root = path.resolve(__dirname, '..')
const vendorDir = path.join(root, 'themes', 'mistlane', 'source', 'vendor')

const copies = [
  ['@egjs/infinitegrid/dist/infinitegrid.min.js', 'infinitegrid/infinitegrid.min.js'],
  ['butterfly-extsrc/sharejs/dist/js/social-share.min.js', 'sharejs/js/social-share.min.js'],
  ['butterfly-extsrc/sharejs/dist/css/share.min.css', 'sharejs/css/share.min.css'],
  ['butterfly-extsrc/sharejs/dist/fonts/iconfont.ttf', 'sharejs/fonts/iconfont.ttf'],
  ['butterfly-extsrc/sharejs/dist/fonts/iconfont.woff', 'sharejs/fonts/iconfont.woff'],
  ['butterfly-extsrc/sharejs/dist/fonts/iconfont.woff2', 'sharejs/fonts/iconfont.woff2']
]

for (const [from, to] of copies) {
  const source = path.join(root, 'node_modules', from)
  if (!fs.existsSync(source)) throw new Error(`[mistlane] 缺少第三方依赖文件：${from}，请先运行 npm install`)
  const target = path.join(vendorDir, to)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.copyFileSync(source, target)
}

// typed.js only ships the unminified UMD bundle on npm; minify it here.
const typedSource = fs.readFileSync(path.join(root, 'node_modules', 'typed.js', 'dist', 'typed.umd.js'), 'utf8')
const typedMinified = esbuild.transformSync(typedSource, { minify: true, target: 'es2017' }).code
const typedTarget = path.join(vendorDir, 'typed', 'typed.umd.min.js')
fs.mkdirSync(path.dirname(typedTarget), { recursive: true })
fs.writeFileSync(typedTarget, typedMinified)

console.log(`[mistlane] vendored ${copies.length + 1} third-party files into themes/mistlane/source/vendor`)
