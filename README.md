# Mistlane's Blog

个人博客，用 **Hexo 7 + 本地主题 [`themes/mistlane`](themes/mistlane)**（基于 Butterfly 5.6.1 深度定制）构建，输出纯静态站点并部署到 GitHub Pages。

- 站点：https://blog.mistlane.top
- 主题配置：`_config.mistlane.yml`（站点配置在 `_config.yml`）
- 内容目录：`source/`（文章、页面、动态、相册数据、图片与前端脚本）

## 环境

| 依赖 | 版本 |
| --- | --- |
| Node.js | ≥ 18（开发机为 24.x） |
| Hexo | 7.3.0（见 `package.json` 的 `hexo.version`） |
| 包管理 | npm |

```powershell
npm install
```

## 目录结构

```
my-blog/
├─ _config.yml                 # Hexo 站点配置（URL、permalink、搜索、feed、sitemap、部署）
├─ _config.mistlane.yml        # 主题配置（覆盖 themes/mistlane/_config.yml 的默认值）
├─ scaffolds/                  # hexo new 的模板（post / page / draft）
├─ scripts/                    # Hexo 启动时自动加载的扩展脚本
│  ├─ content-paths.js         #   /series/、/moments/ 生成器 + hexo moment 命令
│  ├─ new-post-template.js     #   hexo new-template 命令（题解/算法/项目/学习模板）
│  ├─ archive-hub-data.js      #   /data/archive-hub.json 归档索引
│  ├─ bangumi-data.js          #   /data/bangumis.json 追番数据
│  ├─ copy-pjax.js             #   把 pjax 运行时拷进主题
│  └─ custom-404.js            #   开发服务器自定义 404 中间件
├─ source/                     # 内容与静态资源
│  ├─ _posts/                  #   文章（Markdown，使用 abbrlink 生成链接）
│  ├─ _moments/                #   动态（短记录，由 content-paths.js 渲染到 /moments/）
│  ├─ _data/                   #   友链、追番等数据
│  ├─ about/ album/ archives/ bangumis/ categories/ guestbook/ link/ tags/
│  ├─ album/data.json          #   相册数据（加密相册在 album/private/）
│  ├─ data/                    #   音乐、分类卡片等前端数据
│  ├─ images/ vendor/          #   图片；FontAwesome 本地资源（/vendor/fontawesome）
│  ├─ 404.html CNAME robots.txt
├─ themes/mistlane/            # 本地主题：Pug 模板 + Stylus/CSS + 浏览器脚本
│  ├─ layout/                  #   页面模板与 includes
│  ├─ scripts/                 #   主题自带的 helper、tag、事件钩子
│  └─ source/                  #   主题静态资源：css/（含 css/mistlane/*.css）、
│                              #   js/（含 js/mistlane/* 页面脚本）、img/、fonts/
├─ tools/                      # 本地运维脚本
│  ├─ blog-manager.js          #   可视化内容管理后台（npm run admin）
│  ├─ private-album.js         #   加密相册（npm run album:encrypt）
│  ├─ update-bangumi.js        #   同步追番数据（npm run bangumi:update）
│  └─ regression-check.js      #   构建后站点回归检查（npm run check:site）
├─ public/                     # 生成结果（git 忽略）
└─ .deploy_git/                # hexo deploy 的部署仓库（git 忽略）
```

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run server`（=`npm run dev`） | 本地预览，默认 http://localhost:4000 |
| `npm run build` | 清理 → 复制 pjax → `hexo generate` → 站点回归检查 |
| `npm run clean` | 清理 `public/` 与缓存 `db.json` |
| `npm run check:site` | 只跑回归检查（需先构建） |
| `npm run deploy:prod` | 用 Vercel CLI 手动触发一次生产部署（需先 `vercel link` 过） |
| `npm run post:new -- <solution\|algorithm\|project\|study> "标题"` | 按模板新建文章 |
| `npm run moment:new -- "今天完成了…"` | 新建一条动态 |
| `npm run bangumi:update` | 从 Bangumi API 同步追番收藏 |
| `npm run album:encrypt` | 生成/更新加密相册数据 |
| `npm run admin` | 启动本地内容管理后台（默认 4173 端口） |

## 写作

- 新建文章：`npx hexo new "标题"`，或使用带模板的 `npm run post:new`。
- 文章永久链接由 `abbrlink`（crc32 hex）生成，配置在 `_config.yml` 的 `abbrlink` 段。
- 文章 front-matter 支持 `description`、`cover`、`categories`、`tags`、`series` / `series_order`（用于 `/series/` 学习路径页）。
- 动态写在 `source/_moments/*.md`，front-matter 支持 `date`、`mood`、`location`、`tags`、`images`、`pinned`。
- 图片放在 `source/images/`，用 `/images/xxx.jpg` 引用；图床链接同样可以直接使用。
- 主题配置改动写进 `_config.mistlane.yml`，不要直接改 `themes/mistlane/_config.yml`（那是默认值）。

## 部署

站点由 **Vercel** 托管，生产域名 https://blog.mistlane.top（DNS 为 Vercel 托管，CNAME 指向 `*.vercel-dns-017.com`）。

- **构建源**：仓库 `Mistlane376/Mistlane376.github.io` 的 `main` 分支（也就是本工作树）；
- **构建命令**：`npm run build`（`vercel.json` 中的 `buildCommand`），输出目录 `public/`；
- **触发方式**：推送到 `main` 即自动构建发布，无需手动部署；
- **Vercel 项目设置**：Production Branch = `main`，Root Directory 留空，Framework Preset = Other；
- **不上传的内容**：见 [.vercelignore](.vercelignore)（`private-albums/`、`.deploy_git/`、`public/`、`db.json` 等）。

```powershell
git push origin main        # 触发 Vercel 生产部署
npm run deploy:prod         # 可选：用 Vercel CLI 手动发一次
```

### 历史说明

早期用 `hexo deploy` 把 `public/` 推到本仓库分支、由 GitHub Pages 发布。现在已完全改用 Vercel：

- `_config.yml` 中不再有 `deploy` 段，`hexo-deployer-git` 依赖已移除；
- `source/CNAME`（Pages 自定义域名文件）已删除，域名由 Vercel 管理；
- 旧的 `source` 分支（曾作为 Vercel 构建源）已删除，`.deploy_git/` 与 `clean-deploy` 分支不再使用。

## 排查

| 现象 | 处理 |
| --- | --- |
| 样式/脚本没更新 | 主题资源需要重新生成，`npm run clean` 后再 `npm run build` |
| 搜索无结果 | 确认 `_config.yml` 的 `search.path` 与主题 `_config.mistlane.yml` 的 `asset.local_search` 未被改动 |
| 页面链接 404 | 检查 `permalink` 与 `abbrlink` 配置；`hexo clean` 后重建 |
| 本地 404 页不生效 | 开发服务器由 `scripts/custom-404.js` 提供中间件 |
| Vercel 报 `Could not read package.json` | 构建分支或 Root Directory 指错了：Production Branch 应为 `main`，Root Directory 应留空 |
| 线上没变化 | 先确认改动已 `git push`（未提交的文件不会进构建），再确认 Vercel 那次部署成功、并绕过边缘缓存（`x-vercel-cache`） |

架构与实现细节见 [BLOG.md](BLOG.md)，版本历史见 [CHANGELOG.md](CHANGELOG.md)。
