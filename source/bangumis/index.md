---
title: 追番
date: 2026-06-20 12:51:33
type: "bangumis"
top_img: /images/selection1.jpg
description: 我的追番列表，数据来自 AniList
---

<style>
.bangumi-tabs { margin-bottom: 20px; margin-top: 15px; display: flex; gap: 8px; flex-wrap: wrap; }
.bangumi-tab { padding: 8px 20px; border-radius: 20px; cursor: pointer; color: var(--font-color); background: var(--card-bg); border: 1px solid var(--border-color, #ddd); transition: all .2s; user-select: none; text-decoration: none; font-size: 14px; }
.bangumi-tab:hover { border-color: #657b83; }
.bangumi-active { background: #657b83 !important; color: #fff !important; border-color: #657b83 !important; }
.bangumi-item { position: relative; clear: both; min-height: 160px; padding: 16px 0; border-bottom: 1px solid var(--border-color, #eee); }
.bangumi-picture { position: absolute; left: 0; top: 16px; width: 110px; border-radius: 6px; overflow: hidden; }
.bangumi-picture img { width: 100%; height: auto; display: block; border-radius: 6px; }
.bangumi-info { padding-left: 128px; }
.bangumi-title { font-size: 17px; font-weight: 600; margin-bottom: 6px; }
.bangumi-title a { text-decoration: none; color: var(--font-color); line-height: 1.3; }
.bangumi-title a:hover { color: #657b83; }
.bangumi-meta { font-size: 13px; color: #888; margin-top: 4px; }
.bangumi-meta span { margin-right: 12px; white-space: nowrap; }
.bangumi-meta .meta-score { color: #e09015; font-weight: 700; }
.bangumi-tags { margin-top: 6px; display: flex; flex-wrap: wrap; gap: 4px; }
.bangumi-tag { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; background: var(--border-color, #eee); color: #888; }
.bangumi-tag.format { background: #657b83; color: #fff; }
.bangumi-loading { text-align: center; padding: 60px 20px; color: #888; font-size: 14px; }
.bangumi-loading .spinner { display: inline-block; width: 32px; height: 32px; border: 3px solid #ddd; border-top-color: #657b83; border-radius: 50%; animation: spin .8s linear infinite; margin-bottom: 12px; }
@keyframes spin { to { transform: rotate(360deg); } }
.bangumi-error { text-align: center; padding: 60px 20px; color: #c03; font-size: 14px; }
.bangumi-empty { text-align: center; padding: 40px 20px; color: #999; font-size: 14px; }
.bangumi-total { font-size: 13px; color: #999; margin-bottom: 10px; }
.bangumi-hide { display: none !important; }
.bangumi-show { display: block; }
@media (max-width: 500px) {
  .bangumi-picture { width: 80px; }
  .bangumi-info { padding-left: 94px; }
  .bangumi-item { min-height: 130px; }
  .bangumi-meta span { margin-right: 8px; }
}
</style>

<blockquote><p>生命不息，追番不止！&nbsp;&nbsp;数据来自 <a href="https://anilist.co/user/mistlane/" target="_blank">AniList</a></p></blockquote>

<div id="bangumi-app">
  <div class="bangumi-loading"><div class="spinner"></div><br>正在加载追番列表...</div>
</div>

<script>
(function() {
  const ANILIST_USER = 'mistlane';
  const ANILIST_API = 'https://graphql.anilist.co';

  const STATUS_MAP = {
    CURRENT:    { tab: 'watching',  label: '在看' },
    COMPLETED:  { tab: 'watched',   label: '看过' },
    PLANNING:   { tab: 'wantWatch', label: '想看' },
    PAUSED:     { tab: 'watching',  label: '暂停' },
    REPEATING:  { tab: 'watching',  label: '二刷' },
    DROPPED:    { tab: 'watched',   label: '弃了' },
  };

  const TAB_ORDER = ['watching', 'watched', 'wantWatch'];
  const TAB_LABELS = { watching: '在看', watched: '看过', wantWatch: '想看' };

  const container = document.getElementById('bangumi-app');

  async function graphql(query, variables) {
    const res = await fetch(ANILIST_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ query, variables })
    });
    if (!res.ok) throw new Error(`API 请求失败 (${res.status})`);
    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0]?.message || 'GraphQL 错误');
    return json.data;
  }

  async function loadData() {
    // Step 1: get userId from username
    const userData = await graphql(
      `query($name: String) { User(name: $name) { id name } }`,
      { name: ANILIST_USER }
    );
    if (!userData || !userData.User) {
      throw new Error('未找到 AniList 用户 "' + ANILIST_USER + '"，请确认用户名是否正确');
    }
    const userId = userData.User.id;

    // Step 2: get anime list
    const listData = await graphql(
      `query($userId: Int) {
        MediaListCollection(userId: $userId, type: ANIME) {
          lists {
            name
            status
            entries {
              media {
                id
                title { romaji english native userPreferred }
                coverImage { large }
                episodes
                averageScore
                format
                genres
                siteUrl
              }
              progress
              score(format: POINT_10_DECIMAL)
            }
          }
        }
      }`,
      { userId: userId }
    );

    return listData?.MediaListCollection?.lists || [];
  }

  function buildUI(lists) {
    // Group entries by merged tab
    const groups = { watching: [], watched: [], wantWatch: [] };

    lists.forEach(list => {
      const map = STATUS_MAP[list.status] || { tab: 'watching', label: list.name };
      if (!groups[map.tab]) groups[map.tab] = [];
      list.entries.forEach(entry => {
        if (entry.media) {
          groups[map.tab].push({ ...entry, _statusLabel: map.label });
        }
      });
    });

    // Sort each group by updatedAt descending (AniList returns them in order, so keep order)
    const tabs = TAB_ORDER.filter(t => groups[t] && groups[t].length > 0);

    if (tabs.length === 0) {
      container.innerHTML = '<div class="bangumi-empty">追番列表为空，去 <a href="https://anilist.co" target="_blank">AniList</a> 添加吧~</div>';
      return;
    }

    // Build HTML
    let html = '';

    // Tab bar
    html += '<div class="bangumi-tabs">';
    tabs.forEach((t, i) => {
      html += '<a class="bangumi-tab' + (i === 0 ? ' bangumi-active' : '') + '" data-tab="' + t + '" href="javascript:;">'
        + TAB_LABELS[t] + ' (' + groups[t].length + ')</a>';
    });
    html += '</div>';

    // Content panels
    tabs.forEach((t, i) => {
      html += '<div id="bangumi-panel-' + t + '" class="bangumi-panel' + (i === 0 ? ' bangumi-show' : ' bangumi-hide') + '">';
      html += '<div class="bangumi-total">共 ' + groups[t].length + ' 部</div>';
      groups[t].forEach(entry => {
        html += renderCard(entry);
      });
      html += '</div>';
    });

    container.innerHTML = html;

    // Bind tab clicks
    container.querySelectorAll('.bangumi-tab').forEach(tab => {
      tab.addEventListener('click', function() {
        const target = this.dataset.tab;
        // Update active tab
        container.querySelectorAll('.bangumi-tab').forEach(t => t.classList.remove('bangumi-active'));
        this.classList.add('bangumi-active');
        // Show/hide panels
        container.querySelectorAll('.bangumi-panel').forEach(p => {
          if (p.id === 'bangumi-panel-' + target) {
            p.classList.remove('bangumi-hide');
            p.classList.add('bangumi-show');
          } else {
            p.classList.remove('bangumi-show');
            p.classList.add('bangumi-hide');
          }
        });
      });
    });
  }

  function renderCard(entry) {
    const m = entry.media;
    const title = m.title.userPreferred || m.title.romaji || m.title.english || '未知作品';
    const nativeTitle = (m.title.native && m.title.native !== title) ? m.title.native : '';
    const cover = m.coverImage.large || m.coverImage.medium || '';
    const episodes = m.episodes || '?';
    const progress = entry.progress != null ? entry.progress : '?';
    const avgScore = m.averageScore ? (m.averageScore / 10).toFixed(1) : '-';
    const userScore = entry.score != null ? entry.score.toFixed(1) : null;
    const format = m.format ? (m.format === 'TV' ? 'TV' : m.format === 'MOVIE' ? '电影' : m.format === 'OVA' ? 'OVA' : m.format === 'ONA' ? 'ONA' : m.format === 'SPECIAL' ? '特别篇' : m.format === 'TV_SHORT' ? '短篇' : m.format) : '';
    const genres = (m.genres || []).slice(0, 4);
    const url = m.siteUrl || 'https://anilist.co/anime/' + m.id;
    const progressText = m.format === 'MOVIE' ? '已看 ' + progress + ' 部' : '进度 ' + progress + '/' + episodes + ' 话';

    let html = '<div class="bangumi-item">';

    // Cover
    html += '<div class="bangumi-picture">';
    if (cover) {
      html += '<img src="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 220 312%22%3E%3Crect fill=%22%23e8e8e8%22 width=%22220%22 height=%22312%22/%3E%3C/svg%3E" data-src="' + cover + '" loading="lazy" alt="' + title + '" onload="this.style.opacity=1" style="opacity:0;transition:opacity .3s">';
    } else {
      html += '<div style="width:110px;height:156px;background:#e8e8e8;border-radius:6px;"></div>';
    }
    html += '</div>';

    // Info
    html += '<div class="bangumi-info">';
    html += '<div class="bangumi-title"><a href="' + url + '" target="_blank" rel="noopener">' + title + '</a></div>';
    if (nativeTitle) {
      html += '<div style="font-size:12px;color:#999;margin-bottom:4px;">' + nativeTitle + '</div>';
    }
    html += '<div class="bangumi-meta">';
    html += '<span>' + progressText + '</span>';
    html += '<span>均分 <span class="meta-score">' + avgScore + '</span></span>';
    if (userScore !== null) {
      html += '<span>我的 <span class="meta-score">★' + userScore + '</span></span>';
    }
    html += '</div>';
    html += '<div class="bangumi-tags">';
    if (format) html += '<span class="bangumi-tag format">' + format + '</span>';
    genres.forEach(g => { html += '<span class="bangumi-tag">' + g + '</span>'; });
    html += '</div>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  // Run
  loadData()
    .then(lists => buildUI(lists))
    .catch(err => {
      console.error('[Bangumi]', err);
      container.innerHTML = '<div class="bangumi-error">加载失败：' + err.message + '<br><small>请检查 AniList 用户名配置或稍后重试</small></div>';
    });
})();
</script>
