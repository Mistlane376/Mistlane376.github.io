#!/bin/bash
# 快速验证脚本 - 检查所有改动

cd "$(dirname "$0")"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║            About 页面改动验证                                ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# 检查 .gitignore
echo "📋 检查 .gitignore..."
if git status --short | grep -q ".gitignore"; then
  echo "   ❌ .gitignore 有问题"
else
  echo "   ✅ .gitignore 正常"
fi

# 检查 CSDN 链接（About 页面）
echo ""
echo "📋 检查 CSDN 链接（About 页面）..."
if grep -q 'csdn.net/ljl37' "source/about/index.html"; then
  echo "   ✅ source/about/index.html 中有 CSDN 链接"
else
  echo "   ❌ source/about/index.html 中缺少 CSDN 链接"
fi

if [ -f "public/about/index.html" ]; then
  if grep -q 'csdn.net/ljl37' "public/about/index.html"; then
    echo "   ✅ public/about/index.html 中有 CSDN 链接"
  else
    echo "   ❌ public/about/index.html 中缺少 CSDN 链接"
  fi
else
  echo "   ⚠️  public/about/index.html 不存在（需要生成）"
fi

# 检查 CSDN 社交图标（侧边栏）
echo ""
echo "📋 检查 CSDN 社交图标（侧边栏）..."
if grep -q 'fas fa-code' "_config.butterfly.yml"; then
  echo "   ✅ _config.butterfly.yml 中有 CSDN 配置"
else
  echo "   ❌ _config.butterfly.yml 中缺少 CSDN 配置"
fi

if [ -f "public/index.html" ]; then
  if grep -q 'csdn.net/ljl37' "public/index.html"; then
    echo "   ✅ public/index.html 中有 CSDN 图标"
  else
    echo "   ❌ public/index.html 中缺少 CSDN 图标"
  fi
else
  echo "   ⚠️  public/index.html 不存在（需要生成）"
fi

# 检查联系方式数量
echo ""
echo "📋 检查联系方式..."
contact_count=$(grep -c 'contact-btn' "source/about/index.html")
echo "   ✅ About 页面共有 $contact_count 个联系方式按钮"

# 检查必要文件
echo ""
echo "📋 检查必要文件..."
files=(
  "source/about/index.html"
  "source/css/about-envelope.css"
  "source/css/author-card.css"
  "source/css/global.css"
  "source/js/about-skills.js"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "   ✅ $file"
  else
    echo "   ❌ $file 缺失"
  fi
done

# 检查站点生成
echo ""
echo "📋 检查站点生成..."
if [ -f "public/about/index.html" ]; then
  echo "   ✅ 站点已生成"
else
  echo "   ⚠️  站点未生成，运行: npx hexo generate"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║            ✅ 验证完成                                        ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
