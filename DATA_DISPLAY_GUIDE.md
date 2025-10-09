# 数据显示说明

## 📊 问题说明

### 为什么 index.html 没有显示实时数据？

**原因**：`index.html` 是**静态展示页面**，主要用于展示产品功能和介绍，页面上的数据是**静态示例数据**，不会动态更新。

虽然我们引入了真实数据获取模块，但 `index.html` 中没有对应的数据容器元素（`stock-container`, `forex-container`, `crypto-container`），所以数据无法显示。

## ✅ 解决方案

### 方案 1：使用专门的实时数据页面（推荐）

我创建了一个新的页面 **`live-data.html`**，专门用于显示实时市场数据。

#### 使用方法：
```bash
# 在浏览器中打开
open live-data.html
```

或者在主页导航栏点击 **"Live Data"** 链接。

#### 功能特点：
- ✅ 完整的数据显示容器
- ✅ 股票、外汇、加密货币实时数据
- ✅ 自动更新（每 10 秒）
- ✅ WebSocket 状态显示
- ✅ 最后更新时间
- ✅ 数据来源说明
- ✅ 美观的表格和卡片布局

### 方案 2：使用测试页面

```bash
open test-real-data.html
```

测试页面提供：
- ✅ 手动测试按钮
- ✅ 详细的日志输出
- ✅ WebSocket 连接测试
- ✅ 实时数据推送显示

## 📁 页面对比

| 页面 | 用途 | 数据类型 | 更新方式 |
|-----|------|---------|---------|
| `index.html` | 产品介绍和营销 | 静态示例数据 | 不更新 |
| `live-data.html` | 实时数据展示 | 真实市场数据 | 自动更新 |
| `test-real-data.html` | 开发测试 | 真实市场数据 | 手动测试 |

## 🔧 如何在 index.html 中添加实时数据

如果你想在主页显示实时数据，需要添加数据容器：

### 1. 添加股票数据容器

在 `index.html` 中找到合适的位置，添加：

```html
<div id="stock-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <!-- 股票卡片将动态插入这里 -->
</div>
```

### 2. 添加外汇数据容器

```html
<tbody id="forex-container" class="bg-white divide-y divide-gray-200">
    <!-- 外汇行将动态插入这里 -->
</tbody>
```

### 3. 添加加密货币数据容器

```html
<tbody id="crypto-container" class="bg-white divide-y divide-gray-200">
    <!-- 加密货币行将动态插入这里 -->
</tbody>
```

### 4. 确保脚本已引入

```html
<script src="js/data-simulation.js"></script>
<script src="js/real-data-fetcher.js"></script>
<script src="js/ui-update.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        initializeSimulation();
    });
</script>
```

## 🎯 推荐使用方式

### 开发/测试
使用 `test-real-data.html` 进行调试和测试。

### 数据展示
使用 `live-data.html` 展示实时市场数据。

### 产品介绍
使用 `index.html` 作为营销和介绍页面。

## 📊 REST API 说明

当你打开 `live-data.html` 时，系统会自动调用以下 REST API：

### 1. 股票数据
```javascript
// Finnhub API
https://finnhub.io/api/v1/quote?symbol=AAPL&token=YOUR_KEY
```

### 2. 外汇数据
```javascript
// Finnhub API
https://finnhub.io/api/v1/quote?symbol=OANDA:EUR_USD&token=YOUR_KEY
```

### 3. 加密货币数据
```javascript
// Binance REST API
https://api.binance.com/api/v3/ticker/24hr
```

打开浏览器的 **DevTools > Network** 标签，你可以看到这些 API 请求。

## 🔍 验证数据更新

### 1. 打开 live-data.html

### 2. 打开浏览器控制台（F12）

### 3. 查看日志
```
🚀 实时数据页面启动中...
🚀 使用真实市场数据
✅ 成功获取 6 个股票数据
✅ 成功获取 6 个外汇数据
✅ 成功获取 6 个加密货币数据
```

### 4. 查看网络请求
在 Network 标签中应该看到：
- `finnhub.io` 的请求（股票和外汇）
- `api.binance.com` 的请求（加密货币）

### 5. 观察页面更新
- 页面顶部显示 "实时更新中"
- 最后更新时间每 10 秒刷新
- 数据表格中的数字会更新

## 💡 常见问题

### Q: 为什么 index.html 没有数据？
A: `index.html` 是静态展示页面，请使用 `live-data.html` 查看实时数据。

### Q: 数据多久更新一次？
A: 
- WebSocket 连接成功：实时推送（毫秒级）
- WebSocket 失败：REST API 每 10 秒更新一次

### Q: 如何确认数据是真实的？
A: 
1. 打开控制台查看 API 请求
2. 对比其他金融网站的价格
3. 观察数据随时间变化

### Q: 可以自定义更新频率吗？
A: 可以，编辑 `/js/ui-update.js`：
```javascript
setInterval(updateAllData, 10000); // 改为你想要的毫秒数
```

## 🚀 快速开始

```bash
# 1. 打开实时数据页面
open live-data.html

# 2. 或在浏览器中访问
http://localhost/mddata-website/live-data.html

# 3. 查看控制台确认数据加载
# 按 F12 打开开发者工具
```

---

**总结**：
- ✅ `index.html` = 产品介绍页（静态数据）
- ✅ `live-data.html` = 实时数据页（动态更新）
- ✅ `test-real-data.html` = 测试页面（开发调试）

**现在请打开 `live-data.html` 查看真实的市场数据！** 🚀
