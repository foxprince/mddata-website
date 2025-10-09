# Finnhub API Key 配置指南

## 🔴 问题：HTTP 401 Unauthorized

如果你看到以下错误：
```
GET https://finnhub.io/api/v1/quote?symbol=AAPL&token=demo 401 (Unauthorized)
获取股票数据失败，使用模拟数据
```

这表示 Finnhub 的 `demo` API key 已失效或超过限制。

## ✅ 解决方案

### 方案 1：注册免费 Finnhub API Key（推荐）

#### 步骤 1：注册账号

1. 访问 Finnhub 注册页面：https://finnhub.io/register
2. 填写信息：
   - Email（邮箱）
   - Password（密码）
3. 点击 "Sign Up"
4. 验证邮箱（检查收件箱）

#### 步骤 2：获取 API Key

1. 登录 Finnhub：https://finnhub.io/login
2. 进入 Dashboard：https://finnhub.io/dashboard
3. 复制你的 API Key（类似：`c123abc456def789`）

#### 步骤 3：配置 API Key

编辑 `/js/ui-update.js` 文件：

**修改前：**
```javascript
dataFetcher = new RealDataFetcher({
    finnhubApiKey: 'demo', // ⚠️ demo key 已失效
    useFallback: true
});
```

**修改后：**
```javascript
dataFetcher = new RealDataFetcher({
    finnhubApiKey: 'c123abc456def789', // ✅ 替换为你的真实 API key
    useFallback: true
});
```

#### 步骤 4：刷新页面

保存文件后，刷新浏览器页面（Ctrl+R 或 Cmd+R）。

#### 步骤 5：验证成功

打开控制台（F12），应该看到：
```
🚀 使用真实市场数据
✅ 成功获取 6 个股票数据
✅ 成功获取 6 个外汇数据
```

### 方案 2：使用模拟数据（临时方案）

如果你暂时不想注册 API key，可以切换到模拟数据模式：

编辑 `/js/ui-update.js`：

```javascript
let useRealData = false; // 改为 false
```

刷新页面后，系统会使用模拟数据，完全离线运行。

## 📊 Finnhub 免费版限制

| 项目 | 限制 |
|-----|------|
| 请求频率 | 60 次/分钟 |
| 每日请求 | 无限制 |
| 数据延迟 | 实时（15 分钟延迟） |
| 支持市场 | 美股、外汇、加密货币 |
| 价格 | 完全免费 |

**建议**：每 10-15 秒更新一次数据，避免超过限制。

## 🔐 API Key 安全

### ⚠️ 重要提示

1. **不要在公开代码中硬编码 API key**
2. **Finnhub 免费 API key 可以公开使用**（有限制）
3. **生产环境建议使用后端代理**

### 生产环境最佳实践

```
前端 → 你的后端服务 → Finnhub API
        (隐藏 API key)
```

后端代码示例（Node.js）：
```javascript
// server.js
const express = require('express');
const fetch = require('node-fetch');

const app = express();
const FINNHUB_KEY = process.env.FINNHUB_API_KEY; // 从环境变量读取

app.get('/api/stock/:symbol', async (req, res) => {
    const { symbol } = req.params;
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
});

app.listen(3000);
```

前端调用：
```javascript
// 调用自己的后端，而不是直接调用 Finnhub
const response = await fetch('/api/stock/AAPL');
const data = await response.json();
```

## 🆓 其他免费数据源

如果 Finnhub 不可用，可以考虑以下替代方案：

### 1. Alpha Vantage
- 网址：https://www.alphavantage.co/
- 免费额度：5 次/分钟，500 次/天
- 支持：股票、外汇、加密货币

### 2. Twelve Data
- 网址：https://twelvedata.com/
- 免费额度：800 次/天
- 支持：股票、外汇、加密货币

### 3. Binance（仅加密货币）
- 网址：https://www.binance.com/en/binance-api
- 免费额度：无限制（公开数据）
- 支持：加密货币
- **优势**：无需 API key，WebSocket 实时推送

## 🧪 测试 API Key

### 方法 1：浏览器测试

在浏览器中访问：
```
https://finnhub.io/api/v1/quote?symbol=AAPL&token=YOUR_API_KEY
```

如果返回 JSON 数据，说明 API key 有效：
```json
{
  "c": 178.72,
  "h": 179.23,
  "l": 177.45,
  "o": 178.12,
  "pc": 177.89,
  "t": 1234567890
}
```

如果返回错误，说明 API key 无效：
```json
{
  "error": "You don't have access to this resource."
}
```

### 方法 2：控制台测试

在浏览器控制台运行：
```javascript
fetch('https://finnhub.io/api/v1/quote?symbol=AAPL&token=YOUR_API_KEY')
    .then(r => r.json())
    .then(d => console.log('✅ API Key 有效:', d))
    .catch(e => console.log('❌ API Key 无效:', e));
```

## 📝 配置文件示例

创建一个配置文件 `config.js`（不要提交到 Git）：

```javascript
// config.js
const config = {
    finnhubApiKey: 'YOUR_REAL_API_KEY_HERE',
    alphaVantageApiKey: 'YOUR_ALPHA_VANTAGE_KEY',
    updateInterval: 10000, // 10 秒
    useFallback: true
};

window.appConfig = config;
```

在 `ui-update.js` 中使用：
```javascript
dataFetcher = new RealDataFetcher({
    finnhubApiKey: window.appConfig?.finnhubApiKey || 'demo',
    useFallback: true
});
```

添加到 `.gitignore`：
```
config.js
```

## 🎯 快速解决当前问题

### 立即可用的方案

**选项 A：注册 API Key（5 分钟）**
1. 访问 https://finnhub.io/register
2. 注册并获取 API key
3. 替换 `/js/ui-update.js` 中的 `finnhubApiKey`
4. 刷新页面

**选项 B：使用模拟数据（1 分钟）**
1. 编辑 `/js/ui-update.js`
2. 将 `useRealData` 改为 `false`
3. 刷新页面

**选项 C：只使用加密货币数据（无需 API key）**
- Binance API 不需要 API key
- 加密货币数据仍然是真实的
- 股票和外汇会使用模拟数据

## ❓ 常见问题

### Q: demo API key 为什么失效？
A: Finnhub 的 demo key 是共享的，可能被太多人使用导致超过限制。

### Q: 免费 API key 够用吗？
A: 对于个人项目和学习，60 次/分钟完全够用。

### Q: 如何避免超过限制？
A: 
- 设置更新间隔为 10-15 秒
- 减少监控的股票数量
- 使用缓存机制

### Q: 可以多个项目共用一个 API key 吗？
A: 可以，但要注意总请求次数不要超过限制。

## 📞 需要帮助？

如果遇到问题：
1. 检查 API key 是否正确复制（无空格）
2. 确认 API key 在 Finnhub Dashboard 中是激活状态
3. 查看浏览器控制台的详细错误信息
4. 尝试在浏览器中直接访问 API URL 测试

---

**总结**：
- ✅ 注册免费 Finnhub API key（推荐）
- ✅ 或切换到模拟数据模式（临时）
- ✅ 加密货币数据无需 API key，始终可用

**现在就去注册吧！** 🚀 https://finnhub.io/register
