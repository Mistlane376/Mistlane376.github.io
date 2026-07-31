'use strict';

const fs = require('fs');
const https = require('https');
const path = require('path');

const vmid = '1146476510';
const outputPath = path.join(__dirname, '..', 'source', '_data', 'bangumis.json');
const statuses = [
  ['wantWatch', 1],
  ['watching', 2],
  ['watched', 3]
];

function request(status, page) {
  const url = new URL('https://api.bilibili.com/x/space/bangumi/follow/list');
  url.search = new URLSearchParams({ type: '1', follow_status: String(status), vmid, ps: '30', pn: String(page) });

  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Referer: `https://space.bilibili.com/${vmid}/bangumi`
      }
    }, response => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { body += chunk; });
      response.on('end', () => {
        try {
          const payload = JSON.parse(body);
          if (payload.code !== 0 || !payload.data) throw new Error(payload.message || `Bilibili API error ${payload.code}`);
          resolve(payload.data);
        } catch (error) {
          reject(error);
        }
      });
    });
    req.setTimeout(15000, () => req.destroy(new Error('Bilibili API request timed out')));
    req.on('error', reject);
  });
}

function compactCount(value) {
  if (!value) return '-';
  if (value >= 100000000) return `${(value / 100000000).toFixed(1)} 亿`;
  if (value >= 10000) return `${(value / 10000).toFixed(1)} 万`;
  return String(value);
}

function normalize(item) {
  const cover = item.cover ? new URL(item.cover.startsWith('//') ? `https:${item.cover}` : item.cover) : null;
  if (cover) {
    cover.protocol = 'https:';
    cover.pathname += '@220w_280h.webp';
  }

  return {
    title: item.title,
    type: item.season_type_name,
    area: item.areas && item.areas[0] ? item.areas[0].name : '',
    cover: cover ? cover.href : '',
    totalCount: item.total_count === -1 ? '未完结' : item.total_count ? `全${item.total_count}话` : '-',
    id: item.media_id,
    follow: compactCount(item.stat && item.stat.follow),
    view: compactCount(item.stat && item.stat.view),
    danmaku: compactCount(item.stat && item.stat.danmaku),
    coin: compactCount(item.stat && item.stat.coin),
    score: item.rating ? item.rating.score : '暂无评分',
    des: item.evaluate || ''
  };
}

async function loadStatus(status) {
  const firstPage = await request(status, 1);
  const pages = Math.ceil((firstPage.total || 0) / 30);
  const items = firstPage.list || [];

  for (let page = 2; page <= pages; page += 1) {
    const data = await request(status, page);
    items.push(...(data.list || []));
  }

  return items.map(normalize);
}

async function main() {
  const data = {};
  for (const [key, status] of statuses) data[key] = await loadStatus(status);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(data), 'utf8');
  const total = Object.values(data).reduce((sum, works) => sum + works.length, 0);
  console.log(`Synced ${total} Bilibili bangumi entries to source/_data/bangumis.json`);
}

main().catch(error => {
  console.error(`Bilibili bangumi sync failed: ${error.message}`);
  process.exitCode = 1;
});
