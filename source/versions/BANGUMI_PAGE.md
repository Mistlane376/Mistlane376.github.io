# 追番系统说明

## 📺 追番页面

追番页面位于 `/bangumis/`，展示 Bilibili 追番列表数据。

## 🔧 技术栈

- **数据源**：Bilibili API（`hexo-bilibili-bangumi-plus` 插件）
- **优势**：国内访问速度快、自动同步、无需代理
- **UID**：1146476510

## 📝 更新数据

### 手动更新

```bash
# 获取最新追番数据
npx hexo bangumi -u

# 删除追番数据
npx hexo bangumi -d
```

### 自动更新

数据需要手动更新，可设置定时任务（如 GitHub Actions）自动同步。

## 🎨 页面特性

### 设计亮点

- ✅ **全新卡片设计**：现代化圆角卡片，阴影效果
- ✅ **渐变色标签**：Tab 使用蓝紫渐变，视觉更柔和
- ✅ **悬停动画**：
  - 卡片悬停时背景高亮 + 轻微上浮
  - 封面图片放大 + 轻微旋转
  - 标签上浮 + 阴影增强
  - 标题下划线动画
- ✅ **Emoji 图标**：使用 Emoji 增强视觉识别
  - 📋 想看
  - 👀 在看
  - ✅ 看过
  - 📺 集数
  - 🌍 地区
  - ▶️ 播放量
  - 👥 追番人数
  - 🪙 硬币数
  - 💬 弹幕数
  - ⭐ 评分

### 响应式支持

- 桌面端（≥768px）：完整展示
- 平板端（480-768px）：中等尺寸
- 移动端（<480px）：紧凑布局

### 交互功能

- Tab 切换：想看 / 在看 / 看过
- 点击番剧卡片跳转 B站详情页
- 懒加载图片（`loading="lazy"`）
- 淡入动画（staggered animation）

## 🎯 样式定制

### 主色调

```css
--primary-color: #657b83;  /* 主色调：蓝灰色 */
--gradient-start: #657b83;  /* 渐变起点 */
--gradient-end: #8ca8c4;    /* 渐变终点 */
```

### 修改配色

编辑 `source/bangumis/index.md` 中的 `<style>` 部分：

```css
/* 修改 Tab 渐变 */
.bangumi-active {
  background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%) !important;
}

/* 修改标题悬停下划线颜色 */
.bangumi-title a:hover {
  color: #your-color;
}
```

## 📊 数据格式

追番数据保存在 `source/_data/bangumis.json`：

```json
{
  "wantWatch": [],
  "watching": [],
  "watched": [
    {
      "title": "番剧标题",
      "type": "番剧",
      "area": "日本",
      "cover": "封面图片URL",
      "totalCount": "全13话",
      "id": 12345,
      "follow": "100万",
      "view": "1000万",
      "danmaku": "10万",
      "coin": "5万",
      "score": 9.5,
      "des": "简介"
    }
  ]
}
```

## 🔧 插件修复

### 已知问题

`hexo-bilibili-bangumi-plus@1.0.0` 存在 bug：
- 空追番列表时错误判断 API 响应
- 条件逻辑错误导致无法正确识别成功响应

### 修复方案

已修复 `node_modules/hexo-bilibili-bangumi-plus/index.js`：
1. 简化 API 响应检查逻辑
2. 修复空列表处理
3. 优化错误判断

**注意**：此修复会在 `npm install` 后失效，需重新应用。

## 🚀 部署

```bash
# 生成静态文件
npx hexo generate

# 部署到 GitHub Pages
npx hexo deploy
```

## 📝 更新日志

### v4.0.0 (2026-07-20)

- ✅ 迁移到 Bilibili API
- ✅ 优化追番页面样式
- ✅ 修复数据获取 bug
- ✅ 全新卡片化设计
- ✅ 响应式支持

---

**维护者**：Mistlane376  
**最后更新**：2026-07-20
