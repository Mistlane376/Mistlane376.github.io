---
title: 追番
date: 2026-06-20 12:51:33
type: "bangumis"
top_img: /images/selection1.jpg
description: 我的追番列表，数据来自 Bilibili
---

<style>
/* 追番页面样式优化 */
.bangumi-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

/* Tab 标签样式 */
.bangumi-tabs {
  display: flex;
  gap: 12px;
  margin: 24px 0 32px;
  padding: 0;
  border-bottom: 2px solid var(--border-color, #e0e0e0);
}

.bangumi-tab {
  padding: 12px 28px;
  border-radius: 12px 12px 0 0;
  cursor: pointer;
  color: var(--font-color);
  background: var(--card-bg);
  border: 2px solid var(--border-color, #e0e0e0);
  border-bottom: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  position: relative;
  overflow: hidden;
}

.bangumi-tab::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 3px;
  background: linear-gradient(90deg, #657b83, #8ca8c4);
  transform: translateX(-50%);
  transition: width 0.3s ease;
}

.bangumi-tab:hover {
  border-color: #657b83;
  color: #657b83;
  transform: translateY(-2px);
}

.bangumi-tab:hover::before {
  width: 60%;
}

.bangumi-active {
  background: linear-gradient(135deg, #657b83 0%, #8ca8c4 100%) !important;
  color: #fff !important;
  border-color: #657b83 !important;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(101, 123, 131, 0.3);
}

.bangumi-active::before {
  width: 0 !important;
}

/* 番剧卡片样式 */
.bangumi-item {
  position: relative;
  clear: both;
  min-height: 200px;
  padding: 24px 0;
  border-bottom: 1px solid var(--border-color, #eee);
  transition: all 0.3s ease;
  animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bangumi-item:hover {
  background: var(--card-bg-hover, rgba(101, 123, 131, 0.05));
  border-radius: 12px;
  padding-left: 16px;
  padding-right: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.bangumi-picture {
  position: absolute;
  left: 0;
  top: 24px;
  width: 140px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.bangumi-item:hover .bangumi-picture {
  transform: scale(1.05) rotate(1deg);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.bangumi-picture img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 12px;
  transition: opacity 0.3s ease;
}

.bangumi-info {
  padding-left: 164px;
}

.bangumi-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
  line-height: 1.4;
}

.bangumi-title a {
  text-decoration: none;
  color: var(--font-color);
  transition: color 0.2s ease;
  background: linear-gradient(90deg, var(--font-color), var(--font-color));
  background-size: 0% 2px;
  background-repeat: no-repeat;
  background-position: left bottom;
}

.bangumi-title a:hover {
  color: #657b83;
  background-size: 100% 2px;
}

.bangumi-meta {
  font-size: 14px;
  color: var(--text-color-secondary, #666);
  margin-top: 8px;
  line-height: 1.8;
}

.bangumi-meta span {
  margin-right: 20px;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.bangumi-meta .meta-score {
  color: #e09015;
  font-weight: 700;
  font-size: 15px;
}

.bangumi-tags {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.bangumi-tag {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 12px;
  background: var(--tag-bg, #f0f0f0);
  color: var(--text-color-secondary, #666);
  font-weight: 500;
  transition: all 0.2s ease;
}

.bangumi-tag.format {
  background: linear-gradient(135deg, #657b83 0%, #8ca8c4 100%);
  color: #fff;
  font-weight: 600;
  padding: 6px 16px;
}

.bangumi-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.bangumi-comments {
  font-size: 14px;
  color: var(--text-color-secondary, #888);
  margin-top: 12px;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 分页样式 */
.bangumi-pagination {
  margin: 32px 0;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.bangumi-button {
  padding: 10px 20px;
  border-radius: 8px;
  background: var(--card-bg);
  border: 1px solid var(--border-color, #ddd);
  color: var(--font-color);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
}

.bangumi-button:hover {
  background: #657b83;
  color: #fff;
  border-color: #657b83;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(101, 123, 131, 0.3);
}

.bangumi-pagenum {
  padding: 10px 16px;
  font-weight: 600;
  color: var(--font-color);
}

/* 总数统计 */
.bangumi-total {
  font-size: 15px;
  color: var(--text-color-secondary, #999);
  margin-bottom: 20px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(101, 123, 131, 0.1) 0%, rgba(140, 168, 196, 0.1) 100%);
  border-radius: 8px;
  border-left: 4px solid #657b83;
  font-weight: 500;
}

/* 加载和错误状态 */
.bangumi-loading,
.bangumi-error,
.bangumi-empty {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-color-secondary, #888);
  font-size: 16px;
}

.bangumi-loading .spinner {
  display: inline-block;
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-color, #ddd);
  border-top-color: #657b83;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.bangumi-error {
  color: #e74c3c;
}

/* 隐藏/显示 */
.bangumi-hide { display: none !important; }
.bangumi-show { display: block; }

/* 响应式设计 */
@media (max-width: 768px) {
  .bangumi-container {
    padding: 12px;
  }

  .bangumi-tabs {
    gap: 8px;
    margin: 16px 0 24px;
  }

  .bangumi-tab {
    padding: 10px 20px;
    font-size: 14px;
  }

  .bangumi-item {
    min-height: 160px;
    padding: 16px 0;
  }

  .bangumi-picture {
    width: 100px;
    top: 16px;
  }

  .bangumi-info {
    padding-left: 120px;
  }

  .bangumi-title {
    font-size: 17px;
  }

  .bangumi-meta {
    font-size: 13px;
  }

  .bangumi-meta span {
    margin-right: 12px;
  }

  .bangumi-comments {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .bangumi-picture {
    width: 80px;
  }

  .bangumi-info {
    padding-left: 96px;
  }

  .bangumi-title {
    font-size: 16px;
  }

  .bangumi-tag {
    padding: 3px 10px;
    font-size: 11px;
  }

  .bangumi-tag.format {
    padding: 5px 12px;
  }
}
</style>

<div class="bangumi-container">
  <blockquote>
    <p>生命不息，追番不止！&nbsp;&nbsp;数据来自 <a href="https://space.bilibili.com/1146476510" target="_blank">Bilibili</a></p>
  </blockquote>

  <div id="bangumi-app">
    <div class="bangumi-loading"><div class="spinner"></div><br>正在加载追番列表...</div>
  </div>
</div>

<script>
(function() {
  // 追番数据直接内嵌（由 hexo-bilibili-bangumi-plus 插件生成）
  const bangumiData = {
    "wantWatch": [],
    "watching": [],
    "watched": [
      {
        "title": "Angel Beats!",
        "type": "番剧",
        "area": "日本",
        "cover": "https://i0.hdslb.com/bfs/bangumi/803ee7dc0e151ea3f634fe49e73d3b3fb93ca433.jpg@220w_280h.webp",
        "totalCount": "全13话",
        "id": 959,
        "follow": "320.6 万",
        "view": "4293.5 万",
        "danmaku": "103.7 万",
        "coin": "38.7 万",
        "score": 9.8,
        "des": "　　故事从男主角死亡之后从"死后的世界"醒来开始，在"死后的世界"中的学校里，他与一位名为由利(ゆり)、在"死后的世界"率领着一个名为"死んだ(Shinda)世界(Sekai)战线(Sensen)"简称"SSS"的组织的少女相遇了。"SSS"成立的主要目的是与赐予他们生前悲哀命运的神以及神之使者——天使交战，在天使超乎常理的异能面前，"SSS"只能用枪来反抗。就这样一场发生在"死后的世界"的学校里的超能大战物语开始了……"
      },
      {
        "title": "薰香花朵凛然绽放",
        "type": "番剧",
        "area": "日本",
        "cover": "https://i0.hdslb.com/bfs/bangumi/image/433fceda3574bb232ab7091cf9aacc049678e96a.png@220w_280h.webp",
        "totalCount": "全13话",
        "id": 26641346,
        "follow": "217.6 万",
        "view": "6900.6 万",
        "danmaku": "39.6 万",
        "coin": "45.4 万",
        "score": 9.6,
        "des": "窗帘的另一头，是和我永远没有交集的世界——\n\n差生云集的底层男校千鸟高中，一直被历史悠久的贵族女校桔梗女校所鄙视。尽管两校的校舍相邻，但桔梗女校从来都是将窗帘拉得严严实实，不让千鸟高中的人看到人影。在..."
      }
    ]
  };

  const STATUS_MAP = {
    wantWatch: { label: '想看', icon: '📋' },
    watching: { label: '在看', icon: '👀' },
    watched: { label: '看过', icon: '✅' }
  };

  const TAB_ORDER = ['watching', 'watched', 'wantWatch'];
  const container = document.getElementById('bangumi-app');

  function buildUI() {
    const groups = { watching: [], watched: [], wantWatch: [] };

    // 填充数据
    Object.keys(bangumiData).forEach(key => {
      if (groups[key]) {
        groups[key] = bangumiData[key];
      }
    });

    const tabs = TAB_ORDER.filter(t => groups[t] && groups[t].length > 0);

    if (tabs.length === 0) {
      container.innerHTML = '<div class="bangumi-empty">追番列表为空，去 <a href="https://www.bilibili.com/anime/timeline/#!/" target="_blank">B站</a> 添加吧~</div>';
      return;
    }

    let html = '';

    // Tab bar
    html += '<div class="bangumi-tabs">';
    tabs.forEach((t, i) => {
      html += `<a class="bangumi-tab${i === 0 ? ' bangumi-active' : ''}" data-tab="${t}" href="javascript:;">
        ${STATUS_MAP[t].icon} ${STATUS_MAP[t].label} (${groups[t].length})</a>`;
    });
    html += '</div>';

    // Content panels
    tabs.forEach((t, i) => {
      html += `<div id="bangumi-panel-${t}" class="bangumi-panel${i === 0 ? ' bangumi-show' : ' bangumi-hide'}">`;
      html += `<div class="bangumi-total">共 ${groups[t].length} 部${STATUS_MAP[t].label}的番剧</div>`;

      groups[t].forEach((item, index) => {
        html += renderCard(item, index);
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

  function renderCard(item, index) {
    const title = item.title || '未知作品';
    const cover = item.cover || '';
    const totalCount = item.totalCount || '?';
    const area = item.area || '';
    const view = item.view || '-';
    const follow = item.follow || '-';
    const coin = item.coin || '-';
    const danmaku = item.danmaku || '-';
    const score = item.score || '-';
    const des = item.des || '暂无简介';
    const url = `https://www.bilibili.com/bangumi/media/md${item.id}/`;

    const delay = index * 0.05;
    let html = `<div class="bangumi-item" style="animation-delay: ${delay}s">`;

    // Cover
    html += '<div class="bangumi-picture">';
    if (cover) {
      html += `<img src="${cover}" data-src="${cover}" referrerPolicy="no-referrer" width="140" alt="${title}" loading="lazy" onload="this.style.opacity=1" style="opacity:0;transition:opacity .3s">`;
    } else {
      html += '<div style="width:140px;height:196px;background:var(--border-color,#e8e8e8);border-radius:12px;"></div>';
    }
    html += '</div>';

    // Info
    html += '<div class="bangumi-info">';
    html += `<div class="bangumi-title"><a href="${url}" target="_blank" rel="noopener">${title}</a></div>`;

    html += '<div class="bangumi-meta">';
    html += `<span>📺 ${totalCount}</span>`;
    if (area) html += `<span>🌍 ${area}</span>`;
    html += `<span>▶️ ${view}</span>`;
    html += `<span>👥 ${follow}</span>`;
    html += `<span>🪙 ${coin}</span>`;
    html += `<span>💬 ${danmaku}</span>`;
    html += `<span><span class="meta-score">⭐ ${score}</span></span>`;
    html += '</div>';

    html += '<div class="bangumi-tags">';
    html += `<span class="bangumi-tag format">${item.type || '番剧'}</span>`;
    html += '</div>';

    html += `<div class="bangumi-comments">${des}</div>`;
    html += '</div></div>';

    return html;
  }

  // Run
  buildUI();
})();
</script>
