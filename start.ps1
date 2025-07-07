# PowerShell 启动脚本
Write-Host "智慧融媒体云平台启动脚本" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green

# 检查 Node.js 是否安装
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "错误：未检测到 Node.js，请先安装 Node.js" -ForegroundColor Red
    exit 1
}

# 检查 npm 是否安装
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "错误：未检测到 npm，请先安装 npm" -ForegroundColor Red
    exit 1
}

# 安装依赖
Write-Host "正在安装项目依赖..." -ForegroundColor Yellow
npm run install-all

# 检查 MongoDB 是否运行
Write-Host "请确保 MongoDB 正在运行..." -ForegroundColor Yellow
Write-Host "如果未安装 MongoDB，请访问: https://www.mongodb.com/try/download/community" -ForegroundColor Cyan

# 启动项目
Write-Host "启动开发服务器..." -ForegroundColor Yellow
npm run dev
