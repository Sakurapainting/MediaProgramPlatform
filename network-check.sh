#!/bin/bash

# 智慧融媒体云平台 - 本地MQTT服务器网络配置检查脚本

echo "🌐 本地MQTT服务器网络配置检查"
echo "================================"

# 1. 获取本机IP地址
echo "📍 1. 服务器IP地址信息:"
if command -v ip &> /dev/null; then
    # Linux系统
    LOCAL_IP=$(ip route get 1 | awk '{print $(NF-2); exit}')
    echo "   本机IP地址: $LOCAL_IP"
elif command -v ifconfig &> /dev/null; then
    # macOS/Linux系统
    LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
    echo "   本机IP地址: $LOCAL_IP"
else
    echo "   请手动获取IP地址: ipconfig (Windows) 或 ifconfig (Linux/Mac)"
fi

# 2. 检查端口占用
echo ""
echo "🔍 2. 端口占用检查:"
if command -v netstat &> /dev/null; then
    if netstat -tuln | grep -q ":1883"; then
        echo "   ✅ MQTT端口 1883 已被占用 (正常)"
    else
        echo "   ❌ MQTT端口 1883 未被占用 (需启动服务)"
    fi
    
    if netstat -tuln | grep -q ":5001"; then
        echo "   ✅ HTTP端口 5001 已被占用 (正常)"
    else
        echo "   ❌ HTTP端口 5001 未被占用 (需启动服务)"
    fi
else
    echo "   请手动检查端口: netstat -tuln | grep 1883"
fi

# 3. 防火墙配置提示
echo ""
echo "🔥 3. 防火墙配置:"
echo "   请确保以下端口已开放:"
echo "   - TCP 1883 (MQTT服务)"
echo "   - TCP 5001 (HTTP API)"
echo ""

# 根据操作系统给出防火墙配置命令
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "   Linux防火墙配置命令:"
    echo "   sudo ufw allow 1883"
    echo "   sudo ufw allow 5001"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "   macOS防火墙配置:"
    echo "   在系统偏好设置 -> 安全性与隐私 -> 防火墙中配置"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    echo "   Windows防火墙配置:"
    echo "   控制面板 -> 系统和安全 -> Windows Defender防火墙 -> 高级设置"
    echo "   添加入站规则允许端口 1883 和 5001"
fi

# 4. 测试连接
echo ""
echo "🧪 4. 连接测试:"
echo "   测试MQTT端口连通性:"
if [ -n "$LOCAL_IP" ]; then
    echo "   telnet $LOCAL_IP 1883"
    echo ""
    echo "   测试HTTP API:"
    echo "   curl http://$LOCAL_IP:5001/health"
else
    echo "   telnet YOUR_SERVER_IP 1883"
    echo "   curl http://YOUR_SERVER_IP:5001/health"
fi

# 5. 安卓设备配置
echo ""
echo "� 5. 安卓设备配置:"
echo "   在安卓App的设置界面中配置:"
if [ -n "$LOCAL_IP" ]; then
    echo "   MQTT服务器地址: $LOCAL_IP"
else
    echo "   MQTT服务器地址: YOUR_SERVER_IP"
fi
echo "   MQTT端口: 1883"

# 6. 启动服务
echo ""
echo "🚀 6. 启动服务:"
echo "   cd server && npm run dev"

# 7. 测试主题列表
echo ""
echo "📋 7. 测试主题列表:"
echo "   📢 设备注册: device/{deviceId}/register"
echo "   💓 心跳: device/{deviceId}/heartbeat"
echo "   📊 状态上报: device/{deviceId}/status"
echo "   📤 内容推送: device/{deviceId}/content/push"
echo "   🎛️ 命令下发: device/{deviceId}/command"
echo "   📄 日志: device/{deviceId}/log"

echo ""
echo "================================"
echo "配置完成后，运行测试脚本验证:"
echo "node test-mqtt-quick.js"
