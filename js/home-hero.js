const initializeHomeHero = () => {
  const header = document.querySelector('#page-header.full_page')
  const siteInfo = document.getElementById('site-info')
  const recentPosts = document.getElementById('recent-posts')
  const contentLayout = document.getElementById('content-inner')
  if (!header || !siteInfo || !recentPosts || !contentLayout || header.dataset.homeEnhanced === 'true') return
  header.dataset.homeEnhanced = 'true'

  const dataCounts = [...document.querySelectorAll('#aside-content .site-data .length-num')]
  const postCount = dataCounts[0]?.textContent.trim() || recentPosts.querySelectorAll('.recent-post-item').length
  const tagCount = dataCounts[1]?.textContent.trim() || '--'
  const categoryCount = dataCounts[2]?.textContent.trim() || '--'

  const actions = document.createElement('div')
  actions.className = 'home-hero-actions'
  actions.innerHTML = '<a class="home-hero-primary" href="/about/"><i class="fas fa-user" aria-hidden="true"></i><span>关于我</span></a><a class="home-hero-secondary" href="/archive/"><i class="fas fa-box-archive" aria-hidden="true"></i><span>浏览归档</span></a><a class="home-hero-secondary" href="#recent-posts"><i class="fas fa-arrow-down" aria-hidden="true"></i><span>最新文章</span></a>'

  const manifesto = document.createElement('div')
  manifesto.className = 'home-hero-manifesto'
  manifesto.innerHTML = '<div class="home-hero-identity"><span>临涧路 · 林间露</span></div><p>在代码、阅读与日常之间，留下清晰的来路</p><p><em>把思考写下来，也把成长留在这里</em></p><p>让仍在生长的想法，成为可以重访的坐标</p><small>愿每次抵达，都成为下一段路的开始</small>'

  const stats = document.createElement('div')
  stats.className = 'home-hero-stats'
  stats.setAttribute('aria-label', '站点内容统计')
  stats.innerHTML = `<span><strong>${postCount}</strong><small>篇文章</small></span><span><strong>${categoryCount}</strong><small>个分类</small></span><span><strong>${tagCount}</strong><small>个标签</small></span>`

  const subtitle = document.getElementById('site-subtitle')
  if (subtitle) subtitle.after(manifesto)
  else siteInfo.append(manifesto)
  siteInfo.append(actions, stats)

  const bridge = document.createElement('section')
  bridge.className = 'home-hero-bridge'
  bridge.setAttribute('aria-label', '内容导览')
  bridge.innerHTML = '<div><span>FROM HERE, CONTINUE</span><strong>把目光从远处收回，读一篇正在发生的记录。</strong></div><a href="#recent-posts">进入文章<i class="fas fa-arrow-down" aria-hidden="true"></i></a>'
  header.after(bridge)

  const getPost = item => {
    const link = item.querySelector('.article-title')
    const image = item.querySelector('.post_cover img')
    const category = item.querySelector('.article-meta__categories')
    const time = item.querySelector('time')
    const summary = item.querySelector('.content')
    return {
      href: link?.getAttribute('href') || '/archive/',
      title: link?.textContent.trim() || '未命名文章',
      cover: image?.getAttribute('src') || '/images/top.jpg',
      category: category?.textContent.trim() || '随笔',
      date: time?.textContent.trim() || '',
      summary: summary?.textContent.trim() || '继续阅读这篇记录。'
    }
  }

  const createArticleCard = (post, className, label) => {
    const card = document.createElement('a')
    card.className = `home-bento-card ${className}`
    card.href = post.href

    const image = document.createElement('img')
    image.src = post.cover
    image.alt = ''
    image.loading = 'lazy'

    const content = document.createElement('div')
    content.className = 'home-bento-card-content'
    const meta = document.createElement('div')
    meta.className = 'home-bento-card-meta'
    const badge = document.createElement('span')
    badge.textContent = label
    const date = document.createElement('time')
    date.textContent = post.date
    meta.append(badge, date)

    const title = document.createElement('h2')
    title.textContent = post.title
    const summary = document.createElement('p')
    summary.textContent = post.summary
    content.append(meta, title, summary)
    card.append(image, content)
    return card
  }

  const createExploreCard = (className, href, imageSrc, eyebrow, title, description, icon) => {
    const card = document.createElement('a')
    card.className = `home-bento-card ${className}`
    card.href = href
    const image = document.createElement('img')
    image.src = imageSrc
    image.alt = ''
    image.loading = 'lazy'
    const content = document.createElement('div')
    content.className = 'home-bento-card-content'
    content.innerHTML = `<span class="home-bento-icon"><i class="fas ${icon}" aria-hidden="true"></i></span><div class="home-bento-card-meta"><span>${eyebrow}</span></div><h2>${title}</h2><p>${description}</p>`
    card.append(image, content)
    return card
  }

  const createLinksCard = () => {
    const card = document.createElement('a')
    card.className = 'home-bento-archive home-bento-links'
    card.href = '/link/'
    card.innerHTML = '<span class="home-bento-archive-icon"><i class="fas fa-link" aria-hidden="true"></i></span><div class="home-bento-archive-copy"><span>FRIEND LINKS</span><h2>友链</h2><p>和有趣的站点相遇，也把彼此的记录连在一起。</p></div><div class="home-bento-archive-stats"><span><strong>站点</strong>互访</span><span><strong>伙伴</strong>交流</span><span><strong>想法</strong>相遇</span></div>'
    return card
  }

  const createIdentityCard = () => {
    const card = document.createElement('a')
    card.className = 'home-bento-info home-bento-identity-card'
    card.href = '/about/'
    card.innerHTML = '<span class="home-bento-info-icon"><i class="fas fa-compass" aria-hidden="true"></i></span><div class="home-bento-info-copy"><span>MISTLANE · 临涧路 · 林间露</span><h2>一处记录，也是一段路</h2><p>我在这里整理代码、学习与日常，让仍在生长的想法有迹可循。</p></div><small>关于本站与作者<i class="fas fa-arrow-right" aria-hidden="true"></i></small>'
    return card
  }

  const articleItems = [...recentPosts.querySelectorAll('.recent-post-items > .recent-post-item')]
  if (articleItems.length) {
    const posts = articleItems.map(getPost)
    const showcase = document.createElement('section')
    showcase.className = 'home-bento'
    showcase.setAttribute('aria-label', '首页精选内容')
    showcase.append(
      createArticleCard(posts[0], 'home-bento-featured', '推荐文章'),
      createExploreCard('home-bento-album', '/album/', '/images/selection2.jpg', 'VISUAL ARCHIVE', '光影存档', '把屏幕内外值得回看的瞬间，收进一处。', 'fa-images'),
      createIdentityCard(),
      createLinksCard()
    )

    const status = document.createElement('div')
    status.className = 'home-bento-status'
    status.innerHTML = `<time class="home-bento-clock" aria-label="当前时间"></time><div class="home-bento-status-copy"><span><i class="fas fa-circle" aria-hidden="true"></i> 持续记录中</span><small>代码、学习与日常正在汇集</small></div><div class="home-bento-metrics" aria-label="站点实时状态"><span><strong class="home-runtime-days">--</strong><small>运行天数</small></span><span><strong class="home-site-visits">--</strong><small>总访问量</small></span><span><strong>${postCount}</strong><small>收录文章</small></span></div><a href="/bangumis/"><i class="fas fa-play" aria-hidden="true"></i> 追番书架</a><a href="/archive/"><i class="fas fa-arrow-right" aria-hidden="true"></i> 全部归档</a>`
    const clock = status.querySelector('.home-bento-clock')
    const runtimeDays = status.querySelector('.home-runtime-days')
    const siteVisits = status.querySelector('.home-site-visits')
    const startedAt = new Date('2026-04-11T18:00:00+08:00')
    const updateClock = () => {
      clock.textContent = new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date())
    }
    const updateMetrics = () => {
      runtimeDays.textContent = String(Math.max(1, Math.floor((Date.now() - startedAt.getTime()) / 86400000)))
      const count = document.getElementById('busuanzi_value_site_pv')?.textContent.trim()
      if (count && !/^加载中|loading$/i.test(count)) siteVisits.textContent = count
    }
    updateClock()
    updateMetrics()
    window.setInterval(updateClock, 1000)
    window.setInterval(updateMetrics, 15000)
    showcase.append(status)

    articleItems[0].remove()
    articleItems.slice(5).forEach(item => item.remove())
    recentPosts.prepend(showcase)
  }

  const latest = document.createElement('div')
  latest.className = 'home-latest-heading'
  latest.innerHTML = '<div><span>MORE FROM MISTLANE</span><h2>继续阅读</h2></div><a href="/archive/"><span>后续请查看归档</span><i class="fas fa-arrow-right" aria-hidden="true"></i></a>'
  const articleList = recentPosts.querySelector('.recent-post-items')
  if (articleList?.children.length) articleList.before(latest)

  contentLayout.classList.add('home-bento-layout')
}

document.addEventListener('DOMContentLoaded', initializeHomeHero)
document.addEventListener('pjax:complete', initializeHomeHero)
