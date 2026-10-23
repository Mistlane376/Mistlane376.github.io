// Mistlane asset pipeline.
//
// Bundles the modular sources under `themes/mistlane/assets-src` into the
// hashed, minified files Hexo copies to the site. A manifest records the
// hashed names: the theme helper reads it to render the right tags per page
// and the browser-side loader reads an inlined copy for PJAX navigation.
//
// Usage: node themes/mistlane/build/build.mjs [--watch]
import { build } from 'esbuild'
import { gzipSync } from 'node:zlib'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const themeRoot = path.resolve(here, '..')
const srcRoot = path.join(themeRoot, 'assets-src')
const jsOut = path.join(themeRoot, 'source', 'js', 'mistlane', 'dist')
const cssOut = path.join(themeRoot, 'source', 'css', 'mistlane', 'dist')

const jsEntries = ['core', 'sidebar', 'home', 'archive', 'browse', 'album']
const cssEntries = ['core', 'sidebar', 'album', 'guestbook', 'about', 'link']

const entryPoints = (names, dir, ext) =>
  Object.fromEntries(names.map(name => [name, path.join(srcRoot, dir, `${name}.${ext}`)]))

const common = {
  bundle: true,
  minify: true,
  write: false,
  metafile: true,
  logLevel: 'silent'
}

const writeOutputs = (result, dest) => {
  const files = []
  for (const output of result.outputFiles) {
    fs.mkdirSync(dest, { recursive: true })
    fs.writeFileSync(output.path, output.contents)
    files.push({
      name: path.basename(output.path),
      size: output.contents.length,
      gzip: gzipSync(output.contents).length
    })
  }
  return files
}

const buildAll = async () => {
  if (fs.existsSync(jsOut)) fs.rmSync(jsOut, { recursive: true })
  if (fs.existsSync(cssOut)) fs.rmSync(cssOut, { recursive: true })

  // `[name].[hash]` keeps deterministic names per content, which lets the
  // site serve the bundles with long-lived immutable caching.
  const [jsResult, cssResult] = await Promise.all([
    build({
      ...common,
      entryNames: '[name].[hash]',
      entryPoints: entryPoints(jsEntries, 'js', 'js'),
      outdir: jsOut,
      format: 'iife',
      target: 'es2020'
    }),
    build({
      ...common,
      entryNames: '[name].[hash]',
      entryPoints: entryPoints(cssEntries, 'css', 'css'),
      outdir: cssOut,
      // Public asset URLs are served by the site as-is; never resolve them.
      external: ['/images/*', '/fonts/*']
    })
  ])

  const js = writeOutputs(jsResult, jsOut)
  const css = writeOutputs(cssResult, cssOut)

  const manifest = {
    generatedAt: new Date().toISOString(),
    js: Object.fromEntries(js.map(file => [file.name.split('.')[0], file.name])),
    css: Object.fromEntries(css.map(file => [file.name.split('.')[0], file.name]))
  }
  fs.writeFileSync(path.join(jsOut, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)

  const report = [['JS ', js], ['CSS', css]].flatMap(([kind, files]) =>
    files
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(file => `${kind}  ${file.name.padEnd(26)} ${String((file.size / 1024).toFixed(1)).padStart(7)} KB  (gzip ${(file.gzip / 1024).toFixed(1)} KB)`)
  )
  console.log(`[mistlane] built ${js.length} JS + ${css.length} CSS bundles`)
  report.forEach(line => console.log(`[mistlane] ${line}`))
}

const watch = process.argv.includes('--watch')

if (watch) {
  let timer = null
  const schedule = () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      buildAll().catch(error => {
        console.error('[mistlane] rebuild failed')
        console.error(error)
      })
    }, 120)
  }
  for (const dir of [path.join(srcRoot, 'js'), path.join(srcRoot, 'css')]) {
    fs.watch(dir, { recursive: true }, schedule)
  }
  await buildAll()
  console.log('[mistlane] watching assets-src for changes (Ctrl+C to stop)')
} else {
  await buildAll()
}
