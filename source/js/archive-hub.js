const initializeArchiveHub = async () => {
  const hub = document.getElementById('archive-hub')
  if (!hub || hub.dataset.ready === 'true') return
  hub.dataset.ready = 'true'

  const panel = hub.querySelector('.archive-hub-panel')
  const summary = hub.querySelector('[data-archive-summary]')
  const buttons = [...hub.querySelectorAll('[data-archive-view]')]

  try {
    const [categoriesResponse, tagsResponse, detailsResponse] = await Promise.all([
      fetch('/categories/'),
      fetch('/tags/'),
      fetch('/data/category-cards.json')
    ])
    const categoriesDocument = new DOMParser().parseFromString(await categoriesResponse.text(), 'text/html')
    const tagsDocument = new DOMParser().parseFromString(await tagsResponse.text(), 'text/html')
    const details = detailsResponse.ok ? await detailsResponse.json() : {}
    const categories = [...categoriesDocument.querySelectorAll('.category-list-item')].map((item) => {
      const link = item.querySelector('.category-list-link')
      const count = item.querySelector('.category-list-count')
      return link ? { name: link.textContent.trim(), href: link.getAttribute('href'), count: count?.textContent.trim() || '0' } : null
    }).filter(Boolean)
    const tags = [...tagsDocument.querySelectorAll('.tag-cloud-list a')].map((link) => ({
      name: link.textContent.trim().replace(/^#\s*/, ''),
      href: link.getAttribute('href'),
      count: link.querySelector('sup')?.textContent.trim() || ''
    }))
    const postCount = categories.reduce((total, category) => total + Number(category.count || 0), 0)

    hub.querySelector('[data-archive-category-count]').textContent = categories.length
    hub.querySelector('[data-archive-tag-count]').textContent = tags.length
    hub.querySelector('[data-archive-post-count]').textContent = postCount

    const renderCategories = () => {
      summary.textContent = `${categories.length} 个分类 · ${postCount} 篇文章`
      panel.innerHTML = ''
      const grid = document.createElement('div')
      grid.className = 'archive-category-grid'
      categories.forEach((category) => {
        const detail = details[category.name] || {}
        const card = document.createElement('a')
        card.className = 'archive-category-card'
        card.href = category.href
        card.style.setProperty('--archive-accent', detail.accent || '#217a9b')
        card.style.setProperty('--archive-cover', `url("${detail.cover || '/images/selection1.jpg'}")`)
        card.innerHTML = `<span class="archive-category-cover" aria-hidden="true"></span><span class="archive-category-info"><span class="archive-category-label">分类</span><strong>${category.name}</strong><span>${detail.description || '浏览这个主题下的文章。'}</span><small>${category.count} 篇文章 <i class="fas fa-arrow-right" aria-hidden="true"></i></small></span>`
        grid.append(card)
      })
      panel.append(grid)
    }

    const renderTags = () => {
      summary.textContent = `${tags.length} 个标签 · 按主题快速定位内容`
      panel.innerHTML = ''
      const cloud = document.createElement('div')
      cloud.className = 'archive-tag-cloud'
      tags.forEach((tag, index) => {
        const tagLink = document.createElement('a')
        tagLink.href = tag.href
        tagLink.style.setProperty('--tag-index', index)
        tagLink.innerHTML = `<i class="fas fa-hashtag" aria-hidden="true"></i><span>${tag.name}</span>${tag.count ? `<small>${tag.count}</small>` : ''}`
        cloud.append(tagLink)
      })
      panel.append(cloud)
    }

    const render = (view) => {
      hub.dataset.view = view
      buttons.forEach((button) => {
        const active = button.dataset.archiveView === view
        button.classList.toggle('is-active', active)
        button.setAttribute('aria-selected', String(active))
      })
      if (view === 'tags') renderTags()
      else renderCategories()
    }

    buttons.forEach((button) => button.addEventListener('click', () => render(button.dataset.archiveView)))
    render(window.location.hash === '#tags' ? 'tags' : 'categories')
  } catch (_) {
    summary.textContent = '归档暂时无法加载，请稍后重试。'
  }
}

document.addEventListener('DOMContentLoaded', initializeArchiveHub)
document.addEventListener('pjax:complete', initializeArchiveHub)
