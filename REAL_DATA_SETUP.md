# 真实市场数据配置指南

## 📊 功能概述

MDdata 网站现已支持**真实市场数据抓取**，可以从以下数据源获取实时金融数据：

- **股票数据**：通过 Finnhub API 获取美股实时报价
- **外汇数据**：通过 Finnhub API 获取外汇对实时汇率
- **加密货币数据**：通过 Binance 公开 API 和 WebSocket 获取实时加密货币价格

## 🚀 快速开始

### 方案 1：使用演示模式（无需配置）

默认情况下，系统使用 Finnhub 的 `demo` API key 和 Binance 公开接口，可以直接使用：

1. 打开 `index.html`
2. 系统会自动尝试获取真实数据
3. 如果 API 限制或失败，会自动降级到模拟数据

### 方案 2：使用免费 API Key（推荐）

为了获得更好的体验和更高的 API 调用限制，建议注册免费 API key：

#### 1. 注册 Finnhub API Key

1. 访问 [Finnhub.io](https://finnhub.io/)
2. 点击 "Get free API key" 注册账号
3. 登录后在 Dashboard 获取你的 API key
4. 免费额度：**60 次/分钟**

#### 2. 配置 API Key

编辑 `/js/ui-update.js` 文件，找到以下代码：

```javascript
dataFetcher = new RealDataFetcher({
    finnhubApiKey: 'demo', // 替换为你的 Finnhub API key
    useFallback: true
});
```

将 `'demo'` 替换为你的实际 API key：

```javascript
dataFetcher = new RealDataFetcher({
    finnhubApiKey: 'your_actual_api_key_here',
    useFallback: true
});
```

## ⚙️ 配置选项

### 切换数据源

在 `/js/ui-update.js` 中修改 `useRealData` 变量：

```javascript
let useRealData = true;  // true = 真实数据，false = 模拟数据
```

### 调整更新频率

默认每 10 秒更新一次数据（避免超过 API 限制）：

```javascript
setInterval(updateAllData, 10000); // 10000ms = 10秒
```

可以根据你的 API 配额调整：
- 免费版 Finnhub：建议 10-15 秒
- 付费版：可以缩短到 5 秒或更短

### 配置参数说明

```javascript
new RealDataFetcher({
    // Finnhub API key
    finnhubApiKey: 'your_key',
    
    // 是否在失败时使用模拟数据作为后备
    useFallback: true,
    
    // 缓存时间（毫秒），避免重复请求
    cacheTime: 5000
})
```

## 📡 数据源说明

### 1. 股票数据（Finnhub）

- **数据源**：Finnhub Stock API
- **支持市场**：美股（AAPL, GOOGL, MSFT, AMZN, TSLA, META）
- **更新方式**：REST API 轮询
- **数据字段**：当前价、涨跌额、涨跌幅、最高价、最低价、开盘价

### 2. 外汇数据（Finnhub）

- **数据源**：Finnhub Forex API
- **支持货币对**：EUR/USD, GBP/USD, USD/JPY, USD/CHF, AUD/USD, USD/CAD
- **更新方式**：REST API 轮询
- **数据字段**：汇率、涨跌额、涨跌幅、买价、卖价

### 3. 加密货币数据（Binance）

- **数据源**：Binance 公开 API
- **支持币种**：BTC, ETH, BNB, XRP, ADA, DOGE（对 USDT）
- **更新方式**：
  - 初始加载：REST API
  - 实时推送：WebSocket（真正的实时更新！）
- **数据字段**：价格、24h 涨跌、成交量、最高价、最低价

## 🔥 WebSocket 实时推送

加密货币数据使用 Binance WebSocket 实现**真正的实时推送**：

- ✅ 无需轮询，数据变化时自动推送
- ✅ 延迟极低（毫秒级）
- ✅ 无需 API key，完全免费
- ✅ 自动重连机制

当加密货币价格变化时，页面会：
1. 实时更新价格
2. 显示闪烁动画效果
3. 在控制台输出更新日志

## 🛠️ 自定义数据源

### 添加更多股票

编辑 `/js/real-data-fetcher.js`：

```javascript
this.stockSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD'];
```

### 添加更多加密货币

编辑 `/js/real-data-fetcher.js`：

```javascript
this.cryptoSymbols = [
    { symbol: 'BTC/USDT', binanceSymbol: 'btcusdt', name: 'Bitcoin' },
    { symbol: 'ETH/USDT', binanceSymbol: 'ethusdt', name: 'Ethereum' },
    { symbol: 'SOL/USDT', binanceSymbol: 'solusdt', name: 'Solana' },
    // 添加更多...
];
```

## 📊 API 限制说明

### Finnhub 免费版

- **请求限制**：60 次/分钟
- **建议策略**：
  - 每 10 秒更新一次
  - 6 个股票 + 6 个外汇对 = 12 个请求
  - 每分钟约 72 次请求（可能超限）
  - 建议减少监控的股票/外汇对数量

### Binance 公开 API

- **REST API**：无需认证，有 IP 限制（约 1200 次/分钟）
- **WebSocket**：无限制，推荐使用

## 🐛 故障排查

### 问题 1：控制台显示 "使用模拟数据"

**原因**：
- `useRealData` 设置为 `false`
- `RealDataFetcher` 类未正确加载

**解决**：
1. 检查 `ui-update.js` 中 `useRealData = true`
2. 确认 `real-data-fetcher.js` 已正确引入
3. 打开浏览器控制台查看错误信息

### 问题 2：数据无法更新

**原因**：
- API key 无效或超过限制
- 网络连接问题
- CORS 跨域限制

**解决**：
1. 检查 API key 是否正确
2. 打开浏览器控制台查看网络请求
3. 确认没有被防火墙拦截

### 问题 3：WebSocket 连接失败

**原因**：
- 网络环境限制 WebSocket
- Binance 服务不可用
- 防火墙阻止 WebSocket 连接

**解决**：
1. 检查控制台 WebSocket 错误信息
2. 确认 URL 格式正确：`wss://stream.binance.com:9443/stream?streams=...`
3. 尝试在浏览器中访问 https://www.binance.com 确认网络可达
4. 系统会自动降级到 REST API

## 🔐 安全建议

### ⚠️ 重要提示

1. **不要在前端代码中硬编码付费 API key**
2. **Finnhub 免费 API key 可以公开使用**（有限制）
3. **生产环境建议使用后端代理**

### 生产环境最佳实践

```
前端 ──> 后端 API ──> Finnhub/其他数据源
         (隐藏 API key)
```

## 📈 性能优化

### 1. 缓存机制

系统内置 5 秒缓存，避免重复请求：

```javascript
cacheTime: 5000 // 5秒内使用缓存数据
```

### 2. 错误降级

API 失败时自动使用模拟数据：

```javascript
useFallback: true
```

### 3. 批量请求

使用 `Promise.all` 并行获取多个数据源。

## 🎯 下一步优化建议

1. **后端代理服务**
   - 使用 Node.js/Python 搭建代理
   - 隐藏 API key
   - 实现更复杂的缓存策略

2. **数据持久化**
   - 使用 IndexedDB 存储历史数据
   - 离线模式支持

3. **更多数据源**
   - Alpha Vantage（备用）
   - Yahoo Finance
   - CoinGecko（加密货币）

4. **高级功能**
   - K 线图表
   - 技术指标
   - 价格预警

## 📞 支持

如有问题，请查看：
- 浏览器控制台日志
- `/js/real-data-fetcher.js` 源码注释
- Finnhub API 文档：https://finnhub.io/docs/api
- Binance API 文档：https://binance-docs.github.io/apidocs/spot/en/

---

**享受真实市场数据带来的体验！** 🚀
