const initializeCategoryDetail = async () => {
  const path = decodeURIComponent(window.location.pathname).replace(/\/+$/, '')
  if (!/^\/categories\/[^/]+$/.test(path)) return

  const bodyWrap = document.getElementById('body-wrap')
  const articleList = document.getElementById('recent-posts')
  const title = document.getElementById('site-title')
  if (!bodyWrap || !articleList || !title || bodyWrap.classList.contains('category-detail-page')) return

  let details = {}
  try {
    const response = await fetch('/data/category-cards.json')
    if (response.ok) details = await response.json()
  } catch (_) {
    // The page still has a complete fallback presentation without extra data.
  }

  const categoryName = title.textContent.trim()
  const detail = details[categoryName] || {}
  const entries = articleList.querySelectorAll('.recent-post-item')

  bodyWrap.classList.add('category-detail-page')
  bodyWrap.style.setProperty('--category-accent', detail.accent || '#217a9b')
  articleList.classList.add('category-article-list')

  const intro = document.createElement('section')
  intro.className = 'category-detail-intro'
  intro.setAttribute('aria-label', `${categoryName} 分类说明`)

  const breadcrumb = document.createElement('a')
  breadcrumb.className = 'category-detail-back'
  breadcrumb.href = '/categories/'
  breadcrumb.innerHTML = '<i class="fas fa-arrow-left" aria-hidden="true"></i><span>全部分类</span>'

  const heading = document.createElement('h2')
  heading.textContent = categoryName

  const description = document.createElement('p')
  description.textContent = detail.description || '围绕这个主题整理的文章与笔记。'

  const stats = document.createElement('span')
  stats.className = 'category-detail-count'
  stats.textContent = `${entries.length} 篇文章`

  intro.append(breadcrumb, heading, description, stats)
  articleList.before(intro)
}

document.addEventListener('DOMContentLoaded', initializeCategoryDetail)
document.addEventListener('pjax:complete', initializeCategoryDetail)
