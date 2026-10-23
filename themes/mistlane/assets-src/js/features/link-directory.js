import { onMount } from '../lib/lifecycle'
import { countUp } from '../lib/anim'

const ACCENTS = ['var(--ui-teal)', 'var(--ui-coral)', 'var(--ui-blue)', 'var(--ui-plum)']

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])

const domainOf = href => {
  try {
    return href ? new URL(href, window.location.href).hostname.replace(/^www\./, '') : ''
  } catch (_) {
    return ''
  }
}

const copyText = async text => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch (_) {
    // Fall through to the legacy path when the clipboard API is unavailable.
  }
  try {
    const helper = document.createElement('textarea')
    helper.value = text
    helper.setAttribute('readonly', '')
    helper.style.position = 'fixed'
    helper.style.opacity = '0'
    document.body.append(helper)
    helper.select()
    const ok = document.execCommand('copy')
    helper.remove()
    return ok
  } catch (_) {
    return false
  }
}

const initializeExchangeCopy = page => {
  page.querySelectorAll('.link-exchange-code').forEach(block => {
    const pre = block.querySelector('pre')
    if (!pre || block.querySelector('.link-exchange-copy')) return
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'link-exchange-copy'
    button.innerHTML = '<i class="fas fa-copy" aria-hidden="true"></i><span>复制</span>'
    button.addEventListener('click', async () => {
      const clone = pre.cloneNode(true)
      clone.querySelectorAll('br').forEach(lineBreak => lineBreak.replaceWith('\n'))
      const ok = await copyText(clone.textContent.trim())
      button.classList.toggle('is-done', ok)
      button.innerHTML = ok
        ? '<i class="fas fa-check" aria-hidden="true"></i><span>已复制</span>'
        : '<i class="fas fa-xmark" aria-hidden="true"></i><span>复制失败</span>'
      window.clearTimeout(button.restoreTimer)
      button.restoreTimer = window.setTimeout(() => {
        button.classList.remove('is-done')
        button.innerHTML = '<i class="fas fa-copy" aria-hidden="true"></i><span>复制</span>'
      }, 1800)
    })
    block.append(button)
  })
}

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
    categoryItems.forEach(item => {
      item.dataset.linkCategory = category
      items.push(item)
    })
  })

  if (!items.length) return

  const domains = new Set()

  items.forEach((item, index) => {
    const anchor = item.querySelector('a')
    if (!anchor) return
    const href = anchor.getAttribute('href') || ''
    const domain = domainOf(href)
    if (domain) domains.add(domain)
    const name = item.querySelector('.flink-item-name')?.textContent.trim() || anchor.getAttribute('title') || domain || '这位朋友'
    const description = item.querySelector('.flink-item-desc')?.textContent.trim()
    const avatar = item.querySelector('.flink-item-icon img')?.getAttribute('src') || '/img/friend_404.gif'

    item.style.setProperty('--link-index', String(index))
    item.style.setProperty('--link-accent', ACCENTS[index % ACCENTS.length])
    anchor.innerHTML = `
      <span class="flink-item-icon"><img class="no-lightbox" src="${escapeHtml(avatar)}" alt="${escapeHtml(name)}" loading="lazy" onerror="this.onerror=null;this.src='/img/friend_404.gif'"></span>
      <span class="flink-item-body">
        <span class="flink-item-head">
          <span class="flink-item-name">${escapeHtml(name)}</span>
          ${domain ? `<span class="flink-item-domain">${escapeHtml(domain)}</span>` : ''}
        </span>
        <span class="flink-item-desc" title="${escapeHtml(description || '')}">${escapeHtml(description || '这位朋友还没有写简介。')}</span>
      </span>
      <span class="flink-item-visit" aria-hidden="true"><i class="fas fa-arrow-right"></i></span>
    `
  })

  const heroCopy = document.createElement('div')
  heroCopy.className = 'link-directory-hero-copy'
  heroCopy.innerHTML = `
    <div class="link-directory-hero-text">
      <span class="link-directory-kicker"><i class="fas fa-link" aria-hidden="true"></i> FRIEND LINK DIRECTORY</span>
      <h1>友链</h1>
      <p>收藏值得长期回访的个人站点与创作空间。</p>
    </div>
    <div class="link-directory-stats" role="group" aria-label="友链统计">
      <div><strong data-stat="links">0</strong><em>个友链</em></div>
      <div><strong data-stat="types">0</strong><em>种类型</em></div>
      <div><strong data-stat="domains">0</strong><em>个独立域名</em></div>
    </div>
  `
  countUp(heroCopy.querySelector('[data-stat="links"]'), items.length)
  countUp(heroCopy.querySelector('[data-stat="types"]'), categories.length)
  countUp(heroCopy.querySelector('[data-stat="domains"]'), domains.size)

  categories.forEach(entry => {
    const section = document.createElement('header')
    section.className = 'link-directory-section-heading'
    section.innerHTML = `<div><span>LINK COLLECTION</span><h2>${escapeHtml(entry.name)}</h2></div><small>${entry.count} 个站点</small>`
    entry.list.before(section)
  })

  directory.prepend(heroCopy)

  initializeExchangeCopy(page)
}

onMount(initializeLinkDirectory)
