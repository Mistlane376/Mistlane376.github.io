#!/bin/bash
# 代码块样式验证脚本

cd "$(dirname "$0")"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║            代码块样式验证                                    ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# 检查 CSS 文件
echo "📋 检查 CSS 文件..."
if [ -f "source/css/markdown.css" ]; then
  size=$(wc -c < "source/css/markdown.css")
  echo "   ✅ markdown.css 存在 ($size bytes)"

  # 检查关键样式
  if grep -q '\.highlight table' "source/css/markdown.css"; then
    echo "   ✅ table 样式已修复"
  else
    echo "   ⚠️  table 样式未找到"
  fi

  if grep -q 'border-radius' "source/css/markdown.css"; then
    echo "   ✅ border-radius 已设置"
  else
    echo "   ⚠️  border-radius 未设置"
  fi

  if grep -q 'box-shadow' "source/css/markdown.css"; then
    echo "   ✅ box-shadow 已设置"
  else
    echo "   ⚠️  box-shadow 未设置"
  fi
else
  echo "   ❌ markdown.css 不存在"
fi

# 检查生成的站点
echo ""
echo "📋 检查生成的代码块..."
if [ -f "public/posts/a7b8c9d0/index.html" ]; then
  echo "   ✅ 文章页面已生成"

  # 检查代码块结构
  if grep -q 'figure class="highlight' "public/posts/a7b8c9d0/index.html"; then
    echo "   ✅ figure.highlight 结构存在"
  else
    echo "   ⚠️  figure.highlight 结构未找到"
  fi

  if grep -q '<table>' "public/posts/a7b8c9d0/index.html"; then
    echo "   ✅ table 结构存在"
  else
    echo "   ⚠️  table 结构未找到"
  fi
else
  echo "   ⚠️  文章页面未生成"
fi

# 检查 CSS 引入
echo ""
echo "📋 检查 CSS 引入..."
if [ -f "public/index.html" ]; then
  if grep -q 'markdown.css' "public/index.html"; then
    echo "   ✅ markdown.css 已引入"
  else
    echo "   ⚠️  markdown.css 未引入"
  fi
else
  echo "   ❌ index.html 不存在"
fi

# 检查生成文件数
echo ""
echo "📋 检查站点生成..."
if [ -d "public" ]; then
  file_count=$(find "public" -type f | wc -l)
  echo "   ✅ public/ 中有 $file_count 个文件"
else
  echo "   ❌ public/ 目录不存在"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║            ✅ 验证完成                                        ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
