# 📝 更新日志 (Changelog)

所有博客的重大更新都会记录在这里。

---

## [v5.0.0] - 2026-08-27

### ♻️ 架构回退：从 Astro 恢复为纯 Hexo

博客一度迁移到 Astro（见下表 v4.2.0），由 `src/lib/theme-renderer.mjs` 复用 Mistlane 的 Pug 模板。该适配层在模板 helper、内容集合和资源管线上长期偏离 Hexo 原生行为，因此本次整体回退到 Hexo 7.3 单一构建链。

#### 已移除（Astro 架构）
- 源码目录 `src/`（页面、布局、`theme-renderer` / `theme-config` / `theme-site` 等适配层）
- `astro.config.mjs`、`tsconfig.json`、`playwright.config.mjs`、`tests/theme.spec.mjs`
- `scripts/prepare-astro-assets.mjs`、`scripts/optimize-assets.mjs`
- 生成物 `public/optimized/`、`public/_astro/`、Astro 版 `sitemap-index.xml`，以及 `.astro/`、`astro.public/`、`test-results/`
- 依赖：`astro`、`@astrojs/*`、`react` / `react-dom`、`svelte`、`sharp`、`cheerio`、`esbuild`、`gray-matter`、`remark-math`、`rehype-katex`、`@playwright/test`

#### 已恢复 / 新增
- `package.json` 回归 Hexo 脚本：`build`、`server`（`dev`）、`clean`、`deploy`、`post:new`、`moment:new`、`bangumi:update`、`album:encrypt`、`admin`、`check:site`
- `_config.yml` 补全 `search`（本地搜索索引 `search.xml`）与 `sitemap` 段
- `tools/regression-check.js` 重写为 Hexo 输出检查（44 项），去掉 React/Svelte 断言，新增 Atom、Sitemap、搜索索引与“无 Astro 残留”断言
- `tools/blog-manager.js` 的后台公告读写目标从无人使用的 `_config.butterfly.yml` 修正为生效的 `_config.mistlane.yml`
- 新增 `README.md`（环境、目录结构、命令、写作、部署、排查）与 `BLOG.md`（构建链路、主题结构、配置分工、资源与搜索）
- `vercel.json` 去掉只为 Astro 输出所用的 `/optimized/` 缓存头

#### 顺带修复的主题资源损伤
构建链恢复正常后，对主题资源做了一次全量体检（UTF-8 解码校验 + CSS 括号配对 + 中文乱码模式反解），修掉三处历史遗留损伤：

- `themes/mistlane/source/css/mistlane/site-polish.css`
  - 删除 `@keyframes night-twinkle` 之后多余的 `}`：它会让紧跟其后的 `@media (max-width: 768px)` 整块被解析器吞掉，移动端花瓣/友链等样式失效
  - 去掉文件开头的 UTF-8 BOM
  - 修复两处被「UTF-8 当 GBK 解读」而损坏的文案：`content: '显示设置'`、`content: '循字而行，遇见旧日篇章'`（后者连带丢了收尾引号）
- `themes/mistlane/source/css/mistlane/about-envelope.css`：`.contact-text` 之后有一条缺少选择器与 `{` 的孤立声明块，已补回 `[data-theme='dark'] .about-divider {`，主题两份 CSS 现在括号完全配对
- 全仓高置信度乱码扫描结果归零（此前命中 1 处，另有 1 处因末尾字符损坏未进扫描）

#### 清理的重复资源与空目录
- 删除 `source/js/`（11 个文件）与 `source/css/`（10 个文件）：这两份是主题 `themes/mistlane/source/` 下同名资源的旧副本，页面实际引用的是 `/js/mistlane/*` 与 `/css/mistlane/*`。逐文件比对后确认主题版本更新（例如 `archive-hub.js` 已改为读取 `scripts/archive-hub-data.js` 生成的 `/data/archive-hub.json`，`site-stats-cache.js` 已改用 vercount 缓存键），且字符串字面量无一处为 `source/` 独有
- 删除空目录 `source/projects/`、`source/versions/`（`/projects/` 按回归检查要求保持不生成；`/versions/` 页面已不存在，本文件相关链接同步修正）
- `source/vendor/fontawesome/` 保留：主题配置 `CDN.option.fontawesome` 指向 `/vendor/fontawesome/css/all.min.css`，实际在用

#### 托管切换：Vercel 单一来源
- 站点改由 Vercel 托管，生产分支为本仓库的 `main`（即源码工作树）：推送后自动 `npm run build`，输出 `public/`
- `_config.yml` 移除 `deploy` 段，`package.json` 移除 `hexo-deployer-git`，新增 `deploy:prod`（`npx vercel --prod`）
- 删除 `source/CNAME`（GitHub Pages 的自定义域名文件），域名 `blog.mistlane.top` 由 Vercel 管理
- 新增 `.vercelignore`：`private-albums/`、`.deploy_git/`、`public/`、`db.json`、日志与本地诊断目录不上传
- 删除历史 `source` 分支与 Pages 产物分支的用途；`.deploy_git/` 仅作本地残留

#### 搜索界面改版
- 结果计数移到输入框正下方（`#local-search-count`），不再埋在结果列表底部，也不再显示无意义的「耗时 N 毫秒」
- 新增「推荐查找」：从站点高频标签与分类自动生成可点击的搜索词胶囊（标签 teal、分类金色区分），点击即填入并立即出结果
- 新增底部键盘提示条（↑↓ 选择 / Enter 打开 / Esc 关闭 + 多关键词说明），并按语言本地化
- 新增结果键盘导航：↑↓ 在结果间移动（视觉与鼠标悬停一致），Enter 直接打开
- 空结果状态改为图标 + 文案的组合提示
- 副标题等文案改走语言包（`search.suggest`、`search.tip_*`、`search.close_button`），中英文都补齐
- 用 DOM API 构造推荐词与空结果节点，避免把用户输入当 HTML 解析
- `tools/regression-check.js` 增加 6 条搜索面板断言，防止改主题时静默退化

#### 验证
- `npm run build`：`hexo clean` → `hexo generate`（197 个文件）→ 回归检查 44/44 通过
- `hexo server` 实测：首页、文章页、`/series/`、`/moments/`、`/album/`、`/rss/`、`atom.xml`、`sitemap.xml`、`search.xml` 全部 200，未知路径按自定义 404 返回 404
- 干净环境复现：复制工作树后 `npm ci` + `npm run build` 同样 44/44 通过（模拟托管平台的安装与构建）
- 线上比对：`https://blog.mistlane.top` 的 `site-polish.css` 等资源与本机构建 SHA256 一致

### 💡 注意事项
- 文章、页面、动态、相册数据与本地主题 `themes/mistlane` 均未重写，内容与 URL 保持不变
- 图片不再有构建期 WebP 压缩（那是 Astro 管线专有步骤），如需压缩请在提交前自行处理
- 源码与 GitHub Pages 产物曾共用同一仓库、用分支区分（`main` 放产物、`source` 放源码）。现已改为**单一托管：Vercel + `main` 分支源码**，不再使用 GitHub Pages 与 `hexo deploy`
- 详见 README「部署」一节

---

## [v4.2.0] - 2026-08-24

### ✨ 重大更新

#### 迁移到 Astro（已于 v5.0.0 回退）
- 由 Astro 负责构建，通过 `src/lib/theme-renderer.mjs` 复用 Mistlane 的 Pug/Stylus 模板
- 新增 React（外观设置）与 Svelte（搜索）交互岛，使用 `client:load` 以服务器渲染方式挂载
- 引入 `astro.public`、`scripts/prepare-astro-assets.mjs` 与 Playwright 浏览器测试
- 该架构已在 v5.0.0 整体移除，此条目仅作历史记录

---

## [v4.1.0] - 2026-07-27

### ✨ 重大更新

#### 相册系统正式上线
- 新增独立相册页面 `source/album.md`
- 支持分组查看、封面预览与多图重叠展示
- 支持按日期自动分块浏览
- 支持灯箱切换、前后浏览与缩略图导航
- 兼容本地图片、GitHub Raw 与 jsDelivr 图床

#### 首页文章列表重构
- 首页布局从瀑布流调整为更稳定的单列卡片结构
- 桌面端采用左图右文，移动端自动切换为上下布局
- 首页摘要优先使用文章 `description`
- 统一标题、日期、分类与摘要的视觉层级

#### Markdown 正文阅读系统重构
- 将正文样式限定在文章详情页，避免标题、表格和代码样式影响其他页面
- 正文阅读宽度调整为约 760px，重新统一段落间距与标题层级
- 重做引用、列表、行内代码、代码块、表格、图片与提示框
- 完善暗色模式和手机端的字号、表格横向滚动与代码显示

#### 导航与功能页统一
- 导航新增“相册”入口
- 将“追番 / 友链 / 版本”归入“探索”分组
- 分类、标签、归档、关于、友链、追番等页面统一视觉风格
- 简化横幅与背景策略，突出内容主体

### 🔧 Bug 修复

- 修复“探索”下拉菜单被页面内容遮挡的问题
- 修复相册页在手机端统计栏与切换按钮裁切
- 修复关于页标题、签名与分类数量徽章裁切
- 优化暗色模式与减少动画偏好适配

### 📝 文档

- 新增相册使用说明与图床接入说明
- 完善相册数据结构示例与分类组织方式
- 同步更新版本归档页面到 `v4.1.0`

### 💡 注意事项

#### 开发环境
- 相册数据入口为 `source/album/data.json`
- 首页摘要显示依赖文章 `description`
- 图床可直接使用 GitHub Raw 或 jsDelivr CDN 链接

#### 生产环境
- 发布前建议执行 `npm run build`
- 图床图片建议保留统一命名与日期目录结构
- 版本页与更新日志建议在每次重大更新后同步维护

---

## [v4.0.0] - 2026-07-18

### ✨ 重大更新

#### 版本系统重构
- 版本 2.0 数据丢失事件记录
- 重新规划版本体系，跳过 v3.x 直接升级到 v4.0.0
- 完善版本归档文档系统（`source/versions/`）
- 建立数据丢失警示机制

#### 样式系统增强
- **侧边栏个性标签样式**
  - 创建 `author-card.css` 独立样式文件
  - 实现 3 种渐变色标签（蓝/紫/绿）
  - 添加悬停动画和光泽扫过效果
  - 完整的暗色模式支持
  - 移动端响应式适配

- **描述系统简化**
  - 优化 `_config.yml` 站点描述
  - 精简个人简介，从多行简化为单行
  - 标签化展示技术栈

#### 文档完善
- 创建 `TAG_STYLE_SUMMARY.md` - 标签样式完整文档
- 创建 `TAG_STYLE_README.md` - 标签样式使用说明
- 创建 `source/versions/README.md` - 版本归档系统文档
- 更新版本历史记录
- 建立数据丢失经验教训文档

### 🔧 优化改进

- 配置文件结构优化
- CSS 样式模块化管理
- 响应式设计增强
- 移动端适配完善

### 📝 文档

- 版本归档系统文档化
- Markdown 使用手册
- 样式文档系统化
- 更新日志规范化

---

## [v3.0.0] - 2026-07-17

### ✨ 重大更新

#### About 页面全新升级
- 迁移到 HTML 格式（`source/about/index.html`）
- 卡片化设计系统
- 英雄区域设计
- 技能条动画效果
- 成就展示区
- 博客特性网格布局

#### CSDN 集成
- About 页面添加 CSDN 按钮
- 侧边栏添加 CSDN 社交图标
- 配置文件中添加 CSDN 链接

#### 样式系统全面升级
- 创建 `global.css` - 全局样式优化
- 创建 `markdown.css` - Markdown 样式美化
- 引用块样式优化
- 代码块样式修复
- 表格样式美化
- 完整的暗色模式支持
- 响应式设计完善

#### 功能增强
- QQ/微信链接指向二维码图片
- 代码块样式修复
- 联系方式完整化
- 社交图标配置优化

### 📝 文档

- 创建 CHANGELOG.md
- 创建版本归档（`source/versions/`）
- 清理冗余文档
- 建立文档体系

### 🐛 Bug 修复

- 修复代码块样式问题
- 修复暗色模式适配
- 修复移动端显示问题

---

## [v2.0.0] - 2026-07-13

### ⚠️ 状态：数据丢失

> **注意**：此版本数据已丢失，仅保留版本记录。

#### 📋 已知功能（基于记忆）

**新增功能**：
- 追番页面（`source/bangumis/`）
- 友链页面（`source/link/`）
- 音乐播放器（后期移除）

**优化改进**：
- 站点配置更新
- 导航菜单完善
- Butterfly 主题配置
- 侧边栏美化

---

## [v1.0.0] - 2026-06-19

### ✨ 基础搭建

**初始配置**：
- Hexo 静态博客框架
- Butterfly 主题
- 基础页面配置
- 文章发布功能
- GitHub Pages 部署

**核心功能**：
- 首页展示
- 文章归档
- 标签分类
- 关于页面
- 社交链接

---

## 📊 版本对比

| 版本 | 发布日期 | CSS 文件 | 文档数 | 状态 |
|------|---------|---------|--------|------|
| v5.0.0 | 2026-08-27 | 18 | 25+ | 🆕 当前（Hexo） |
| v4.2.0 | 2026-08-24 | 18 | 25+ | ⛔ 已回退（Astro） |
| v4.1.0 | 2026-07-27 | 7 | 20+ | ✅ 正常 |
| v4.0.0 | 2026-07-18 | 5 | 15+ | ✅ 正常 |
| v3.0.0 | 2026-07-17 | 4 | 10+ | ✅ 正常 |
| v2.0.0 | 2026-07-13 | 2 | 5 | ⚠️ 数据丢失 |
| v1.0.0 | 2026-06-19 | 0 | 1 | ✅ 正常 |

---

## 🔄 更新频率统计

| 时间周期 | 更新次数 | 平均间隔 | 备注 |
|---------|---------|---------|------|
| 2026-07（当前） | 3 次 | ~2 天 | 密集开发 |
| 2026-06 至 2026-07 | 2 次 | ~15 天 | 快速迭代 |
| 2026-04 至 2026-06 | 1 次 | ~45 天 | 初始搭建 |

---

## 📚 相关资源

- **[BLOG.md](BLOG.md)** - 站点架构与主题实现说明
- **[README.md](README.md)** - 环境、目录结构、命令与部署
- **[关于页面](/about/)** - 作者信息

> 早期版本提到的 `source/versions/` 版本归档页已不在仓库中（目录仅剩空壳，已在 v5.0.0 清理），版本历史统一以本文件为准。

---

**最后更新**：2026-08-27
**当前版本**：v5.0.0（Hexo 7.3 + 本地主题 themes/mistlane）
**维护者**：Mistlane376
**博客地址**：https://mistlane.top
