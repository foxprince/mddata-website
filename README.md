# MDdata - Financial Data Platform Website

A professional financial data platform website that provides advanced analytics and real-time market intelligence. This is a pure frontend implementation with no backend dependencies.

## Features

- ✅ **真实市场数据抓取**（新功能！）
  - 股票：通过 Finnhub API 获取美股实时报价
  - 外汇：通过 Finnhub API 获取外汇对实时汇率
  - 加密货币：通过 Binance WebSocket 实现毫秒级实时推送
- 📊 实时模拟金融数据（股票、外汇、加密货币）
- 📈 使用 Chart.js 的交互式图表
- 🔐 带邀请码验证的用户注册系统
- 📱 使用 Tailwind CSS 的响应式设计
- 🚀 纯静态 HTML/CSS/JavaScript 实现，无需后端

## Pages

1. **index.html** - Main dashboard showing market overview
2. **register.html** - User registration with invitation code
3. **login.html** - User login page
4. **detail.html** - Detailed view for individual financial instruments

## Technical Implementation

### 数据源模式

系统支持两种数据源模式：

#### 1. 真实数据模式（推荐）
- **股票数据**：Finnhub API（免费 60 次/分钟）
- **外汇数据**：Finnhub API
- **加密货币**：Binance 公开 API + WebSocket 实时推送
- **特点**：真实市场数据，WebSocket 实时更新，自动降级到模拟数据

#### 2. 模拟数据模式
- 所有数据通过 JavaScript 动态生成
- 无需 API 调用，完全离线运行
- 模拟真实的价格波动和市场走势

### 快速启用真实数据

1. 打开 `/js/ui-update.js`
2. 确认 `useRealData = true`（默认已启用）
3. （可选）注册免费 Finnhub API key 以获得更高限额

详细配置请查看：
- [REAL_DATA_SETUP.md](./REAL_DATA_SETUP.md) - 完整配置指南
- [API_KEY_SETUP.md](./API_KEY_SETUP.md) - Finnhub API Key 配置（必读！）
- [NETWORK_TROUBLESHOOTING.md](./NETWORK_TROUBLESHOOTING.md) - WebSocket 连接问题排查
- [DATA_DISPLAY_GUIDE.md](./DATA_DISPLAY_GUIDE.md) - 数据显示说明

### Valid Invitation Codes
- INVITE123
- WELCOME456
- STOCK789

### 使用的库和 API
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Chart.js](https://www.chartjs.org/) - 图表库
- [Font Awesome](https://fontawesome.com/) - 图标库
- [Finnhub API](https://finnhub.io/) - 股票和外汇数据（免费）
- [Binance API](https://binance-docs.github.io/apidocs/spot/en/) - 加密货币数据（免费）

## 如何运行

### 基础运行（使用模拟数据）

1. 克隆或下载仓库
2. 在浏览器中打开 `index.html`
3. 使用导航菜单在页面间切换

### 启用真实数据（推荐）

1. 在浏览器中打开 `index.html`
2. 打开浏览器控制台（F12）
3. 查看日志：
   - `🚀 使用真实市场数据` - 真实数据模式
   - `🎭 使用模拟数据` - 模拟数据模式
4. 加密货币会通过 WebSocket 实时更新（查看控制台 `📊 实时更新` 日志）

### 获取更高 API 限额（可选）

1. 访问 [Finnhub.io](https://finnhub.io/) 注册免费账号
2. 获取 API key（免费 60 次/分钟）
3. 编辑 `/js/ui-update.js`，替换 `finnhubApiKey: 'demo'`
4. 刷新页面即可

## 自定义配置

### 添加更多金融工具

#### 真实数据模式
编辑 `/js/real-data-fetcher.js`：

```javascript
// 添加股票
this.stockSymbols = ['AAPL', 'GOOGL', 'MSFT', 'NVDA', 'AMD'];

// 添加加密货币
this.cryptoSymbols = [
    { symbol: 'BTC/USDT', binanceSymbol: 'btcusdt', name: 'Bitcoin' },
    { symbol: 'SOL/USDT', binanceSymbol: 'solusdt', name: 'Solana' }
];
```

#### 模拟数据模式
编辑 `/js/data-simulation.js`：
- `stocks` - 添加股票代码和名称
- `forexPairs` - 添加外汇对
- `cryptocurrencies` - 添加加密货币

### 修改有效邀请码
编辑 `register.html` 中的 `validInviteCodes` 数组

### 切换数据源
编辑 `/js/ui-update.js`：
```javascript
let useRealData = true;  // true=真实数据, false=模拟数据
```

### 样式定制
- 所有样式使用 Tailwind CSS 类
- 可直接修改 HTML 添加自定义样式

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available under the MIT License.