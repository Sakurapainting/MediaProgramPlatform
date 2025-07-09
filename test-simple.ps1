# 简化的MQTT API测试脚本
Write-Host "🚀 测试智慧融媒体云平台MQTT功能" -ForegroundColor Green

$baseUrl = "http://localhost:5001"

# 测试健康检查
Write-Host "`n📊 测试服务器健康状态..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "✅ 服务器状态: $($health.status)" -ForegroundColor Green
    Write-Host "📡 HTTP服务: $($health.services.http)" -ForegroundColor Cyan
    Write-Host "🗄️  数据库: $($health.services.database)" -ForegroundColor Cyan
    Write-Host "📱 MQTT端口: $($health.services.mqtt.port)" -ForegroundColor Cyan
    Write-Host "🔗 连接设备数: $($health.services.mqtt.totalConnectedDevices)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ 服务器连接失败: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 测试API端点
Write-Host "`n🔍 检查API端点..." -ForegroundColor Yellow
$endpoints = @("/api/mqtt/status", "/api/devices", "/api/auth")

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl$endpoint" -Method GET -ErrorAction SilentlyContinue
        Write-Host "✅ $endpoint - 状态: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        $statusCode = $_.Exception.Response.StatusCode
        if ($statusCode -eq 401) {
            Write-Host "🔐 $endpoint - 需要认证" -ForegroundColor Yellow
        } else {
            Write-Host "⚠️  $endpoint - 状态: $statusCode" -ForegroundColor Orange
        }
    }
}

Write-Host "`n📋 MQTT连接信息" -ForegroundColor Yellow
Write-Host "服务器: localhost" -ForegroundColor Cyan
Write-Host "端口: 1884" -ForegroundColor Cyan

Write-Host "`n📝 设备注册消息示例:" -ForegroundColor Yellow
$registerJson = @"
{
  "type": "register",
  "deviceId": "android_001", 
  "clientId": "test_client_001",
  "timestamp": $([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()),
  "data": {
    "deviceId": "android_001",
    "name": "测试安卓终端",
    "type": "android_screen",
    "location": {
      "name": "测试位置",
      "address": "测试地址",
      "coordinates": {"latitude": 39.9042, "longitude": 116.4074}
    },
    "specifications": {
      "resolution": "1920x1080",
      "size": "55寸",
      "orientation": "horizontal"
    }
  }
}
"@

Write-Host $registerJson -ForegroundColor White

Write-Host "`n✅ 测试完成!" -ForegroundColor Green
Write-Host "MQTT服务正在运行，等待安卓终端连接..." -ForegroundColor Cyan
