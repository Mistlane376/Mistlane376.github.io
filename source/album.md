---
title: 相册
date: 2026-07-27 00:00:00
permalink: /album/
type: album
top_img: false
aside: false
comments: false
description: 按相册组与日期浏览 Mistlane 的照片记录。
---

<section id="photo-album" class="album-app" data-source="/album/data.json" aria-labelledby="album-title">
  <header class="album-hero">
    <div class="album-hero-copy">
      <span class="album-eyebrow">PHOTO ARCHIVE</span>
      <h1 id="album-title">光影存档</h1>
      <p>留住旅途、日常与屏幕内外值得回看的片刻。</p>
    </div>
    <div class="album-stats" aria-label="相册统计">
      <span><strong id="album-count">0</strong> 组相册</span>
      <span><strong id="photo-count">0</strong> 张照片</span>
      <span><strong id="date-count">0</strong> 个日期</span>
    </div>
  </header>

  <div class="album-toolbar" aria-label="相册视图">
    <div class="album-view-switch" role="group" aria-label="切换查看方式">
      <button type="button" class="album-view-button is-active" data-view="groups" aria-pressed="true">
        <i class="fas fa-layer-group" aria-hidden="true"></i>
        <span>相册组</span>
      </button>
      <button type="button" class="album-view-button" data-view="dates" aria-pressed="false">
        <i class="far fa-calendar-alt" aria-hidden="true"></i>
        <span>按日期</span>
      </button>
    </div>
    <p class="album-result" id="album-result" aria-live="polite">正在整理照片...</p>
  </div>

  <div class="album-loading" id="album-loading" role="status">
    <span class="album-loading-mark" aria-hidden="true"></span>
    <span>正在读取相册</span>
  </div>
  <div class="album-view" id="album-groups" data-view-panel="groups"></div>
  <div class="album-view" id="album-dates" data-view-panel="dates" hidden></div>
  <div class="album-empty" id="album-empty" hidden>
    <i class="far fa-images" aria-hidden="true"></i>
    <h2>还没有照片</h2>
    <p>在相册数据文件中加入照片后，这里会自动生成分组与时间视图。</p>
  </div>

  <dialog class="private-album-dialog" id="private-album-dialog" aria-labelledby="private-album-title">
    <form class="private-album-unlock" id="private-album-form" method="dialog">
      <button type="button" class="private-album-close" data-private-close aria-label="关闭密码窗口">
        <i class="fas fa-xmark" aria-hidden="true"></i>
      </button>
      <span class="private-album-dialog-icon"><i class="fas fa-lock" aria-hidden="true"></i></span>
      <span class="private-album-eyebrow">PRIVATE ALBUM</span>
      <h2 id="private-album-title">解锁私密相册</h2>
      <p id="private-album-description">输入密码后，照片将在当前设备内解密。</p>
      <label for="private-album-password">访问密码</label>
      <div class="private-password-field">
        <input id="private-album-password" name="password" type="password" autocomplete="current-password" required maxlength="128" aria-describedby="private-album-error">
        <button type="button" data-private-password-toggle aria-label="显示密码" title="显示或隐藏密码">
          <i class="fas fa-eye" aria-hidden="true"></i>
        </button>
      </div>
      <p class="private-album-error" id="private-album-error" role="alert" aria-live="polite"></p>
      <button class="private-album-submit" type="submit">
        <i class="fas fa-key" aria-hidden="true"></i>
        <span>解锁相册</span>
      </button>
      <small><i class="fas fa-shield-halved" aria-hidden="true"></i> 密码只用于本地解密，不会发送到服务器</small>
    </form>
  </dialog>

  <dialog class="album-lightbox" id="album-lightbox" aria-labelledby="lightbox-title">
    <div class="album-lightbox-shell">
      <header class="album-lightbox-header">
        <div>
          <span class="album-lightbox-group" id="lightbox-group"></span>
          <h2 id="lightbox-title">照片预览</h2>
        </div>
        <button type="button" class="album-icon-button" data-lightbox-close title="关闭预览" aria-label="关闭预览">
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </header>
      <div class="album-lightbox-stage">
        <button type="button" class="album-lightbox-nav album-lightbox-prev" data-lightbox-prev title="上一张" aria-label="上一张">
          <i class="fas fa-chevron-left" aria-hidden="true"></i>
        </button>
        <figure class="album-lightbox-figure">
          <img id="lightbox-image" src="" alt="">
          <figcaption>
            <span id="lightbox-caption"></span>
            <span id="lightbox-position"></span>
          </figcaption>
        </figure>
        <button type="button" class="album-lightbox-nav album-lightbox-next" data-lightbox-next title="下一张" aria-label="下一张">
          <i class="fas fa-chevron-right" aria-hidden="true"></i>
        </button>
      </div>
      <div class="album-lightbox-thumbs" id="lightbox-thumbs" aria-label="本组照片"></div>
    </div>
  </dialog>
</section>
