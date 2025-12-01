#!/bin/bash

# 加载 nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 使用 Node.js 20
nvm use 20

# 检查 Node.js 版本
echo "当前 Node.js 版本: $(node --version)"
echo "当前 npm 版本: $(npm --version)"
echo ""

# 运行开发服务器
npm run dev

