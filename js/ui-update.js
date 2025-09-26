// UI update functions for MDdata

// Initialize the simulation
function initializeSimulation() {
    // Initial data load
    updateAllData();
    
    // Set up periodic updates
    setInterval(updateAllData, 5000);
    
    // Set up WebSocket connection for real-time updates
    setupWebSocket();
}

// Update all data on the page
function updateAllData() {
    updateStockData();
    updateForexData();
    updateCryptoData();
    
    // Add animation effect to indicate data refresh
    const container = document.querySelector('.py-12');
    if (container) {
        container.classList.add('bg-blue-50');
        setTimeout(() => {
            container.classList.remove('bg-blue-50');
        }, 300);
    }
}

// Update stock data
function updateStockData() {
    const stockData = mockAPI.getStockQuotes();
    const container = document.getElementById('stock-container');
    
    if (!container) return;
    
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
}

// Update forex data
function updateForexData() {
    const forexData = mockAPI.getForexQuotes();
    const container = document.getElementById('forex-container');
    
    if (!container) return;
    
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
}

// Update cryptocurrency data
function updateCryptoData() {
    const cryptoData = mockAPI.getCryptoQuotes();
    const container = document.getElementById('crypto-container');
    
    if (!container) return;
    
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

// Set up WebSocket connection for real-time updates
function setupWebSocket() {
    // In a real implementation, this would connect to a WebSocket server
    // For simulation, we're using our mock WebSocket
    const ws = new MockWebSocket('ws://localhost:8080/quotes');
    
    ws.onmessage = function(event) {
        const data = JSON.parse(event.data);
        updatePriceDisplay(data.symbol, data.price);
    };
}

// Update price display for a specific symbol
function updatePriceDisplay(symbol, price) {
    // This would update the specific element showing the price for the symbol
    console.log(`Updating price for ${symbol} to ${price}`);
}

// Export for use in other files
window.initializeSimulation = initializeSimulation;