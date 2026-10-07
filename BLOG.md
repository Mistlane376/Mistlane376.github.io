# 站点架构说明（Hexo）

这份文档说明博客的构建链路与主题实现，便于日后改主题、改配置或排查问题。日常写作与命令见 [README.md](README.md)。

## 构建链路

```
source/ + themes/mistlane/
        │
        ├─ scripts/*.js           Hexo 启动时自动加载（生成器、命令、过滤器）
        ├─ 主题 scripts/          helper / tag / before_generate 钩子
        ▼
   hexo generate ──► public/ ──► hexo deploy ──► .deploy_git ──► GitHub Pages
        ▲
        └─ tools/regression-check.js 构建后回归检查（npm run check:site）
```

`npm run build` 依次执行：`scripts/copy-pjax.js`（拷贝 pjax 运行时到主题）→ `hexo clean` → `hexo generate` → 回归检查。

## 主题结构（themes/mistlane）

主题基于 Butterfly 5.6.1，目录职责：

- `layout/`：Pug 模板。入口为 `index.pug`、`post.pug`、`page.pug`、`archive.pug`、`tag.pug`、`category.pug`，公共部分在 `layout/includes/`。
- `scripts/`：
  - `helpers/`：`page.js`、`related_post.js`、`series.js`、`aside_*`、`inject_head_js.js` 等模板 helper；
  - `tag/`：`note`、`tabs`、`gallery`、`mermaid`、`label`、`button`、`timeline`、`series` 等标签插件；
  - `events/`：`init.js`（合并默认配置、校验 Hexo 版本）、`cdn.js`（计算 `theme.asset` 资源地址）、`404.js`、`stylus.js`、`welcome.js`；
  - `filters/`：`post_lazyload.js`、`random_cover.js`。
- `source/`：`css/`（Stylus 入口 `css/index.styl` + `css/mistlane/*.css` 定制样式）、`js/`（`main.js`、`js/mistlane/*` 页面脚本、`js/search/*` 搜索实现）、`img/`、`fonts/`。
- `_config.yml`：主题默认值；实际生效值由站点根目录的 `_config.mistlane.yml` 覆盖。
- `plugins.yml` / `UPSTREAM.md`：第三方资源版本表与上游来源说明。

## 配置分工

| 文件 | 作用 |
| --- | --- |
| `_config.yml` | Hexo 站点配置：URL、permalink、abbrlink、目录、Markdown 行为、首页分页、搜索、feed、sitemap、部署 |
| `_config.mistlane.yml` | 主题配置：导航、侧边栏、评论、搜索、数学公式、注入的 CSS/JS、PJAX、CDN |
| `themes/mistlane/_config.yml` | 主题默认值，仅作参考，不要直接改 |

被 `_config.yml` 读取的站点级扩展段：`bangumi`（追番用户）、`search`（本地搜索索引路径）、`sitemap`、`feed`、`deploy`、`tag_plugins`。

## 内容类型

| 内容 | 位置 | 生成方式 |
| --- | --- | --- |
| 文章 | `source/_posts/*.md` | Hexo 内置，链接由 `abbrlink` 决定 |
| 页面 | `source/*/index.md`、`source/*.md`（含 `source/about/index.html`） | Hexo 内置 + 主题 layout |
| 动态 | `source/_moments/*.md` | `scripts/content-paths.js` 渲染到 `/moments/` |
| 学习路径 | 由文章 front-matter 的 `series` / `series_order` 聚合 | `scripts/content-paths.js` 生成 `/series/` |
| 相册 | `source/album/data.json`（加密相册在 `source/album/private/`） | 前端 `js/mistlane/album.js` 读取 |
| 友链 / 追番 | `source/_data/link.yml`、`source/_data/bangumis.json` | 主题模板 + `scripts/bangumi-data.js` |
| 归档索引 | — | `scripts/archive-hub-data.js` 生成 `/data/archive-hub.json` |

## 资源与搜索

- `theme.asset` 由主题 `scripts/events/cdn.js` 在 `before_generate` 阶段计算。内部资源使用 `CDN.internal_provider`，站点配置当前为 `jsdelivr`，但 `_config.mistlane.yml` 的 `CDN.option` 把 `main`、`utils`、`local_search`、`pjax`、`fontawesome`、`local_search` 显式指向本地路径，保证离线可用。
- 本地搜索索引由 `hexo-generator-search` 生成：索引路径取自站点 `search.path`（默认 `search.xml`），主题 `layout/includes/head/config.pug` 把它注入 `GLOBAL_CONFIG.localSearch.path`，由 `themes/mistlane/source/js/search/local-search.js` 在打开搜索框时按需拉取。
- 需要新增全局 CSS/JS 时，优先加到 `_config.mistlane.yml` 的 `inject.head` / `inject.bottom`，并同步在 `tools/regression-check.js` 里加一条断言，防止静默丢失。

## 部署

### 维护提示：主题资源一律用 UTF-8 编辑

主题的 CSS/JS 里有中文字符串（例如 `content: '显示设置'`）。曾经出现过用 GBK 方式读写这些文件、把中文变成乱码并顺手删掉引号/括号的情况，表现为规则解析错位、移动端整段样式失效。约定：

- 编辑器统一 UTF-8（不带 BOM）；
- 不要用 `powershell` 的 `Get-Content | Set-Content` 做批量替换（默认编码会破坏中文）；
- 改完 CSS 后跑一次括号配对与乱码自检，再 `npm run build`。

- `hexo deploy` 使用 `hexo-deployer-git` 推送到 `ssh://git@ssh.github.com:443/Mistlane376/Mistlane376.github.io.git` 的 `main` 分支。
- `source/CNAME` 声明自定义域名，`hexo-generator-sitemap` 生成 `sitemap.xml`，`hexo-generator-feed` 生成 `atom.xml`。
- 根目录 `vercel.json` 是备用托管（Vercel）的构建与响应头配置：`buildCommand` 为 `npm run build`，`outputDirectory` 为 `public`，并声明 HSTS、`X-Frame-Options`、`COOP` 与 CSP。GitHub Pages 不使用该文件；如只用 Pages，可以忽略。
- CSP 目前只限制 `base-uri`、`object-src`、`frame-ancestors` 并升级不安全请求。严格脚本白名单和 Trusted Types 尚未启用：主题的内联脚本、PJAX 与第三方 DOM 操作需要先改造。
