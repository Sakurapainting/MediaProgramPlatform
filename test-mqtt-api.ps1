# MQTT API 测试脚本 (PowerShell)
# 用于测试智慧融媒体云平台的MQTT功能

Write-Host "🚀 开始测试智慧融媒体云平台MQTT API" -ForegroundColor Green

$baseUrl = "http://localhost:5001"
$apiUrl = "$baseUrl/api"

# 首先测试健康检查
Write-Host "`n📊 1. 测试服务器健康状态..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "✅ 服务器状态: $($healthResponse.status)" -ForegroundColor Green
    Write-Host "📡 HTTP服务: $($healthResponse.services.http)" -ForegroundColor Cyan
    Write-Host "🗄️  数据库: $($healthResponse.services.database)" -ForegroundColor Cyan
    Write-Host "📱 MQTT服务: 运行中，端口 $($healthResponse.services.mqtt.port)" -ForegroundColor Cyan
    Write-Host "🔗 已连接设备: $($healthResponse.services.mqtt.totalConnectedDevices)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ 服务器连接失败: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 模拟用户登录获取token (这里使用模拟token)
Write-Host "`n🔐 2. 模拟用户认证..." -ForegroundColor Yellow
# 注意：真实环境中需要先登录获取JWT token
$headers = @{
    "Content-Type" = "application/json"
    # "Authorization" = "Bearer YOUR_JWT_TOKEN_HERE"  # 实际使用时需要真实token
}

# 测试MQTT状态API
Write-Host "`n📡 3. 测试MQTT状态查询..." -ForegroundColor Yellow
try {
    # 由于需要JWT认证，这里会返回401，但我们可以看到端点是否可达
    $response = Invoke-WebRequest -Uri "$apiUrl/mqtt/status" -Method GET -Headers $headers -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 401) {
        Write-Host "✅ MQTT状态API端点可达 (需要认证)" -ForegroundColor Green
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ MQTT状态API端点可达 (需要认证)" -ForegroundColor Green
    } else {
        Write-Host "❌ MQTT状态API错误: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 创建模拟设备数据
$androidDevice = @{
    deviceId = "android_001"
    name = "安卓屏幕终端_001"
    type = "android_screen"
    location = @{
        name = "测试大厅"
        address = "北京市朝阳区测试大厦1层"
        coordinates = @{
            latitude = 39.9042
            longitude = 116.4074
        }
    }
    specifications = @{
        resolution = "1920x1080"
        size = "55寸"
        orientation = "horizontal"
    }
    mqtt = @{
        clientId = "android_test_001"
        isConnected = $false
        subscriptions = @()
        messageCount = 0
    }
    tags = @("mqtt", "android", "test")
}

Write-Host "`n📱 4. 模拟安卓设备信息..." -ForegroundColor Yellow
Write-Host "设备ID: $($androidDevice.deviceId)" -ForegroundColor Cyan
Write-Host "设备名称: $($androidDevice.name)" -ForegroundColor Cyan
Write-Host "设备类型: $($androidDevice.type)" -ForegroundColor Cyan
Write-Host "位置: $($androidDevice.location.name)" -ForegroundColor Cyan
Write-Host "分辨率: $($androidDevice.specifications.resolution)" -ForegroundColor Cyan

# 测试无认证的端点
Write-Host "`n🔍 5. 检查API端点可达性..." -ForegroundColor Yellow

$endpoints = @(
    "/api/mqtt/status",
    "/api/mqtt/devices", 
    "/api/devices",
    "/api/auth"
)

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl$endpoint" -Method GET -ErrorAction SilentlyContinue
        Write-Host "✅ $endpoint - 状态: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        $statusCode = $_.Exception.Response.StatusCode
        if ($statusCode -eq 401) {
            Write-Host "🔐 $endpoint - 需要认证 (401)" -ForegroundColor Yellow
        } elseif ($statusCode -eq 404) {
            Write-Host "❌ $endpoint - 未找到 (404)" -ForegroundColor Red
        } else {
            Write-Host "⚠️  $endpoint - 状态: $statusCode" -ForegroundColor Orange
        }
    }
}

Write-Host "`n📋 6. MQTT连接指南" -ForegroundColor Yellow
Write-Host "====================" -ForegroundColor White
Write-Host "MQTT服务器地址: localhost" -ForegroundColor Cyan
Write-Host "MQTT端口: 1884" -ForegroundColor Cyan
Write-Host "支持的消息类型:" -ForegroundColor Cyan
Write-Host "  - register (设备注册)" -ForegroundColor White
Write-Host "  - heartbeat (心跳)" -ForegroundColor White
Write-Host "  - status (状态更新)" -ForegroundColor White
Write-Host "  - data (设备数据)" -ForegroundColor White
Write-Host "  - content_response (内容响应)" -ForegroundColor White

Write-Host "`n📝 7. 安卓终端连接示例" -ForegroundColor Yellow
Write-Host "====================" -ForegroundColor White

$registerMessage = @{
    type = "register"
    deviceId = "android_001"
    clientId = "android_client_001"
    timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    data = $androidDevice
} | ConvertTo-Json -Depth 10 -Compress

Write-Host "注册消息示例:" -ForegroundColor Cyan
Write-Host $registerMessage -ForegroundColor White

$heartbeatMessage = @{
    type = "heartbeat"
    deviceId = "android_001"
    clientId = "android_client_001"
    timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    data = @{
        uptime = 12345678
        memoryUsage = 45.6
        cpuUsage = 23.1
        temperature = 35
        brightness = 80
    }
} | ConvertTo-Json -Depth 5 -Compress

Write-Host "`n心跳消息示例:" -ForegroundColor Cyan
Write-Host $heartbeatMessage -ForegroundColor White

Write-Host "`n🔗 8. 推荐的测试工具" -ForegroundColor Yellow
Write-Host "==================" -ForegroundColor White
Write-Host "1. MQTT.fx - 图形化MQTT客户端" -ForegroundColor Cyan
Write-Host "2. MQTTX - 跨平台MQTT 5.0客户端" -ForegroundColor Cyan
Write-Host "3. Mosquitto - 命令行MQTT客户端" -ForegroundColor Cyan
Write-Host "4. 使用提供的 test-mqtt-client.js 脚本" -ForegroundColor Cyan

Write-Host "`n✅ 测试完成!" -ForegroundColor Green
Write-Host "MQTT服务正在运行，等待安卓终端连接..." -ForegroundColor Cyan
