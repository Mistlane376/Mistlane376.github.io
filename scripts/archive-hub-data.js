/* Build a compact archive index so the archive hub does not download full category/tag pages. */
hexo.extend.generator.register('data/archive-hub.json', function (locals) {
  const list = collection => {
    if (!collection) return []
    if (typeof collection.toArray === 'function') return collection.toArray()
    if (Array.isArray(collection.data)) return collection.data
    return Array.isArray(collection) ? collection : []
  }
  const categories = list(locals.categories).map(item => ({ name: item.name, count: item.length || 0, href: `/categories/${encodeURIComponent(item.name)}/` }))
  const tags = list(locals.tags).map(item => ({ name: item.name, count: item.length || 0, href: `/tags/${encodeURIComponent(item.name)}/` }))
  return { path: 'data/archive-hub.json', data: JSON.stringify({ categories, tags }) }
})
