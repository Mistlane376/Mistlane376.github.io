---
title: 归档
date: 2026-07-29 00:00:00
type: "archive-hub"
top_img: false
aside: false
comments: false
description: 按分类与标签浏览 Mistlane 的文章、算法笔记与项目记录。
---

<div id="archive-hub" data-view="categories">
  <section class="archive-hub-hero" aria-labelledby="archive-hub-title">
    <div class="archive-hub-hero-copy">
      <span class="archive-hub-kicker"><i class="fas fa-box-archive" aria-hidden="true"></i> KNOWLEDGE ARCHIVE</span>
      <h1 id="archive-hub-title">归档</h1>
      <p>按分类与标签整理的知识索引，留住每一次思考和记录。</p>
    </div>
    <dl class="archive-hub-stats" aria-label="归档统计">
      <div><dt data-archive-category-count>--</dt><dd>个分类</dd></div>
      <div><dt data-archive-tag-count>--</dt><dd>个标签</dd></div>
      <div><dt data-archive-post-count>--</dt><dd>篇文章</dd></div>
    </dl>
  </section>

  <section class="archive-hub-browser" aria-label="归档浏览">
    <div class="archive-hub-switch" role="tablist" aria-label="归档类型">
      <button class="is-active" type="button" role="tab" aria-selected="true" aria-controls="archive-hub-panel" data-archive-view="categories"><i class="fas fa-folder-tree" aria-hidden="true"></i> 分类</button>
      <button type="button" role="tab" aria-selected="false" aria-controls="archive-hub-panel" data-archive-view="tags"><i class="fas fa-tags" aria-hidden="true"></i> 标签</button>
    </div>
    <p class="archive-hub-summary" data-archive-summary>正在整理分类索引…</p>
  </section>

  <section id="archive-hub-panel" class="archive-hub-panel" role="tabpanel" aria-live="polite"></section>
</div>
