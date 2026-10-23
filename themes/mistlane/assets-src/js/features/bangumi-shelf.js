import { onMount } from '../lib/lifecycle'
import { createElement, createIcon, safeText } from '../lib/dom'
import { countUp } from '../lib/anim'

// The shelf renders the full Bangumi export as a poster wall and appends
// entries in batches, so a 500+ item collection never floods the DOM at once.
const BATCH_SIZE = 36
const STATUS_LABELS = { watched: '已看完', watching: '正在追', wantWatch: '准备开始' }

let shelfDataPromise = null

const loadShelfData = () => {
  if (!shelfDataPromise) {
    shelfDataPromise = fetch('/data/bangumis.json', { headers: { Accept: 'application/json' } })
      .then(response => {
        if (!response.ok) throw new Error(`bangumi request failed: ${response.status}`)
        return response.json()
      })
      .catch(error => {
        shelfDataPromise = null
        throw error
      })
  }
  return shelfDataPromise
}

const buildScoreBadge = work => {
  const rate = Number(work.rate)
  const score = Number(work.score)
  if (Number.isFinite(rate) && rate > 0) {
    const badge = createElement('span', 'bangumi-poster-score is-rate')
    badge.title = '我的评分'
    badge.append(createIcon('fas fa-star'), document.createTextNode(String(rate)))
    return badge
  }
  if (Number.isFinite(score) && score > 0) {
    const badge = createElement('span', 'bangumi-poster-score is-score')
    badge.title = 'Bangumi 评分'
    badge.append(createIcon('fas fa-star'), document.createTextNode(String(score)))
    return badge
  }
  return null
}

const buildCard = (work, index) => {
  const card = createElement('article', 'bangumi-shelf-card')
  card.style.setProperty('--bangumi-index', index)

  const link = createElement('a', 'bangumi-shelf-link')
  link.href = `https://bangumi.tv/subject/${work.id}`
  link.target = '_blank'
  link.rel = 'noopener'

  const poster = createElement('span', 'bangumi-poster')
  const fallback = createElement('span', 'bangumi-poster-fallback')
  let tint = 0
  for (const character of work.title) tint = (tint * 31 + (character.codePointAt(0) || 0)) % 997
  fallback.dataset.tint = String(tint % 4)
  fallback.append(createIcon('fas fa-film'), createElement('strong', '', work.title))
  poster.append(fallback)

  if (work.cover) {
    const image = document.createElement('img')
    image.src = work.cover
    image.alt = work.title
    image.loading = 'lazy'
    image.decoding = 'async'
    image.referrerPolicy = 'no-referrer'
    image.addEventListener('error', () => image.remove(), { once: true })
    poster.append(image)
  }

  const badge = buildScoreBadge(work)
  if (badge) poster.append(badge)

  if (work.des) poster.append(createElement('span', 'bangumi-poster-desc', work.des))

  const info = createElement('span', 'bangumi-shelf-info')
  info.append(createElement('strong', '', work.title))
  const meta = [work.date, work.totalCount].filter(Boolean).join(' · ')
  info.append(createElement('small', '', meta || '信息待补充'))

  link.append(poster, info)
  card.append(link)
  return card
}

const initializeBangumiShelf = async () => {
  const shelf = document.getElementById('bangumi-shelf')
  if (!shelf || shelf.dataset.ready === 'true') return
  shelf.dataset.ready = 'true'

  const grid = shelf.querySelector('[data-bangumi-grid]')
  const summary = shelf.querySelector('[data-bangumi-summary]')
  const buttons = [...shelf.querySelectorAll('[data-bangumi-status]')]
  const moreWrap = shelf.querySelector('[data-bangumi-more-wrap]')
  const moreButton = shelf.querySelector('[data-bangumi-more]')
  const collections = { watched: [], watching: [], wantWatch: [] }
  let activeStatus = 'watched'
  let shown = 0

  const worksOf = status => collections[status] || []

  const updateSummary = () => {
    const works = worksOf(activeStatus)
    summary.textContent = works.length
      ? `共 ${works.length} 部${STATUS_LABELS[activeStatus]}的作品 · 已显示 ${Math.min(shown, works.length)} 部`
      : '这个书架暂时还是空的。'
  }

  const appendBatch = () => {
    const works = worksOf(activeStatus)
    const batch = works.slice(shown, shown + BATCH_SIZE)
    batch.forEach((work, index) => grid.append(buildCard(work, index)))
    shown += batch.length
    const remaining = works.length - shown
    moreWrap.hidden = remaining <= 0
    if (remaining > 0) moreButton.textContent = `加载更多 · 还有 ${remaining} 部`
    updateSummary()
  }

  const render = status => {
    activeStatus = status
    shown = 0
    grid.replaceChildren()
    buttons.forEach(button => {
      const active = button.dataset.bangumiStatus === status
      button.classList.toggle('is-active', active)
      button.setAttribute('aria-selected', String(active))
    })
    if (worksOf(status).length === 0) {
      const empty = createElement('div', 'bangumi-shelf-empty')
      empty.append(createIcon('fas fa-clapperboard'), createElement('span', '', '这个书架暂时还是空的。'))
      grid.append(empty)
    } else {
      appendBatch()
    }
    updateSummary()
  }

  buttons.forEach(button => button.addEventListener('click', () => render(button.dataset.bangumiStatus)))
  moreButton.addEventListener('click', appendBatch)

  try {
    const data = await loadShelfData()
    Object.keys(collections).forEach(status => {
      collections[status] = Array.isArray(data[status]) ? data[status] : []
    })

    const allWorks = Object.values(collections).flat()
    const scored = allWorks.filter(work => Number.isFinite(Number(work.score)) && Number(work.score) > 0)
    const average = scored.length ? scored.reduce((sum, work) => sum + Number(work.score), 0) / scored.length : 0
    countUp(shelf.querySelector('[data-bangumi-count]'), allWorks.length)
    countUp(shelf.querySelector('[data-bangumi-score]'), average, { decimals: 1 })
    countUp(shelf.querySelector('[data-bangumi-watching]'), collections.watching.length)

    render(collections.watched.length ? 'watched' : collections.watching.length ? 'watching' : 'wantWatch')
  } catch (_) {
    summary.textContent = '追番数据暂时无法加载，请稍后重试。'
  }
}

onMount(initializeBangumiShelf)
