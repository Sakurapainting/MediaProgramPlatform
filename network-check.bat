@echo off
echo 🌐 本地MQTT服务器网络配置检查
echo ================================

REM 1. 获取服务器IP地址
echo 📍 1. 服务器IP地址信息:
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do (
    for /f "tokens=1" %%j in ("%%i") do (
        if not "%%j"=="127.0.0.1" (
            echo    本机IP地址: %%j
            set LOCAL_IP=%%j
        )
    )
)

echo.
echo 🔍 2. 端口占用检查:
netstat -an | findstr ":1883" >nul
if %errorlevel%==0 (
    echo    ✅ MQTT端口 1883 已被占用 ^(正常^)
) else (
    echo    ❌ MQTT端口 1883 未被占用 ^(需启动服务^)
)

netstat -an | findstr ":5001" >nul
if %errorlevel%==0 (
    echo    ✅ HTTP端口 5001 已被占用 ^(正常^)
) else (
    echo    ❌ HTTP端口 5001 未被占用 ^(需启动服务^)
)

echo.
echo 🔥 3. Windows防火墙配置:
echo    请在Windows防火墙中开放以下端口:
echo    - TCP 1883 ^(MQTT服务^)
echo    - TCP 5001 ^(HTTP API^)
echo.
echo    配置步骤:
echo    1. 控制面板 ^> 系统和安全 ^> Windows Defender防火墙
echo    2. 点击"高级设置"
echo    3. 选择"入站规则" ^> "新建规则"
echo    4. 选择"端口" ^> "TCP" ^> 输入端口号
echo    5. 选择"允许连接"

echo.
echo 🧪 4. 连接测试:
if defined LOCAL_IP (
    echo    测试MQTT端口连通性:
    echo    telnet %LOCAL_IP% 1883
    echo.
    echo    测试HTTP API:
    echo    curl http://%LOCAL_IP%:5001/health
    echo    或在浏览器中访问: http://%LOCAL_IP%:5001/health
) else (
    echo    测试命令:
    echo    telnet YOUR_SERVER_IP 1883
    echo    curl http://YOUR_SERVER_IP:5001/health
)

echo.
echo 📱 5. 安卓设备配置:
echo    在安卓App的设置界面中配置:
if defined LOCAL_IP (
    echo    MQTT服务器地址: %LOCAL_IP%
) else (
    echo    MQTT服务器地址: YOUR_SERVER_IP
)
echo    MQTT端口: 1883

echo.
echo 🚀 6. 启动服务:
echo    cd server
echo    npm run dev

echo.
echo 📋 7. 测试主题列表:
echo    📢 设备注册: device/{deviceId}/register
echo    💓 心跳: device/{deviceId}/heartbeat
echo    📊 状态上报: device/{deviceId}/status  
echo    📤 内容推送: device/{deviceId}/content/push
echo    🎛️ 命令下发: device/{deviceId}/command
echo    📄 日志: device/{deviceId}/log

echo.
echo ================================
echo 配置完成后，运行测试脚本验证:
echo node test-mqtt-quick.js

pause
