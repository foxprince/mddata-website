// UI update functions for MDdata

// 全局数据获取器实例
let dataFetcher = null;
let useRealData = true; // 设置为 true 使用真实数据，false 使用模拟数据
// ⚠️ 如果 Finnhub API key 失效，可以改为 false 使用模拟数据

// Initialize the simulation
function initializeSimulation() {
    // 初始化数据获取器
    if (useRealData && window.RealDataFetcher) {
        console.log('🚀 使用真实市场数据');
        dataFetcher = new RealDataFetcher({
            finnhubApiKey: 'd3jlhlpr01qkv9k07tb0d3jlhlpr01qkv9k07tbg', // ⚠️ 替换为你的 Finnhub API key (https://finnhub.io/register)
            useFallback: true // 失败时使用模拟数据
        });
        
        console.log('💡 提示：demo API key 可能已失效');
        console.log('📝 请访问 https://finnhub.io/register 注册免费 API key');
        console.log('🔑 然后在 /js/ui-update.js 中替换 finnhubApiKey');
        
        // 启动加密货币 WebSocket 实时推送
        dataFetcher.startCryptoWebSocket((update) => {
            console.log('📊 实时更新:', update.symbol, update.price);
            updateSingleCryptoDisplay(update);
        });
    } else {
        console.log('🎭 使用模拟数据');
        dataFetcher = window.mockAPI;
    }
    
    // Initial data load
    updateAllData();
    
    // Set up periodic updates (每10秒更新一次，避免超过API限制)
    setInterval(updateAllData, 10000);
}

// Update all data on the page
async function updateAllData() {
    try {
        // 使用真实数据时，需要异步获取
        if (useRealData && dataFetcher.getStockQuotes) {
            await Promise.all([
                updateStockData(),
                updateForexData(),
                updateCryptoData(),
                updateMarketSnapshot() // Update index page market snapshot
            ]);
        } else {
            // 模拟数据是同步的
            updateStockData();
            updateForexData();
            updateCryptoData();
            updateMarketSnapshot();
        }
        
        // Add animation effect to indicate data refresh
        const container = document.querySelector('.py-12');
        if (container) {
            container.classList.add('bg-blue-50');
            setTimeout(() => {
                container.classList.remove('bg-blue-50');
            }, 300);
        }
    } catch (error) {
        console.error('更新数据失败:', error);
    }
}

// Update stock data
async function updateStockData() {
    const container = document.getElementById('stock-container');
    if (!container) return;
    
    try {
        // 获取股票数据（支持异步）
        let stockData;
        if (useRealData && dataFetcher.getStockQuotes) {
            stockData = await dataFetcher.getStockQuotes();
        } else {
            stockData = mockAPI.getStockQuotes();
        }
        
        if (!stockData || stockData.length === 0) return;
        
        // Clear existing content
        container.innerHTML = '';
        
        // Add updated stock cards
        stockData.forEach(stock => {
            const changeClass = stock.change >= 0 ? 'text-green-500' : 'text-red-500';
            const changeIcon = stock.change >= 0 ? '▲' : '▼';
            
            const card = document.createElement('div');
            card.className = 'bg-white border border-blue-100 rounded-2xl shadow-sm overflow-hidden stock-card transition-all duration-300 hover:shadow-lg';
            card.innerHTML = `
                <div class="p-6 space-y-4">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900">${stock.symbol}</h3>
                            <p class="text-sm text-gray-500">${stock.name}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-2xl font-bold text-gray-900">$${stock.price.toFixed(2)}</p>
                            <p class="${changeClass} text-sm">
                                ${changeIcon} ${Math.abs(stock.change).toFixed(2)} (${Math.abs(stock.changePercent).toFixed(2)}%)
                            </p>
                        </div>
                    </div>
                    <div class="mt-4">
                        <canvas id="chart-${stock.symbol}" height="60"></canvas>
                    </div>
                    <div class="grid grid-cols-2 gap-3 text-sm text-gray-500">
                        <div>High: <span class="font-semibold text-gray-900">$${stock.high.toFixed(2)}</span></div>
                        <div>Low: <span class="font-semibold text-gray-900">$${stock.low.toFixed(2)}</span></div>
                        <div>Open: <span class="font-semibold text-gray-900">$${stock.open.toFixed(2)}</span></div>
                        <div>Volume: <span class="font-semibold text-gray-900">${formatNumber(stock.volume)}</span></div>
                    </div>
                </div>
            `;
            
            container.appendChild(card);
            
            // Create mini chart for the stock
            createMiniChart(`chart-${stock.symbol}`, stock);
        });
    } catch (error) {
        console.error('更新股票数据失败:', error);
    }
}

// Update forex data
async function updateForexData() {
    const container = document.getElementById('forex-container');
    if (!container) return;
    
    try {
        // 获取外汇数据（支持异步）
        let forexData;
        if (useRealData && dataFetcher.getForexQuotes) {
            forexData = await dataFetcher.getForexQuotes();
        } else {
            forexData = mockAPI.getForexQuotes();
        }
        
        if (!forexData || forexData.length === 0) return;
        
        // Clear existing content
        container.innerHTML = '';
        
        // Add updated forex rows
        forexData.forEach(forex => {
            const changeClass = forex.change >= 0 ? 'text-green-500' : 'text-red-500';
            const changeIcon = forex.change >= 0 ? '▲' : '▼';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">${forex.symbol}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${forex.price.toFixed(4)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm ${changeClass}">
                    ${changeIcon} ${Math.abs(forex.change).toFixed(4)} (${Math.abs(forex.changePercent).toFixed(2)}%)
                </td>
            `;
            
            container.appendChild(row);
        });
    } catch (error) {
        console.error('更新外汇数据失败:', error);
    }
}

// Update cryptocurrency data
async function updateCryptoData() {
    const container = document.getElementById('crypto-container');
    if (!container) return;
    
    try {
        // 获取加密货币数据（支持异步）
        let cryptoData;
        if (useRealData && dataFetcher.getCryptoQuotes) {
            cryptoData = await dataFetcher.getCryptoQuotes();
        } else {
            cryptoData = mockAPI.getCryptoQuotes();
        }
        
        if (!cryptoData || cryptoData.length === 0) return;
        
        // Clear existing content
        container.innerHTML = '';
        
        // Add updated crypto rows
        cryptoData.forEach(crypto => {
            const changeClass = crypto.changePercent >= 0 ? 'text-green-500' : 'text-red-500';
            const changeIcon = crypto.changePercent >= 0 ? '▲' : '▼';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">${crypto.symbol}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">$${crypto.price.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm ${changeClass}">
                    ${changeIcon} ${Math.abs(crypto.changePercent).toFixed(2)}%
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">$${formatNumber(crypto.volume)}</td>
            `;
            
            container.appendChild(row);
        });
    } catch (error) {
        console.error('更新加密货币数据失败:', error);
    }
}

// 更新单个加密货币显示（WebSocket 实时推送）
function updateSingleCryptoDisplay(update) {
    const container = document.getElementById('crypto-container');
    if (!container) return;
    
    // 查找对应的行并更新
    const rows = container.querySelectorAll('tr');
    rows.forEach(row => {
        const symbolCell = row.querySelector('td:first-child');
        if (symbolCell && symbolCell.textContent === update.symbol) {
            const changeClass = update.changePercent >= 0 ? 'text-green-500' : 'text-red-500';
            const changeIcon = update.changePercent >= 0 ? '▲' : '▼';
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">${update.symbol}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">$${update.price.toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm ${changeClass}">
                    ${changeIcon} ${Math.abs(update.changePercent).toFixed(2)}%
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">$${formatNumber(update.volume || 0)}</td>
            `;
            
            // 添加闪烁效果
            row.classList.add('bg-blue-50');
            setTimeout(() => row.classList.remove('bg-blue-50'), 500);
        }
    });
}

// Create mini chart for a stock
function createMiniChart(canvasId, stockData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Generate sample data points for the chart
    const dataPoints = [];
    let currentValue = stockData.price;
    
    for (let i = 0; i < 20; i++) {
        // Simulate small fluctuations
        const change = (Math.random() - 0.5) * currentValue * 0.01;
        currentValue += change;
        dataPoints.push(currentValue);
    }
    
    // Draw the chart
    const width = canvas.width;
    const height = canvas.height;
    const padding = 2;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw chart line
    ctx.beginPath();
    ctx.lineWidth = 2;
    
    // Determine color based on overall trend
    const firstValue = dataPoints[0];
    const lastValue = dataPoints[dataPoints.length - 1];
    ctx.strokeStyle = lastValue >= firstValue ? '#22c55e' : '#ef4444';
    
    // Calculate min and max values for scaling
    const minValue = Math.min(...dataPoints);
    const maxValue = Math.max(...dataPoints);
    const valueRange = maxValue - minValue || 1; // Avoid division by zero
    
    // Draw the line
    dataPoints.forEach((value, index) => {
        const x = padding + (index / (dataPoints.length - 1)) * (width - padding * 2);
        const y = padding + (1 - (value - minValue) / valueRange) * (height - padding * 2);
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
}

// Format large numbers for display
function formatNumber(num) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Update market snapshot on index page
async function updateMarketSnapshot() {
    const container = document.getElementById('market-snapshot-container');
    if (!container) return; // Not on index page
    
    try {
        let stockData;
        if (useRealData && dataFetcher.getStockQuotes) {
            stockData = await dataFetcher.getStockQuotes();
        } else {
            stockData = mockAPI.getStockQuotes();
        }
        
        if (!stockData || stockData.length === 0) return;
        
        // Clear and show first 4 stocks
        container.innerHTML = '';
        stockData.slice(0, 4).forEach(stock => {
            const changeClass = stock.changePercent >= 0 ? 'text-green-600' : 'text-red-500';
            const changeIcon = stock.changePercent >= 0 ? '+' : '';
            
            const card = document.createElement('div');
            card.className = 'rounded-2xl border border-gray-100 bg-blue-50 px-4 py-5 transition-all duration-300';
            card.innerHTML = `
                <p class="text-sm font-medium text-blue-600">${stock.symbol}</p>
                <p class="mt-2 text-2xl font-semibold text-gray-900">$${stock.price.toFixed(2)}</p>
                <p class="mt-1 text-sm font-semibold ${changeClass}">${changeIcon}${stock.changePercent.toFixed(2)}%</p>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('更新 Market Snapshot 失败:', error);
    }
}

// Export for use in other files
window.initializeSimulation = initializeSimulation;
window.updateMarketSnapshot = updateMarketSnapshot;