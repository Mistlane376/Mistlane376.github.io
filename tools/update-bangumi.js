'use strict';

const fs = require('fs');
const https = require('https');
const yaml = require('js-yaml');
const path = require('path');

const siteConfigPath = path.join(__dirname, '..', '_config.yml');
const siteConfig = yaml.load(fs.readFileSync(siteConfigPath, 'utf8')) || {};
const config = siteConfig.bangumi || {};
const username = String(config.user || '').trim();
const subjectType = Number(config.subject_type || 2);
const outputPath = path.join(__dirname, '..', 'source', '_data', 'bangumis.json');
const statuses = [
  ['wantWatch', 1],
  ['watched', 2],
  ['watching', 3]
];

function request(status, offset) {
  const url = new URL(`https://api.bgm.tv/v0/users/${encodeURIComponent(username)}/collections`);
  url.search = new URLSearchParams({
    subject_type: String(subjectType),
    type: String(status),
    limit: '100',
    offset: String(offset)
  });

  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'application/json'
      }
    }, response => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { body += chunk; });
      response.on('end', () => {
        try {
          const payload = JSON.parse(body);
          if (response.statusCode < 200 || response.statusCode >= 300) {
            throw new Error(payload.message || `Bangumi API request failed with HTTP ${response.statusCode}`);
          }
          if (!Array.isArray(payload.data)) throw new Error('Bangumi API returned an invalid collection list');
          resolve(payload);
        } catch (error) {
          reject(error);
        }
      });
    });
    req.setTimeout(15000, () => req.destroy(new Error('Bangumi API request timed out')));
    req.on('error', reject);
  });
}

function normalize(item) {
  const subject = item.subject || {};

  return {
    title: subject.name_cn || subject.name || '未命名作品',
    originalTitle: subject.name || '',
    type: '动画',
    cover: subject.images && (subject.images.common || subject.images.large || subject.images.medium || subject.images.small) || '',
    totalCount: subject.eps ? `${subject.eps} 话` : '集数未知',
    id: subject.id || item.subject_id,
    score: Number.isFinite(Number(subject.score)) && Number(subject.score) > 0 ? Number(subject.score) : null,
    rate: item.rate || null,
    des: subject.short_summary || '',
    date: subject.date || ''
  };
}

async function loadStatus(status) {
  const firstPage = await request(status, 0);
  const pages = Math.ceil((firstPage.total || 0) / 100);
  const items = firstPage.data;

  for (let page = 1; page < pages; page += 1) {
    const data = await request(status, page * 100);
    items.push(...data.data);
  }

  return items.map(normalize);
}

async function main() {
  if (!username) throw new Error('Set bangumi.user in _config.yml before syncing');
  const data = {};
  for (const [key, status] of statuses) data[key] = await loadStatus(status);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(data), 'utf8');
  const total = Object.values(data).reduce((sum, works) => sum + works.length, 0);
  console.log(`Synced ${total} Bangumi entries for ${username} to source/_data/bangumis.json`);
}

main().catch(error => {
  console.error(`Bangumi sync failed: ${error.message}`);
  process.exitCode = 1;
});
