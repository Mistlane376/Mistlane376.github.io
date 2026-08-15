(() => {
  'use strict'

  const initializeLinkDirectory = () => {
    const page = document.querySelector('.type-link')
    const directory = page?.querySelector('.flink')
    if (!directory || directory.dataset.directoryReady === 'true') return
    directory.dataset.directoryReady = 'true'

    const lists = [...directory.querySelectorAll('.flink-list')]
    const items = []
    const categories = []

    lists.forEach((list, listIndex) => {
      const heading = list.previousElementSibling?.previousElementSibling
      const category = heading?.tagName === 'H2' ? heading.textContent.trim() : `友链 ${listIndex + 1}`
      const categoryItems = [...list.querySelectorAll('.flink-list-item')]
      if (!categoryItems.length) return
      categories.push({ name: category, count: categoryItems.length, list })
      categoryItems.forEach((item) => {
        item.dataset.linkCategory = category
        items.push(item)
      })
    })

    if (!items.length) return

    const domains = new Set()
    items.forEach((item) => {
      const href = item.querySelector('a')?.href
      try {
        if (href) domains.add(new URL(href).hostname.replace(/^www\./, ''))
      } catch (_) {
        // Keep rendering the card when a legacy link is malformed.
      }
    })

    const heroCopy = document.createElement('div')
    heroCopy.className = 'link-directory-hero-copy'
    heroCopy.innerHTML = `
      <span class="link-directory-kicker"><i class="fas fa-link" aria-hidden="true"></i> FRIEND LINK DIRECTORY</span>
      <h1>友链</h1>
      <p>收藏值得长期回访的个人站点与创作空间。</p>
    `

    const summary = document.createElement('section')
    summary.className = 'link-directory-summary'
    summary.setAttribute('aria-label', '友链统计')
    summary.innerHTML = `
    <div class="link-directory-stats">
      <div><strong>${items.length}</strong><span>个友链</span></div>
      <div><strong>${categories.length}</strong><span>种类型</span></div>
      <div><strong>${domains.size}</strong><span>个独立域名</span></div>
    </div>
    `

    categories.forEach((entry) => {
      const section = document.createElement('header')
      section.className = 'link-directory-section-heading'
      section.innerHTML = `<div><span>LINK COLLECTION</span><h2>${entry.name}</h2></div><small>${entry.count} 个站点</small>`
      entry.list.before(section)
    })

    directory.insertBefore(heroCopy, lists[0])
    directory.insertBefore(summary, lists[0])
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLinkDirectory, { once: true })
  } else {
    initializeLinkDirectory()
  }
  document.addEventListener('pjax:complete', initializeLinkDirectory)
})()
