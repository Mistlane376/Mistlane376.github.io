import { onMount } from '../lib/lifecycle'
import { loadCategoryCatalog } from '../lib/data'
import { countUp } from '../lib/anim'

// The hub pulls its category and tag indexes from the generated overview
// pages. Both are cached for the lifetime of the document so returning to
// /archive/ through PJAX does not refetch them.
let hubDataPromise = null

const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])

const loadHubData = () => {
  if (!hubDataPromise) {
    hubDataPromise = Promise.all([
      fetch('/categories/'),
      fetch('/tags/'),
      loadCategoryCatalog(),
      fetch('/data/archive-hub.json').catch(() => null)
    ]).then(([categoriesResponse, tagsResponse, details, indexResponse]) => {
      if (!categoriesResponse.ok || !tagsResponse.ok) throw new Error('archive overview unavailable')
      const indexPromise = indexResponse && indexResponse.ok ? indexResponse.json().catch(() => ({})) : Promise.resolve({})
      return Promise.all([categoriesResponse.text(), tagsResponse.text(), indexPromise]).then(([categoriesHtml, tagsHtml, hubIndex]) => {
        const categoriesDocument = new DOMParser().parseFromString(categoriesHtml, 'text/html')
        const tagsDocument = new DOMParser().parseFromString(tagsHtml, 'text/html')
        const categories = [...categoriesDocument.querySelectorAll('.category-list-item')].map(item => {
          const link = item.querySelector('.category-list-link')
          const count = item.querySelector('.category-list-count')
          return link ? { name: link.textContent.trim(), href: link.getAttribute('href'), count: count?.textContent.trim() || '0' } : null
        }).filter(Boolean)
        const tags = [...tagsDocument.querySelectorAll('.tag-cloud-list a')].map(link => ({
          name: link.textContent.trim().replace(/^#\s*/, ''),
          href: link.getAttribute('href'),
          count: link.querySelector('sup')?.textContent.trim() || '',
          // The tag overview sizes each link by posting frequency; reuse that
          // signal to weight the hub cloud without extra requests.
          size: Number.parseFloat(link.style.fontSize) || 1
        }))
        const postCount = categories.reduce((total, category) => total + Number(category.count || 0), 0)
        const recentMap = {}
        ;(hubIndex.categories || []).forEach(item => {
          if (item && item.name) recentMap[item.name] = Array.isArray(item.recent) ? item.recent : []
        })
        return { categories, tags, postCount, details, recentMap }
      })
    }).catch(error => {
      // Allow a later attempt (e.g. after PJAX returns to the hub) to retry
      // instead of caching the rejected promise for the lifetime of the page.
      hubDataPromise = null
      throw error
    })
  }
  return hubDataPromise
}

const initializeArchiveHub = async () => {
  const hub = document.getElementById('archive-hub')
  if (!hub || hub.dataset.ready === 'true') return
  hub.dataset.ready = 'true'

  const panel = hub.querySelector('.archive-hub-panel')
  const summary = hub.querySelector('[data-archive-summary]')
  const buttons = [...hub.querySelectorAll('[data-archive-view]')]

  try {
    const { categories, tags, postCount, details, recentMap } = await loadHubData()

    countUp(hub.querySelector('[data-archive-category-count]'), categories.length)
    countUp(hub.querySelector('[data-archive-tag-count]'), tags.length)
    countUp(hub.querySelector('[data-archive-post-count]'), postCount)

    const maxCount = Math.max(...categories.map(category => Number(category.count) || 0), 1)

    const renderCategories = () => {
      summary.textContent = `${categories.length} 个分类 · ${postCount} 篇文章`
      panel.innerHTML = ''
      const grid = document.createElement('div')
      grid.className = 'archive-category-grid'
      categories.forEach((category, index) => {
        const detail = details[category.name] || {}
        const count = Number(category.count) || 0
        const share = Math.round((count / maxCount) * 100)
        const card = document.createElement('a')
        const featured = index === 0 && categories.length > 2
        card.className = featured ? 'archive-category-card is-featured' : 'archive-category-card'
        card.href = category.href
        card.style.setProperty('--archive-index', index)
        card.style.setProperty('--archive-accent', detail.accent || '#217a9b')
        card.style.setProperty('--archive-cover', `url("${detail.cover || '/images/selection1.jpg'}")`)
        const recent = featured ? (recentMap[category.name] || []) : []
        const recentMarkup = recent.length
          ? `<span class="archive-category-recent"><span class="archive-category-recent-head">最近更新</span>${recent.map(item => `<span class="archive-category-recent-row"><span>${escapeHtml(item.title)}</span><em>${escapeHtml(item.date)}</em></span>`).join('')}</span>`
          : ''
        card.innerHTML = `<span class="archive-category-cover" aria-hidden="true"><span class="archive-category-count">${category.count} 篇</span></span><span class="archive-category-info"><span class="archive-category-label">分类</span><strong>${category.name}</strong><span class="archive-category-desc">${detail.description || '浏览这个主题下的文章。'}</span>${recentMarkup}<span class="archive-category-meter" aria-hidden="true"><i style="width:${share}%"></i></span><small>${category.count} 篇文章 <i class="fas fa-arrow-right" aria-hidden="true"></i></small></span>`
        grid.append(card)
      })
      panel.append(grid)
    }

    const sizeValues = tags.map(tag => tag.size)
    const maxSize = Math.max(...sizeValues, 1)
    const minSize = Math.min(...sizeValues, maxSize)

    const renderTags = () => {
      summary.textContent = `${tags.length} 个标签 · 字号越大代表文章越多`
      panel.innerHTML = ''
      const cloud = document.createElement('div')
      cloud.className = 'archive-tag-cloud'
      const ordered = [...tags].sort((left, right) => (right.size - left.size) || left.name.localeCompare(right.name, 'zh-Hans-CN'))
      ordered.forEach((tag, index) => {
        const spread = maxSize === minSize ? 1 : (tag.size - minSize) / (maxSize - minSize)
        const weight = spread >= 0.62 ? 3 : spread >= 0.24 ? 2 : 1
        const tagLink = document.createElement('a')
        tagLink.href = tag.href
        tagLink.dataset.weight = String(weight)
        tagLink.style.setProperty('--tag-index', index)
        tagLink.innerHTML = `<i class="fas fa-hashtag" aria-hidden="true"></i><span>${tag.name}</span>${tag.count ? `<small>${tag.count}</small>` : ''}`
        cloud.append(tagLink)
      })
      panel.append(cloud)
    }

    const render = view => {
      hub.dataset.view = view
      buttons.forEach(button => {
        const active = button.dataset.archiveView === view
        button.classList.toggle('is-active', active)
        button.setAttribute('aria-selected', String(active))
      })
      if (view === 'tags') renderTags()
      else renderCategories()
    }

    buttons.forEach(button => button.addEventListener('click', () => render(button.dataset.archiveView)))
    render(window.location.hash === '#tags' ? 'tags' : 'categories')
  } catch (_) {
    summary.textContent = '归档暂时无法加载，请稍后重试。'
  }
}

onMount(initializeArchiveHub)
