---
title: 追番
date: 2026-06-20 12:51:33
type: "bangumis"
top_img: false
aside: false
comments: false
description: 来自 Bangumi 的动画收藏。
---

<section id="bangumi-shelf" class="bangumi-shelf" aria-labelledby="bangumi-shelf-title">
  <header class="bangumi-shelf-hero">
    <div>
      <span><i class="fas fa-clapperboard" aria-hidden="true"></i> ANIMATION SHELF</span>
      <h1 id="bangumi-shelf-title">追番</h1>
      <p>来自 Bangumi 的公开动画收藏。</p>
    </div>
    <dl>
      <div><dt data-bangumi-count>--</dt><dd>部收藏</dd></div>
      <div><dt data-bangumi-score>--</dt><dd>平均评分</dd></div>
      <div><dt data-bangumi-watching>--</dt><dd>正在追</dd></div>
    </dl>
  </header>
  <div class="bangumi-shelf-toolbar">
    <div class="bangumi-shelf-controls" role="tablist" aria-label="追番状态">
      <button type="button" class="is-active" role="tab" aria-selected="true" data-bangumi-status="watched"><i class="fas fa-check" aria-hidden="true"></i> 看过</button>
      <button type="button" role="tab" aria-selected="false" data-bangumi-status="watching"><i class="fas fa-play" aria-hidden="true"></i> 在看</button>
      <button type="button" role="tab" aria-selected="false" data-bangumi-status="wantWatch"><i class="fas fa-bookmark" aria-hidden="true"></i> 想看</button>
    </div>
    <p class="bangumi-shelf-summary" data-bangumi-summary>正在整理收藏…</p>
  </div>
  <div class="bangumi-shelf-grid" data-bangumi-grid aria-live="polite"></div>
  <div class="bangumi-shelf-more" data-bangumi-more-wrap hidden>
    <button type="button" class="bangumi-shelf-more-button" data-bangumi-more>加载更多</button>
  </div>
</section>
