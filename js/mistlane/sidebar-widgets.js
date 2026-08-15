(() => {
  'use strict'

  const pad = value => String(value).padStart(2, '0')
  const dateKey = (year, month, day) => `${year}-${pad(month + 1)}-${pad(day)}`
  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

  const readPosts = card => {
    try {
      const posts = JSON.parse(card.querySelector('.calendar-post-data')?.textContent || '[]')
      return posts.reduce((map, post) => {
        if (!map.has(post.date)) map.set(post.date, [])
        map.get(post.date).push(post)
        return map
      }, new Map())
    } catch (_) { return new Map() }
  }

  const renderCalendar = card => {
    if (!card || card.dataset.bound === 'true') return
    card.dataset.bound = 'true'
    const today = new Date()
    let visible = new Date(today.getFullYear(), today.getMonth(), 1)
    let selected = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const postsByDate = readPosts(card)
    const title = card.querySelector('[data-calendar-title]')
    const grid = card.querySelector('[data-calendar-grid]')
    const postCount = card.querySelector('[data-calendar-post-count]')
    const activeDays = card.querySelector('[data-calendar-active-days]')
    const selectedDate = card.querySelector('[data-calendar-selected-date]')
    const selectedCount = card.querySelector('[data-calendar-selected-count]')
    const selectedList = card.querySelector('[data-calendar-selected-list]')
    const monthFormatter = new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long' })
    const dateFormatter = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })

    const renderSelection = date => {
      selected = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const key = dateKey(selected.getFullYear(), selected.getMonth(), selected.getDate())
      const posts = postsByDate.get(key) || []
      selectedDate.textContent = dateFormatter.format(selected)
      selectedCount.textContent = `${posts.length} 篇`
      selectedList.replaceChildren()
      if (!posts.length) {
        const empty = document.createElement('p')
        empty.textContent = sameDay(selected, today) ? '今天还没有发布新文章。' : '这一天没有发布文章。'
        selectedList.append(empty)
      } else {
        posts.slice(0, 3).forEach(post => {
          const link = document.createElement('a')
          link.href = post.path
          link.title = post.title
          link.innerHTML = '<i class="far fa-file-lines"></i>'
          const text = document.createElement('span')
          text.textContent = post.title
          link.append(text)
          selectedList.append(link)
        })
      }
      grid.querySelectorAll('.calendar-day').forEach(cell => cell.classList.toggle('is-selected', cell.dataset.date === key))
    }

    const render = () => {
      const year = visible.getFullYear()
      const month = visible.getMonth()
      const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7
      const gridStart = new Date(year, month, 1 - firstWeekday)
      const prefix = `${year}-${pad(month + 1)}-`
      const monthEntries = [...postsByDate.entries()].filter(([key]) => key.startsWith(prefix))
      title.textContent = monthFormatter.format(visible)
      postCount.textContent = String(monthEntries.reduce((sum, [, posts]) => sum + posts.length, 0))
      activeDays.textContent = String(monthEntries.length)
      card.classList.toggle('is-current-month', year === today.getFullYear() && month === today.getMonth())
      grid.replaceChildren()

      for (let index = 0; index < 42; index += 1) {
        const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index)
        const key = dateKey(date.getFullYear(), date.getMonth(), date.getDate())
        const posts = postsByDate.get(key) || []
        const cell = document.createElement('button')
        cell.type = 'button'
        cell.className = 'calendar-day'
        cell.dataset.date = key
        cell.textContent = String(date.getDate())
        cell.setAttribute('aria-label', `${dateFormatter.format(date)}${posts.length ? `，发布 ${posts.length} 篇文章` : ''}`)
        if (date.getMonth() !== month) cell.classList.add('is-adjacent')
        if (date.getDay() === 0 || date.getDay() === 6) cell.classList.add('is-weekend')
        if (sameDay(date, today)) { cell.classList.add('is-today'); cell.setAttribute('aria-current', 'date') }
        if (posts.length) { cell.classList.add('has-posts'); cell.dataset.postCount = String(posts.length) }
        if (sameDay(date, selected)) cell.classList.add('is-selected')
        cell.addEventListener('click', () => selectDate(date))
        grid.append(cell)
      }
    }

    const selectDate = date => {
      if (date.getFullYear() !== visible.getFullYear() || date.getMonth() !== visible.getMonth()) {
        visible = new Date(date.getFullYear(), date.getMonth(), 1)
        render()
      }
      renderSelection(date)
      grid.querySelector(`[data-date="${dateKey(date.getFullYear(), date.getMonth(), date.getDate())}"]`)?.focus()
    }

    const changeMonth = offset => {
      visible = new Date(visible.getFullYear(), visible.getMonth() + offset, 1)
      selected = new Date(visible.getFullYear(), visible.getMonth(), 1)
      render()
      renderSelection(selected)
    }

    card.querySelector('[data-calendar-prev]').addEventListener('click', () => changeMonth(-1))
    card.querySelector('[data-calendar-next]').addEventListener('click', () => changeMonth(1))
    card.querySelectorAll('[data-calendar-today], [data-calendar-title]').forEach(button => button.addEventListener('click', () => {
      visible = new Date(today.getFullYear(), today.getMonth(), 1)
      render()
      renderSelection(today)
    }))
    grid.addEventListener('keydown', event => {
      const offsets = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
      if (!(event.key in offsets)) return
      event.preventDefault()
      const base = event.target.dataset.date ? new Date(`${event.target.dataset.date}T00:00:00`) : selected
      base.setDate(base.getDate() + offsets[event.key])
      selectDate(base)
    })
    render()
    renderSelection(today)
  }

  const renderToday = card => {
    if (!card) return
    const now = new Date()
    const year = now.getFullYear()
    const start = new Date(year, 0, 1)
    const end = new Date(year + 1, 0, 1)
    const progress = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100))
    const hour = now.getHours()
    const greeting = hour < 6 ? '夜深了，记得给思绪留一点休息。' : hour < 12 ? '上午好，从一件重要的小事开始。' : hour < 18 ? '下午好，继续推进今天的计划。' : '晚上好，整理今天值得留下的片段。'
    card.querySelector('[data-today-day]').textContent = String(now.getDate()).padStart(2, '0')
    card.querySelector('[data-today-month]').textContent = `${year}年${now.getMonth() + 1}月`
    card.querySelector('[data-today-weekday]').textContent = new Intl.DateTimeFormat('zh-CN', { weekday: 'long' }).format(now)
    card.querySelector('[data-year-progress]').textContent = `${progress.toFixed(1)}%`
    card.querySelector('[data-year-progress-bar]').style.width = `${progress}%`
    card.querySelector('[data-today-greeting]').textContent = greeting
  }

  const init = () => {
    document.querySelectorAll('[data-sidebar-calendar]').forEach(renderCalendar)
    document.querySelectorAll('[data-sidebar-today]').forEach(renderToday)
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true })
  else init()
  document.addEventListener('pjax:complete', init)
})()
