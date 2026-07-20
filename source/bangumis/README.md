# 追番系统快速开始

## 🚀 一键更新追番数据

```bash
npx hexo bangumi -u
```

## 📺 查看效果

```bash
npx hexo server
```

然后访问：http://localhost:4000/bangumis/

## ✨ 主要特性

### 🎨 视觉设计
- **渐变色 Tab**：蓝紫色渐变，悬停有下划线动画
- **卡片式布局**：圆角 + 阴影，悬停上浮效果
- **封面动画**：悬停时放大 + 轻微旋转
- **Emoji 图标**：直观的数据展示

### 📊 数据展示
- 📋 **想看** / 👀 **在看** / ✅ **看过**
- 📺 集数、🌍 地区、▶️ 播放量
- 👥 追番人数、🪙 硬币数、💬 弹幕数
- ⭐ 评分、简介

### 📱 响应式
- 桌面端完整展示
- 平板端中等布局
- 移动端紧凑设计

## ⚙️ 配置说明

### B站 UID

在 `_config.yml` 中修改：

```yaml
bangumi:
  vmid: 1146476510  # 你的B站UID
```

### 获取 UID

1. 登录 B站
2. 访问 https://space.bilibili.com/
3. URL 最后的数字就是 UID

**注意**：追番列表必须设为**公开**！

## 🔄 更新频率

建议每周更新一次：

```bash
# 手动更新
npx hexo bangumi -u

# 或设置 GitHub Actions 自动更新（见 BANGUMI_SETUP.md）
```

## 📝 自定义样式

编辑 `source/bangumis/index.md` 的 `<style>` 部分：

```css
/* 修改主色调 */
.bangumi-active {
  background: linear-gradient(135deg, #your-color 0%, #your-color2 100%) !important;
}

/* 修改卡片悬停效果 */
.bangumi-item:hover {
  background: your-color;
}
```

## 🐛 常见问题

### Q: 追番列表为空？
A: 检查 B站 UID 是否正确，追番列表是否公开

### Q: 样式显示异常？
A: 清除浏览器缓存，或执行 `npx hexo clean && npx hexo generate`

### Q: 如何添加手动番剧？
A: 编辑 `source/_data/extra_bangumis.json`（见 BANGUMI_PAGE.md）

## 📚 更多文档

- [追番系统说明](BANGUMI_PAGE.md) - 完整配置文档
- [追番配置总结](BANGUMI_SETUP.md) - 技术细节和维护

---

**更新时间**：2026-07-20  
**数据源**：Bilibili API  
**当前追番数**：2 部
