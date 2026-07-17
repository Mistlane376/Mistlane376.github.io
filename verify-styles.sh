#!/bin/bash
# 样式验证脚本 - 检查所有 CSS 文件

cd "$(dirname "$0")"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║            博客样式验证                                      ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# 检查 CSS 文件
echo "📋 检查 CSS 文件..."
css_files=(
  "source/css/global.css"
  "source/css/about-envelope.css"
  "source/css/author-card.css"
  "source/css/markdown.css"
)

for file in "${css_files[@]}"; do
  if [ -f "$file" ]; then
    size=$(wc -c < "$file")
    echo "   ✅ $file ($size bytes)"
  else
    echo "   ❌ $file 缺失"
  fi
done

# 检查配置
echo ""
echo "📋 检查 CSS 配置..."
if grep -q 'markdown.css' "_config.butterfly.yml"; then
  echo "   ✅ markdown.css 已配置"
else
  echo "   ⚠️  markdown.css 未配置"
fi

# 检查生成的文件
echo ""
echo "📋 检查生成的 CSS 文件..."
if [ -d "public/css" ]; then
  css_count=$(ls "public/css" | wc -l)
  echo "   ✅ public/css/ 中有 $css_count 个文件"
else
  echo "   ❌ public/css/ 目录不存在"
fi

# 检查站点生成
echo ""
echo "📋 检查站点生成..."
if [ -f "public/index.html" ]; then
  echo "   ✅ 站点已生成"

  # 检查 CSS 引入
  css_refs=$(grep -o 'href="/css/[^"]*\.css"' "public/index.html" | wc -l)
  echo "   ✅ 引入 $css_refs 个 CSS 文件"
else
  echo "   ❌ 站点未生成"
fi

# 检查文档
echo ""
echo "📋 检查文档..."
if [ -f "CHANGELOG.md" ]; then
  echo "   ✅ CHANGELOG.md 存在"
else
  echo "   ❌ CHANGELOG.md 缺失"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║            ✅ 验证完成                                        ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
