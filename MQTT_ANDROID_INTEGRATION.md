# 鏅烘収铻嶅獟浣撲簯骞冲彴 - MQTT瀹夊崜缁堢闆嗘垚

## 馃帀 瀹屾垚鐘舵€�

鉁� **鏈湴MQTT鏈嶅姟鍣ㄩ泦鎴愬畬鎴�** - 瀹夊崜灞忓箷缁堢鍙互閫氳繃鏈湴閮ㄧ讲鐨凪QTT broker涓庝簯骞冲彴杩涜鐪熷疄杩炴帴鍜屾暟鎹紶杈�

## 馃搵 宸插疄鐜板姛鑳�

### 1. MQTT鏈嶅姟鍣� (`server/src/services/mqttService.ts`)
- 鉁� 鍩轰簬Aedes鐨勬湰鍦癕QTT broker鏈嶅姟鍣�
- 鉁� 鏀寔璁惧娉ㄥ唽銆佸績璺炽€佺姸鎬佷笂鎶ャ€佹暟鎹紶杈�
- 鉁� 鏀寔鍐呭鎺ㄩ€併€佸懡浠や笅鍙戙€佸箍鎾秷鎭�
- 鉁� 鑷姩璁惧鐘舵€佺鐞嗗拰鏁版嵁搴撳悓姝�
- 鉁� 鏈湴MQTT鏈嶅姟鍣ㄧ洃鍚鍙�1883

### 2. Device妯″瀷鎵╁睍 (`server/src/models/Device.ts`)
- 鉁� 鏂板`android_screen`璁惧绫诲瀷
- 鉁� 鏂板MQTT杩炴帴淇℃伅瀛楁锛�
  - `clientId`: MQTT瀹㈡埛绔疘D
  - `isConnected`: 杩炴帴鐘舵€�
  - `lastConnectedAt`: 鏈€鍚庤繛鎺ユ椂闂�
  - `subscriptions`: 璁㈤槄涓婚鍒楄〃
  - `messageCount`: 娑堟伅璁℃暟
  - `lastMessage`: 鏈€鍚庝竴鏉℃秷鎭�

### 3. MQTT绠＄悊API (`server/src/routes/mqtt.ts`)
- 鉁� `GET /api/mqtt/status` - MQTT杩炴帴鐘舵€佹煡璇�
- 鉁� `GET /api/mqtt/devices` - 瀹夊崜璁惧鍒楄〃
- 鉁� `GET /api/mqtt/devices/:deviceId` - 璁惧璇︽儏
- 鉁� `POST /api/mqtt/push` - 鍐呭鎺ㄩ€佸埌璁惧
- 鉁� `POST /api/mqtt/command` - 鍛戒护涓嬪彂
- 鉁� `POST /api/mqtt/broadcast` - 骞挎挱娑堟伅
- 鉁� `POST /api/mqtt/batch-push` - 鎵归噺鎺ㄩ€�
- 鉁� `POST /api/mqtt/restart/:deviceId` - 璁惧閲嶅惎
- 鉁� `POST /api/mqtt/screenshot/:deviceId` - 杩滅▼鎴浘

### 4. 涓绘湇鍔″櫒闆嗘垚 (`server/src/index.ts`)
- 鉁� MQTT瀹㈡埛绔嚜鍔ㄥ惎鍔ㄥ拰杩炴帴绠＄悊
- 鉁� 浼橀泤鍏抽棴澶勭悊
- 鉁� 璺敱娉ㄥ唽鍜屼腑闂翠欢闆嗘垚
- 鉁� 閿欒澶勭悊鍜屾棩蹇楄褰�

## 馃敆 MQTT杩炴帴淇℃伅

### 鏈湴MQTT鏈嶅姟鍣ㄩ厤缃�
- **MQTT鍦板潃**: `鎮ㄧ殑鏈嶅姟鍣↖P鍦板潃` (鏈湴MQTT broker)
- **MQTT绔彛**: `1883` (鏈湴閮ㄧ讲)
- **鍗忚鐗堟湰**: MQTT v3.1.1
- **QoS绛夌骇**: 1 (鑷冲皯涓€娆′紶閫�)
- **璁よ瘉鏂瑰紡**: 鏃犻渶鐢ㄦ埛鍚嶅瘑鐮�
- **缃戠粶瑕佹眰**: 瀹夊崜璁惧涓庝簯骞冲彴鏈嶅姟鍣ㄥ湪鍚屼竴灞€鍩熺綉锛屾垨閫氳繃绔彛杞彂璁块棶

### 浜戝钩鍙癆PI閰嶇疆
- **API鍦板潃**: `鎮ㄧ殑鏈嶅姟鍣↖P鍦板潃:5001` (濡� 192.168.1.100:5001)
- **API绔彛**: `5001` (浜戝钩鍙癏TTP API鏈嶅姟)

### 馃挕 缃戠粶閰嶇疆鎸囧崡
1. 馃彔 **鏈湴MQTT鏈嶅姟鍣�**: 浜戝钩鍙拌嚜寤篈edes broker锛岀洃鍚�1883绔彛
2. 馃敟 **闃茬伀澧欓厤缃�**: 闇€寮€鏀�1883绔彛(MQTT)鍜�5001绔彛(API)
3. 锟� **缃戠粶瑕佹眰**: 瀹夊崜璁惧涓庝簯骞冲彴鏈嶅姟鍣ㄥ湪鍚屼竴灞€鍩熺綉
4. 馃敡 **浜戝钩鍙癆PI绔彛**: 纭繚5001绔彛瀵瑰畨鍗撹澶囧紑鏀�
5. 馃摫 **瀹夊崜绔厤缃�**: MQTT鏈嶅姟鍣ㄨ涓轰簯骞冲彴鏈嶅姟鍣↖P:1883
6. 馃搵 **璇︾粏閰嶇疆**: 鍙傝€� `NETWORK_CONFIG_GUIDE.md` 鏂囨。
7. 馃實 **鍏綉璁块棶**: 濡傞渶鍏綉璁块棶锛岄渶閰嶇疆绔彛杞彂

### HTTP API
- **鏈嶅姟鍣ㄥ湴鍧€**: `http://鎮ㄧ殑鏈嶅姟鍣↖P:5001` (濡� http://192.168.1.100:5001)
- **璁よ瘉鏂瑰紡**: JWT Bearer Token
- **绠＄悊鍛樿处鍙�**: admin@example.com / 123456

### 瀹夊崜绔厤缃ず渚�
```java
// MQTT杩炴帴閰嶇疆 - 杩炴帴鏈湴MQTT broker
String MQTT_BROKER_URL = "tcp://YOUR_SERVER_IP:1883";  // 鏀逛负浜戝钩鍙版湇鍔″櫒IP
String CLIENT_ID = "android_" + deviceId;

// 浜戝钩鍙癆PI閰嶇疆  
String API_BASE_URL = "http://YOUR_SERVER_IP:5001";
```

## 馃摫 瀹夊崜缁堢娑堟伅鍗忚

### 1. 璁惧娉ㄥ唽
```json
// 鍙戝竷涓婚: device/register
{
  "type": "register",
  "deviceId": "android_001",
  "clientId": "mqtt_client_001", 
  "timestamp": 1640995200000,
  "data": {
    "deviceId": "android_001",
    "name": "瀹夊崜灞忓箷缁堢_001",
    "type": "android_screen",
    "location": {
      "name": "澶у巺鏄剧ず灞�",
      "address": "鍖椾含甯傛湞闃冲尯xxx澶у帵1灞�",
      "coordinates": {"latitude": 39.9042, "longitude": 116.4074}
    },
    "specifications": {
      "resolution": "1920x1080",
      "size": "55瀵�", 
      "orientation": "horizontal"
    },
    "version": "1.0.0",
    "capabilities": ["display", "audio", "touch"]
  }
}
```

### 2. 蹇冭烦娑堟伅
```json
// 鍙戝竷涓婚: device/heartbeat
{
  "type": "heartbeat",
  "deviceId": "android_001",
  "clientId": "mqtt_client_001",
  "timestamp": 1640995200000,
  "data": {
    "uptime": 12345678,
    "memoryUsage": 45.6,
    "cpuUsage": 23.1,
    "temperature": 35,
    "brightness": 80
  }
}
```

### 3. 鐘舵€佹洿鏂�
```json
// 鍙戝竷涓婚: device/status  
{
  "type": "status",
  "deviceId": "android_001",
  "clientId": "mqtt_client_001",
  "timestamp": 1640995200000,
  "data": {
    "status": "online",
    "deviceInfo": {
      "battery": 85,
      "temperature": 32,
      "brightness": 80,
      "volume": 60
    }
  }
}
```

### 4. 璁惧鏁版嵁涓婃姤
```json
// 鍙戝竷涓婚: device/data
{
  "type": "data", 
  "deviceId": "android_001",
  "clientId": "mqtt_client_001",
  "timestamp": 1640995200000,
  "data": {
    "dataType": "screenshot",
    "payload": {
      "filename": "screenshot_001.jpg",
      "base64": "data:image/jpeg;base64,/9j/4AAQ...",
      "width": 1920,
      "height": 1080
    }
  }
}
```

### 5. 鍐呭鍝嶅簲
```json
// 鍙戝竷涓婚: device/content_response
{
  "type": "content_response",
  "deviceId": "android_001", 
  "clientId": "mqtt_client_001",
  "timestamp": 1640995200000,
  "data": {
    "contentId": "content_001",
    "status": "playing", // playing, completed, error
    "error": null
  }
}
```

## 馃摛 鏈嶅姟鍣ㄤ笅鍙戞秷鎭�

### 1. 鍐呭鎺ㄩ€�
```json
// 璁㈤槄涓婚: device/{clientId}/content
{
  "type": "content_push",
  "timestamp": 1640995200000,
  "data": {
    "contentId": "content_001",
    "url": "https://example.com/image.jpg",
    "type": "image",
    "duration": 10,
    "priority": 1,
    "schedule": {
      "startTime": "2024-01-01T09:00:00Z",
      "endTime": "2024-01-01T18:00:00Z"
    }
  }
}
```

### 2. 鍛戒护涓嬪彂
```json
// 璁㈤槄涓婚: device/{clientId}/commands
{
  "type": "command",
  "timestamp": 1640995200000,
  "data": {
    "command": "screenshot",
    "params": {
      "quality": 90,
      "format": "jpg"
    }
  }
}
```

### 3. 骞挎挱娑堟伅
```json
// 璁㈤槄涓婚: broadcast/all
{
  "type": "broadcast",
  "timestamp": 1640995200000,
  "data": {
    "message": "绯荤粺缁存姢閫氱煡",
    "level": "info"
  }
}
```

## 馃И 娴嬭瘯宸ュ叿

### 1. API娴嬭瘯鑴氭湰
```bash
node test-mqtt-quick.js  # 蹇€熷姛鑳芥祴璇�
node test-android-stable.js  # Android璁惧妯℃嫙娴嬭瘯
```

### 2. MQTT瀹㈡埛绔ā鎷熷櫒
```bash
# 浣跨敤鎻愪緵鐨凥TML妯℃嫙鍣�
open mqtt-test.html

# 鎴栦娇鐢∟ode.js瀹㈡埛绔�
node test-mqtt-client.js
```

### 3. 鎺ㄨ崘鐨凪QTT娴嬭瘯宸ュ叿
- **MQTT.fx** - 鍥惧舰鍖朚QTT瀹㈡埛绔�
- **MQTTX** - 璺ㄥ钩鍙癕QTT 5.0瀹㈡埛绔�  
- **Mosquitto** - 鍛戒护琛孧QTT瀹㈡埛绔�

## 鈿狅笍 鏁呴殰鎺掗櫎

### 甯歌闂锛欰ndroid搴旂敤杩炴帴鍚庤澶囨湭鍦ㄧ鐞嗙晫闈㈡樉绀�

#### 馃攳 闂璇婃柇姝ラ

1. **妫€鏌QTT杩炴帴鐘舵€�**
```bash
# 鏌ヨMQTT鏈嶅姟鐘舵€�
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://YOUR_SERVER_IP:5001/api/mqtt/status
```

2. **妫€鏌ユ湇鍔″櫒鏃ュ織**
- 鏌ョ湅鏄惁鏈�"MQTT client connected"娑堟伅
- 鏌ョ湅鏄惁鏈�"Processing device registration"娑堟伅
- 纭璁惧娉ㄥ唽鏄惁鎴愬姛

3. **楠岃瘉缃戠粶杩炴帴**
```bash
# Android璁惧涓婃祴璇曡繛閫氭€�
ping YOUR_SERVER_IP
telnet YOUR_SERVER_IP 1883
```

#### 馃洜锔� 瑙ｅ喅鏂规

**闂1: 浣跨敤localhost杩炴帴**
```java
// 鉂� 閿欒锛堜粎閫傜敤浜庢ā鎷熷櫒锛�
String MQTT_BROKER_URL = "tcp://localhost:1883";

// 鉁� 姝ｇ‘锛堢湡瀹炶澶囷級
String MQTT_BROKER_URL = "tcp://192.168.80.1:1883";  // 浣跨敤瀹為檯鏈嶅姟鍣↖P
```

**闂2: 娉ㄥ唽娑堟伅鏍煎紡閿欒**
```java
// 蹇呴』鍙戝竷鍒� device/register 涓婚
// 蹇呴』鍖呭惈 action, deviceId, deviceType 瀛楁
JSONObject registration = new JSONObject();
registration.put("action", "register");
registration.put("deviceId", "YOUR_DEVICE_ID");
registration.put("deviceType", "android_screen");
registration.put("timestamp", new Date().toISOString());
// ... 鍏朵粬蹇呰瀛楁
```

**闂3: 鏈闃呯‘璁や富棰�**
```java
// 蹇呴』璁㈤槄娉ㄥ唽纭涓婚
mqttClient.subscribe("device/" + CLIENT_ID + "/register/confirm", 1);
mqttClient.subscribe("device/" + CLIENT_ID + "/register/error", 1);
```

**闂4: 娌℃湁鍙战€佸績璺�**
```java
// 娉ㄥ唽鎴愬姛鍚庯紝姣�30绉掑彂閫佸績璺充繚鎸佸湪绾跨姸鎬�
Timer timer = new Timer();
timer.scheduleAtFixedRate(new TimerTask() {
    @Override
    public void run() {
        sendHeartbeat();
    }
}, 0, 30000);
```

#### 馃搵 瀹屾暣鐨凙ndroid MQTT闆嗘垚鎸囧崡

璇峰弬鑰冿細`ANDROID_MQTT_DEBUG_GUIDE.md` 鑾峰彇璇︾粏鐨勮皟璇曟寚鍗楀拰浠ｇ爜绀轰緥銆�

#### 馃敡 蹇€熼獙璇佸伐鍏�

杩愯娴嬭瘯鑴氭湰楠岃瘉鏈嶅姟鍣ㄥ伐浣滄甯革細
```bash
# 娴嬭瘯MQTT鏈嶅姟鍜岃澶囨敞鍐�
node test-android-stable.js

# 濡傛灉娴嬭瘯鑴氭湰鎴愬姛杩炴帴鍜屾敞鍐岋紝璇存槑鏈嶅姟鍣ㄦ甯�
# 闂鍑哄湪Android搴旂敤鐨勫疄鐜颁笂
```

## 馃殌 鍚姩鏈嶅姟

```bash
# 1. 鍚姩MongoDB鏁版嵵搴撴湇鍔�

# 2. 鍚姩鍚庣鏈嶅姟
cd server
npm run dev

# 3. 鍚姩鍓嶇鏈嶅姟 (鍙€�)
cd client  
npm start
```

## 馃搳 鐩戞帶鍜岀鐞�

### 鏈嶅姟鐘舵€佹煡璇�
```bash
curl http://localhost:5001/health
```

### MQTT鐘舵€佹煡璇� (闇€瑕佺櫥褰�)
```bash
# 1. 鐧诲綍鑾峰彇token
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"123456"}'

# 2. 鏌ヨMQTT鐘舵€�
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5001/api/mqtt/status
```

## 馃敡 閰嶇疆璇存槑

### 鐜鍙橀噺 (`server/.env`)
```env
MONGODB_URI=mongodb://localhost:27017/media-platform
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5001
MQTT_PORT=1883
CLIENT_URL=http://localhost:3000
```

### 鏈湴MQTT鏈嶅姟鍣ㄨ鏄�
- **鏈嶅姟鍣�**: 鏈湴Aedes broker锛岄泦鎴愬湪浜戝钩鍙板悗绔湇鍔′腑
- **绔彛**: 1883 (TCP)锛屽彲閰嶇疆SSL/TLS绔彛8883
- **鐗圭偣**: 鏈湴閮ㄧ讲锛屾暟鎹畨鍏紝鍝嶅簲蹇€�
- **璁よ瘉**: 褰撳墠鏃犻渶璁よ瘉锛屽彲鏍规嵁闇€瑕佸鍔犺璇佹満鍒�
- **灞€鍩熺綉**: 閫傚悎灞€鍩熺綉鐜閮ㄧ讲锛屾敮鎸佺鍙ｈ浆鍙戝叕缃戣闂�
- **瀹夊叏**: 寤鸿闃茬伀澧欎粎寮€鏀惧繀瑕佺鍙ｏ紝鐢熶骇鐜鍚敤璁よ瘉

## 馃摑 涓嬩竴姝ュ紑鍙戝缓璁�

1. **瀹夊崜瀹㈡埛绔紑鍙�**
   - 浣跨敤Eclipse Paho Android鎴栫被浼糓QTT搴�
   - 瀹炵幇鑷姩閲嶈繛鍜岀绾跨紦瀛�
   - 娣诲姞SSL/TLS鍔犲瘑鏀寔

2. **鍔熻兘澧炲己**
   - 澧炲姞璁惧鍒嗙粍绠＄悊
   - 鏀寔鍥轰欢鍗囩骇鎺ㄩ€�
   - 娣诲姞瀹炴椂闊宠棰戞祦鎺ㄩ€�
   - 瀹炵幇璁惧杩滅▼鎺у埗闈㈡澘

3. **鐩戞帶浼樺寲**
   - 娣诲姞璁惧鍋ュ悍鐘舵€佺洃鎺�
   - 瀹炵幇寮傚父鍛婅鏈哄埗
   - 澧炲姞璇︾粏鐨勬搷浣滄棩蹇�

4. **鎬ц兘浼樺寲**
   - 鏀寔闆嗙兢閮ㄧ讲
   - 娣诲姞Redis缂撳瓨
   - 浼樺寲澶ч噺璁惧骞跺彂澶勭悊

## 馃敀 瀹夊叏鑰冭檻

- JWT璁よ瘉淇濇姢API璁块棶
- MQTT瀹㈡埛绔疘D楠岃瘉
- 寤鸿鐢熶骇鐜鍚敤SSL/TLS
- 定期更新JWT密钥

---

**馃帀 瀹夊崜灞忓箷缁堢涓庢櫤鎱ц瀺濯掍綋浜戝钩鍙扮殑鏈湴MQTT杩炴帴鍔熻兘宸插畬鎴愶紒**

鐜板湪瀹夊崜缁堢鍙互锛�
- 閫氳繃鏈湴MQTT broker杩炴帴鍒颁簯骞冲彴
- 娉ㄥ唽璁惧淇℃伅鍜岃鏍�
- 鍙战€佸績璺冲拰鐘舵€佹暟鎹�  
- 鎺ユ敹鍐呭鎺ㄩ€佸拰鍛戒护
- 涓婃姤璁惧鏁版嵁鍜屽搷搴旂粨鏋�

缃戠珯绔鐞嗗姛鑳斤細
- 瀹炴椂鏌ョ湅璁惧杩炴帴鐘舵€�
- 鎺ㄩ€佸唴瀹瑰埌鎸囧畾璁惧
- 涓嬪彂鎺у埗鍛戒护
- 鐩戞帶璁惧鍋ュ悍鐘舵€�
- 鎵归噺绠＄悊鍜屽箍鎾姛鑳�

鎶€鏈灦鏋勶細
- 鏈湴MQTT broker (Aedes) 鐩戝惉1883绔彛
- 浜戝钩鍙板悗绔泦鎴怣QTT鏈嶅姟
- 瀹夊崜缁堢鐩磋繛鏈湴鏈嶅姟鍣�
- 鏀寔灞€鍩熺綉閮ㄧ讲鍜屽叕缃戠鍙ｈ浆鍙�
# 1. 登录获取token
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"123456"}'

# 2. 查询MQTT状态
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5001/api/mqtt/status
```

## 🔧 配置说明

### 环境变量 (`server/.env`)
```env
MONGODB_URI=mongodb://localhost:27017/media-platform
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5001
MQTT_PORT=1883
CLIENT_URL=http://localhost:3000
```

### 本地MQTT服务器说明
- **服务器**: 本地Aedes broker，集成在云平台后端服务中
- **端口**: 1883 (TCP)，可配置SSL/TLS端口8883
- **特点**: 本地部署，数据安全，响应快速
- **认证**: 当前无需认证，可根据需要增加认证机制
- **局域网**: 适合局域网环境部署，支持端口转发公网访问
- **安全**: 建议防火墙仅开放必要端口，生产环境启用认证

## 📝 下一步开发建议

1. **安卓客户端开发**
   - 使用Eclipse Paho Android或类似MQTT库
   - 实现自动重连和离线缓存
   - 添加SSL/TLS加密支持

2. **功能增强**
   - 增加设备分组管理
   - 支持固件升级推送
   - 添加实时音视频流推送
   - 实现设备远程控制面板

3. **监控优化**
   - 添加设备健康状态监控
   - 实现异常告警机制
   - 增加详细的操作日志

4. **性能优化**
   - 支持集群部署
   - 添加Redis缓存
   - 优化大量设备并发处理

## 🔒 安全考虑

- JWT认证保护API访问
- MQTT客户端ID验证
- 建议生产环境启用SSL/TLS
- 定期更新JWT密钥

---

**🎉 安卓屏幕终端与智慧融媒体云平台的本地MQTT连接功能已完成！**

现在安卓终端可以：
- 通过本地MQTT broker连接到云平台
- 注册设备信息和规格
- 发送心跳和状态数据  
- 接收内容推送和命令
- 上报设备数据和响应结果

网站端管理功能：
- 实时查看设备连接状态
- 推送内容到指定设备
- 下发控制命令
- 监控设备健康状态
- 批量管理和广播功能

技术架构：
- 本地MQTT broker (Aedes) 监听1883端口
- 云平台后端集成MQTT服务
- 安卓终端直连本地服务器
- 支持局域网部署和公网端口转发

## 🔧 故障排除

### ❌ 安卓APP连接后设备未显示在管理界面

**问题描述**: 安卓APP显示MQTT连接成功，但设备没有在云平台设备管理界面中出现。

**可能原因**:
1. **MQTT服务器地址错误** - 使用了`localhost`而非服务器实际IP
2. **没有发送注册消息** - 仅连接MQTT不足以注册设备
3. **注册消息格式错误** - 消息格式不符合服务器要求
4. **发送时机错误** - 在MQTT连接建立前发送消息

**解决步骤**:

#### 1. 检查MQTT服务器地址
```java
// ❌ 错误配置
String MQTT_BROKER_URL = "tcp://localhost:1883";

// ✅ 正确配置 - 使用服务器实际IP
String MQTT_BROKER_URL = "tcp://192.168.80.1:1883";  // 替换为您的服务器IP
```

#### 2. 验证服务器连通性
使用以下PowerShell命令验证服务器状态：
```powershell
# 检查MQTT服务器状态
netstat -an | findstr ":1883"

# 验证API服务器响应
Invoke-RestMethod -Uri "http://localhost:5001/health" -Method GET
```

#### 3. 确保发送正确的注册消息
```java
// 在MQTT连接成功后发送注册消息
mqttClient.connect(options, null, new IMqttActionListener() {
    @Override
    public void onSuccess(IMqttToken asyncActionToken) {
        try {
            // 订阅确认主题
            mqttClient.subscribe("device/" + CLIENT_ID + "/register_confirm", 1);
            
            // 发送注册消息
            JSONObject registerMsg = new JSONObject();
            registerMsg.put("type", "register");
            registerMsg.put("deviceId", deviceId);
            registerMsg.put("clientId", CLIENT_ID);
            registerMsg.put("timestamp", System.currentTimeMillis());
            
            JSONObject data = new JSONObject();
            data.put("deviceId", deviceId);
            data.put("name", "安卓屏幕终端_" + deviceId);
            data.put("type", "android_screen");
            data.put("location", new JSONObject()
                .put("name", "测试位置")
                .put("address", "测试地址"));
            
            registerMsg.put("data", data);
            
            // 发布到正确主题
            mqttClient.publish("device/register", 
                new MqttMessage(registerMsg.toString().getBytes()));
                
        } catch (Exception e) {
            Log.e("MQTT", "注册失败: " + e.getMessage());
        }
    }
});
```

#### 4. 快速验证工具
运行测试脚本验证服务器功能：
```bash
# 运行设备模拟器
node test-android-stable.js

# 查询设备列表
# PowerShell命令查看已注册设备
```

### 📋 完整调试清单
- [ ] MQTT服务器地址使用实际IP（非localhost）
- [ ] 在MQTT连接成功回调中发送注册消息
- [ ] 注册消息包含所有必填字段（type, deviceId, clientId等）
- [ ] 发布到正确主题`device/register`
- [ ] 订阅确认主题`device/{clientId}/register_confirm`
- [ ] 添加错误处理和连接状态监控
- [ ] 检查网络连通性和防火墙设置

### 🔍 详细调试指南
参考 `ANDROID_MQTT_DEBUG_GUIDE.md` 获取完整的故障排除步骤和代码示例。

## 🧪 快速验证

### 1. 服务器状态检查
```bash
# 检查服务是否运行
netstat -an | findstr ":1883"  # MQTT服务器
netstat -an | findstr ":5001"  # API服务器

# 检查健康状态
curl http://localhost:5001/health
```

### 2. 设备注册测试
```bash
# 运行模拟器测试
node test-android-stable.js
```

### 3. API验证设备列表
```powershell
# 登录并查询设备
$response = Invoke-RestMethod -Uri "http://localhost:5001/api/auth/login" -Method POST -Body (@{email="admin@example.com"; password="123456"} | ConvertTo-Json) -ContentType "application/json"
$headers = @{Authorization="Bearer $($response.data.token)"}
$devices = Invoke-RestMethod -Uri "http://localhost:5001/api/mqtt/devices" -Method GET -Headers $headers
$devices | Format-Table deviceId, name, connectionStatus
```
