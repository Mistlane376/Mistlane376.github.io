'use strict'

const fs = require('fs')
const path = require('path')

const templates = {
  solution: {
    category: '题解',
    series: '竞赛题解',
    cover: '/images/selection3.jpg',
    tags: ['算法', '题解'],
    body: `## 题目

题目链接：

## 思路

## 复杂度

- 时间复杂度：
- 空间复杂度：

## 代码

\`\`\`cpp

\`\`\`
`
  },
  algorithm: {
    category: '算法模板',
    series: '算法模板',
    cover: '/images/selection2.jpg',
    tags: ['算法', '模板'],
    body: `## 适用场景

## 核心思路

## 模板

\`\`\`cpp

\`\`\`

## 注意事项
`
  },
  project: {
    category: '项目练习',
    series: '项目复盘',
    cover: '/images/top.jpg',
    tags: ['项目'],
    body: `## 项目概览

## 技术选型

## 关键实现

## 遇到的问题

## 复盘
`
  },
  study: {
    category: '教程',
    series: '写作与前端基础',
    cover: '/images/selection1.jpg',
    tags: ['知识学习'],
    body: `## 学习目标

## 核心概念

## 示例

## 总结
`
  }
}

const pad = value => String(value).padStart(2, '0')
const formatDate = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
const fileNameFor = title => title.replace(/[<>:"/\\|?*\x00-\x1F]/g, '-').trim()
const usage = 'Usage: npm run post:new -- <solution|algorithm|project|study> <title> [--dry-run]'

hexo.extend.console.register('new-template', 'Create a typed post from a local template.', { usage }, async function (args) {
  const [type, ...titleParts] = args._
  const template = templates[type]
  const title = titleParts.join(' ').trim()

  if (!template || !title) {
    hexo.log.info(usage)
    return
  }

  const fileName = fileNameFor(title)
  if (!fileName) throw new Error('The title does not produce a valid file name.')

  const frontMatter = [
    '---',
    `title: ${title}`,
    `date: ${formatDate(new Date())}`,
    'tags:',
    ...template.tags.map(tag => `  - ${tag}`),
    'categories:',
    `  - ${template.category}`,
    `series: ${template.series}`,
    'series_order: ',
    'description: ',
    `cover: ${template.cover}`,
    '---',
    ''
  ].join('\n')
  const content = `${frontMatter}\n${template.body}`
  const target = path.join(hexo.source_dir, '_posts', `${fileName}.md`)

  if (args['dry-run']) {
    hexo.log.info(`Would create: ${target}`)
    hexo.log.info(content)
    return
  }

  if (fs.existsSync(target)) throw new Error(`Post already exists: ${target}`)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, content, 'utf8')
  hexo.log.info(`Created ${path.relative(hexo.base_dir, target)}`)
})
