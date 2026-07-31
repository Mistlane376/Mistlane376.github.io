---
title: 追番
date: 2026-06-20 12:51:33
type: "bangumis"
top_img: false
aside: false
comments: false
description: 正在收藏与回看的动画作品。
---

<section id="bangumi-shelf" class="bangumi-shelf" aria-labelledby="bangumi-shelf-title">
  <header class="bangumi-shelf-hero">
    <div>
      <span><i class="fas fa-clapperboard" aria-hidden="true"></i> ANIMATION SHELF</span>
      <h1 id="bangumi-shelf-title">追番</h1>
      <p>收集那些在某个时刻留下余韵的故事。</p>
    </div>
    <dl>
      <div><dt data-bangumi-count>--</dt><dd>部收藏</dd></div>
      <div><dt data-bangumi-score>--</dt><dd>平均评分</dd></div>
    </dl>
  </header>
  <div class="bangumi-shelf-controls" role="tablist" aria-label="追番状态">
    <button type="button" class="is-active" role="tab" aria-selected="true" data-bangumi-status="watched"><i class="fas fa-check" aria-hidden="true"></i> 看过</button>
    <button type="button" role="tab" aria-selected="false" data-bangumi-status="watching"><i class="fas fa-play" aria-hidden="true"></i> 在看</button>
    <button type="button" role="tab" aria-selected="false" data-bangumi-status="wantWatch"><i class="fas fa-bookmark" aria-hidden="true"></i> 想看</button>
  </div>
  <p class="bangumi-shelf-summary" data-bangumi-summary>正在整理收藏…</p>
  <div class="bangumi-shelf-grid" data-bangumi-grid aria-live="polite"></div>
</section>

<script>
(() => {
  const shelf = document.getElementById('bangumi-shelf');
  const grid = shelf.querySelector('[data-bangumi-grid]');
  const summary = shelf.querySelector('[data-bangumi-summary]');
  const buttons = [...shelf.querySelectorAll('[data-bangumi-status]')];
  const collections = { watched: [], watching: [], wantWatch: [] };

  const render = status => {
    const works = collections[status] || [];
    grid.textContent = '';
    summary.textContent = works.length ? `共 ${works.length} 部${status === 'watched' ? '已看完的作品' : status === 'watching' ? '正在追的作品' : '准备开始的作品'}` : '这个书架暂时还是空的。';
    buttons.forEach(button => {
      const active = button.dataset.bangumiStatus === status;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });
    works.forEach(work => {
      const card = document.createElement('article');
      card.className = 'bangumi-shelf-card';
      const link = document.createElement('a');
      link.href = `https://www.bilibili.com/bangumi/media/md${work.id}/`;
      link.target = '_blank';
      link.rel = 'noopener';
      link.innerHTML = `<img src="${work.cover}" alt="${work.title}" loading="lazy" referrerpolicy="no-referrer"><span class="bangumi-shelf-info"><small>${work.area || '未知地区'} · ${work.totalCount || '集数未知'}</small><strong>${work.title}</strong><em><i class="fas fa-star" aria-hidden="true"></i> ${work.score || '暂无评分'}</em><p>${work.des || '暂无简介'}</p><b>前往 Bilibili <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i></b></span>`;
      card.append(link);
      grid.append(card);
    });
  };

  const updateSummary = () => {
    const allWorks = Object.values(collections).flat();
    const scoredWorks = allWorks.filter(work => Number.isFinite(Number(work.score)));
    const average = scoredWorks.length ? (scoredWorks.reduce((sum, work) => sum + Number(work.score), 0) / scoredWorks.length).toFixed(1) : '--';
    shelf.querySelector('[data-bangumi-count]').textContent = allWorks.length;
    shelf.querySelector('[data-bangumi-score]').textContent = average;
  };

  buttons.forEach(button => button.addEventListener('click', () => render(button.dataset.bangumiStatus)));

  fetch('/data/bangumis.json', { cache: 'no-store' })
    .then(response => {
      if (!response.ok) throw new Error('Unable to load Bilibili data');
      return response.json();
    })
    .then(data => {
      ['watched', 'watching', 'wantWatch'].forEach(status => {
        collections[status] = Array.isArray(data[status]) ? data[status] : [];
      });
      updateSummary();
      render(collections.watched.length ? 'watched' : collections.watching.length ? 'watching' : 'wantWatch');
    })
    .catch(() => {
      updateSummary();
      summary.textContent = '追番数据暂时无法加载，请稍后重试。';
    });
})();
</script>
