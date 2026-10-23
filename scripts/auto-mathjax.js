'use strict'

// Load MathJax only on pages that actually contain math.
//
// `math.per_page` is false, so the theme loads MathJax when the page has a
// truthy `mathjax` flag. This filter sets that flag automatically by looking
// for TeX delimiters in the rendered content (code blocks are ignored).
// An explicit `mathjax:` in the front-matter always wins.

const INLINE_MATH = /(^|[\s>([{])$(?!\$|\s)[^$\n]{1,200}?(?<!\s|\$)\$(?!\$)(?=$|[\s<.,;:!?)\]}"'])/m
const DISPLAY_MATH = /\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)/

const stripCode = html => html.replace(/<pre[\s\S]*?<\/pre>/gi, '').replace(/<code[\s\S]*?<\/code>/gi, '')

hexo.extend.filter.register('after_post_render', data => {
  if (typeof data.mathjax !== 'undefined') return data
  if (!data.content) return data
  const content = stripCode(data.content)
  if (DISPLAY_MATH.test(content) || INLINE_MATH.test(content)) data.mathjax = true
  return data
})
