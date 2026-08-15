document.addEventListener('DOMContentLoaded', async () => {
  const categoryList = document.querySelector('.type-categories .category-list')
  if (!categoryList) return

  let details = {}
  try {
    const response = await fetch('/data/category-cards.json')
    if (response.ok) details = await response.json()
  } catch (_) {
    // Unconfigured or unavailable data still renders a useful category card.
  }

  categoryList.querySelectorAll('.category-list-item').forEach((item) => {
    const link = item.querySelector('.category-list-link')
    const count = item.querySelector('.category-list-count')
    if (!link || !count) return

    const name = link.textContent.trim()
    const detail = details[name] || {}
    const description = detail.description || '浏览这个主题下的所有文章。'
    const cover = detail.cover || '/images/selection1.jpg'

    item.classList.add('category-card')
    item.style.setProperty('--category-cover', `url("${cover}")`)
    item.style.setProperty('--category-accent', detail.accent || '#217a9b')

    const coverElement = document.createElement('span')
    coverElement.className = 'category-card-cover'
    coverElement.setAttribute('aria-hidden', 'true')

    const content = document.createElement('span')
    content.className = 'category-card-content'

    const label = document.createElement('span')
    label.className = 'category-card-label'
    label.textContent = '分类'

    const title = document.createElement('span')
    title.className = 'category-card-title'
    title.textContent = name

    const summary = document.createElement('span')
    summary.className = 'category-card-summary'
    summary.textContent = description

    const footer = document.createElement('span')
    footer.className = 'category-card-footer'

    const total = document.createElement('span')
    total.className = 'category-card-total'
    total.textContent = `${count.textContent.trim()} 篇文章`

    const arrow = document.createElement('span')
    arrow.className = 'category-card-arrow'
    arrow.innerHTML = '<i class="fas fa-arrow-right" aria-hidden="true"></i>'

    link.textContent = ''
    footer.append(total, arrow)
    content.append(label, title, summary, footer)
    link.append(coverElement, content)
    count.remove()
  })
})
