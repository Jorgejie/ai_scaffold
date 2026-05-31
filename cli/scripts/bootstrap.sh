#!/bin/bash
# ai-scaffold 快速启动脚本
# 一键执行: CLI骨架搭建 + AI初始化指引

set -e

echo "🤖 AI Coding Skeleton — ai-scaffold"
echo "===================================="
echo ""

# 检查是否在Git仓库中
if [ ! -d ".git" ]; then
    echo "⚠️  Warning: Current directory is not a Git repository."
    echo "   It's recommended to initialize Git first:"
    echo "   git init"
    echo ""
fi

# Step 1: 运行CLI创建骨架
echo "🔧 Step 1: Creating project skeleton..."
echo ""

npx ai-scaffold-pro "$@"

echo ""
echo "===================================="
echo ""

# Step 2: 显示AI初始化指引
echo "🤖 Step 2: AI Initialization Guide"
echo ""
echo "✅ Skeleton created successfully!"
echo ""
echo "Next steps:"
echo ""
echo "1. Open this project in your AI coding assistant:"
echo "   - Claude Code"
echo "   - Qoder"  
echo "   - Codex"
echo "   - OpenCode"
echo ""
echo "2. In the AI chat, enter one of these commands:"
echo ""
echo "   Option A:"
echo "   👉 '按 .qoder/skills/project_initialization/SKILL.md 初始化'"
echo ""
echo "   Option B:"
echo "   👉 '阅读 AI_INIT_GUIDE.md 并执行初始化'"
echo ""
echo "3. The AI will:"
echo "   • Scan your source code"
echo "   • Understand your project architecture"
echo "   • Generate customized rules based on actual code"
echo "   • Create comprehensive references documentation"
echo "   • Set up intelligent agents and hooks"
echo ""
echo "   Estimated time: 2-5 minutes"
echo ""
echo "💡 Tip: See AI_INIT_GUIDE.md for detailed instructions"
echo ""
echo "===================================="
echo ""
echo "Happy coding! 🎉"
