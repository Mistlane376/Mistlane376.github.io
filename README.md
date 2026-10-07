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
| `npm run deploy` | 清理、构建并 `hexo deploy` 到 GitHub Pages |
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

`_config.yml` 中的 `deploy` 段指向 `ssh://git@ssh.github.com:443/Mistlane376/Mistlane376.github.io.git` 的 `main` 分支：

```powershell
npm run deploy
```

GitHub Pages 由该仓库的 `main` 分支直接提供，部署历史保存在 `.deploy_git/`。

### 分支职责（重要）

源码仓库与 GitHub Pages 产物仓库是同一个仓库，因此用分支区分「源码」与「产物」：

| 远端分支 | 内容 | 用途 |
| --- | --- | --- |
| `main` | `hexo deploy` 推送的**纯静态产物**（`index.html`、`posts/`、`css/`…），无 `package.json` | GitHub Pages 发布分支 |
| `source` | **源码工作树**（`_config.yml`、`package.json`、`source/`、`themes/`、`tools/`） | Vercel 等平台的构建源 |

规则：

- 本地 `main` 是源码工作树，推送源码时用 `git push origin main:source`，不要推 `main`；
- 任何 CI/托管平台（Vercel 等）的 **Production Branch 必须设为 `source`**。若指向 `main` 或 `clean-deploy`，构建目录里没有 `package.json`，会直接报 `ENOENT: no such file or directory, open '.../package.json'`；
- 站点里不应再有根目录 `package.json` 之类的源码文件出现在 `main` 上——历史上曾把源码推到 `main`，才导致托管平台误判为可构建工程。

## 排查

| 现象 | 处理 |
| --- | --- |
| 样式/脚本没更新 | 主题资源需要重新生成，`npm run clean` 后再 `npm run build` |
| 搜索无结果 | 确认 `_config.yml` 的 `search.path` 与主题 `_config.mistlane.yml` 的 `asset.local_search` 未被改动 |
| 页面链接 404 | 检查 `permalink` 与 `abbrlink` 配置；`hexo clean` 后重建 |
| 本地 404 页不生效 | 开发服务器由 `scripts/custom-404.js` 提供中间件 |
| 托管平台报 `Could not read package.json` | 构建分支指到了产物分支，按上表把 Production Branch 改为 `source` |

架构与实现细节见 [BLOG.md](BLOG.md)，版本历史见 [CHANGELOG.md](CHANGELOG.md)。
