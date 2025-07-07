# 登录问题故障排除指南

## 🔍 问题诊断

如果遇到"登录失败，请检查邮箱和密码"错误，请按以下步骤排查：

### 1. 检查服务状态

#### 检查后端服务
```bash
curl http://localhost:5001/api/health
```
应该返回：`{"status":"OK","timestamp":"...","uptime":...}`

#### 检查前端服务
访问：http://localhost:3001
应该能看到登录界面

### 2. 验证管理员账号

如果账号有问题，重新创建管理员账号：

```bash
cd server
node initAdmin.js
```

应该看到：
```
✅ Admin user created successfully!
📧 Email: admin@example.com
🔑 Password: 123456
✅ User verification successful
✅ Password verification: PASSED
```

### 3. 测试API连接

在PowerShell中测试登录API：

```powershell
$body = @{
    email = "admin@example.com"
    password = "123456"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5001/api/auth/login" -Method POST -ContentType "application/json" -Body $body

Write-Output $response
```

成功的响应应该包含：
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "...",
    "user": {
      "id": "...",
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

### 4. 常见问题解决

#### 问题A: 端口冲突
**现象**: 无法连接到API
**解决**: 
1. 检查端口占用：`netstat -ano | findstr :5001`
2. 如有冲突，修改 `server/.env` 中的 `PORT` 值

#### 问题B: CORS错误
**现象**: 浏览器控制台显示跨域错误
**解决**:
1. 确认前端代理配置：`client/package.json` 中的 `"proxy": "http://localhost:5001"`
2. 或在 `client/.env` 中设置：`REACT_APP_API_BASE_URL=http://localhost:5001`

#### 问题C: MongoDB连接失败
**现象**: 后端启动时显示数据库连接错误
**解决**:
1. 检查MongoDB服务是否运行
2. 验证 `server/.env` 中的 `MONGODB_URI` 配置

#### 问题D: 密码哈希问题
**现象**: API测试正常但前端登录失败
**解决**:
1. 重新创建管理员账号（运行 `node initAdmin.js`）
2. 清除浏览器缓存和LocalStorage

### 5. 完整重置步骤

如果以上方法都不行，执行完整重置：

```bash
# 1. 停止所有服务 (Ctrl+C)

# 2. 重新创建管理员账号
cd server
node initAdmin.js

# 3. 清除前端缓存
cd ../client
rm -rf node_modules/.cache
# 或在Windows: rmdir /s node_modules\.cache

# 4. 重新启动服务
cd ../server
npm run dev

# 5. 在新终端启动前端
cd ../client
$env:PORT="3001"
npm start
```

### 6. 验证步骤

1. ✅ 后端健康检查：http://localhost:5001/api/health
2. ✅ 前端界面访问：http://localhost:3001
3. ✅ 登录测试：admin@example.com / 123456
4. ✅ 查看浏览器控制台无错误信息

### 7. 获取帮助

如果问题依然存在，请提供：

1. **后端控制台完整输出**
2. **前端浏览器控制台错误信息**
3. **Network面板中的请求响应详情**
4. **操作系统和浏览器版本**

## 📞 技术支持

- 查看项目文档：`docs/` 目录
- 参考故障排除：`TROUBLESHOOTING.md`
- 检查已知问题：项目Issues

---

**记住**: 默认管理员账号
- 📧 **邮箱**: admin@example.com
- 🔑 **密码**: 123456
