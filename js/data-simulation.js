// Data simulation engine for MDdata

// Mock API with simulated financial data
const mockAPI = {
    // Stock symbols and names
    stocks: [
        { symbol: "AAPL", name: "Apple Inc." },
        { symbol: "GOOGL", name: "Alphabet Inc." },
        { symbol: "MSFT", name: "Microsoft Corp." },
        { symbol: "AMZN", name: "Amazon.com Inc." },
        { symbol: "TSLA", name: "Tesla Inc." },
        { symbol: "META", name: "Meta Platforms Inc." }
    ],
    
    // Forex pairs
    forexPairs: [
        "EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "USD/CAD"
    ],
    
    // Cryptocurrencies
    cryptocurrencies: [
        "BTC/USD", "ETH/USD", "BNB/USD", "XRP/USD", "ADA/USD", "DOGE/USD"
    ],
    
    // Generate random price with base value
    generateRandomPrice: function(basePrice, decimals = 2) {
        const fluctuation = (Math.random() - 0.5) * basePrice * 0.02;
        return parseFloat((basePrice + fluctuation).toFixed(decimals));
    },
    
    // Generate random change value
    generateRandomChange: function() {
        return (Math.random() - 0.5) * 5;
    },
    
    // Generate random change percentage
    generateRandomChangePercent: function() {
        return (Math.random() - 0.5) * 5;
    },
    
    // Generate random volume
    generateRandomVolume: function() {
        return Math.floor(Math.random() * 10000000);
    },
    
    // Get simulated stock quotes
    getStockQuotes: function() {
        return this.stocks.map(stock => {
            const basePrice = stock.symbol === "BTC" ? 30000 : 
                             stock.symbol === "ETH" ? 2000 : 
                             stock.symbol === "TSLA" ? 250 : 150;
            const price = this.generateRandomPrice(basePrice);
            const change = this.generateRandomChange();
            const changePercent = (change / (price - change)) * 100;
            
            return {
                symbol: stock.symbol,
                name: stock.name,
                price: price,
                change: parseFloat(change.toFixed(2)),
                changePercent: parseFloat(changePercent.toFixed(2)),
                volume: this.generateRandomVolume(),
                high: this.generateRandomPrice(price * 1.02),
                low: this.generateRandomPrice(price * 0.98),
                open: this.generateRandomPrice(price * 0.995),
                prevClose: this.generateRandomPrice(price * 0.998),
                timestamp: new Date().toISOString()
            };
        });
    },
    
    // Get simulated forex quotes
    getForexQuotes: function() {
        return this.forexPairs.map(pair => {
            const basePrice = pair.includes('JPY') ? 110 : 
                             pair.includes('CHF') ? 0.9 : 1.2;
            const price = this.generateRandomPrice(basePrice, 4);
            const change = this.generateRandomChange() / 1000;
            
            return {
                symbol: pair,
                name: this.getForexName(pair),
                price: price,
                change: parseFloat(change.toFixed(4)),
                changePercent: parseFloat(((change / price) * 100).toFixed(2)),
                bid: this.generateRandomPrice(price - 0.0001, 4),
                ask: this.generateRandomPrice(price + 0.0001, 4),
                high: this.generateRandomPrice(price * 1.001, 4),
                low: this.generateRandomPrice(price * 0.999, 4),
                timestamp: new Date().toISOString()
            };
        });
    },
    
    // Get simulated crypto quotes
    getCryptoQuotes: function() {
        return this.cryptocurrencies.map(crypto => {
            const basePrice = crypto.includes('BTC') ? 30000 : 
                             crypto.includes('ETH') ? 2000 : 
                             crypto.includes('BNB') ? 300 : 1;
            const price = this.generateRandomPrice(basePrice, 2);
            const changePercent = this.generateRandomChangePercent();
            const change = (price * changePercent) / 100;
            
            return {
                symbol: crypto,
                name: this.getCryptoName(crypto),
                price: price,
                change: parseFloat(change.toFixed(2)),
                changePercent: parseFloat(changePercent.toFixed(2)),
                volume: this.generateRandomVolume() * 10,
                marketCap: this.generateRandomVolume() * 1000,
                high: this.generateRandomPrice(price * 1.02),
                low: this.generateRandomPrice(price * 0.98),
                timestamp: new Date().toISOString()
            };
        });
    },
    
    // Helper function to get forex pair names
    getForexName: function(pair) {
        const names = {
            "EUR/USD": "Euro to US Dollar",
            "GBP/USD": "British Pound to US Dollar",
            "USD/JPY": "US Dollar to Japanese Yen",
            "USD/CHF": "US Dollar to Swiss Franc",
            "AUD/USD": "Australian Dollar to US Dollar",
            "USD/CAD": "US Dollar to Canadian Dollar"
        };
        return names[pair] || pair;
    },
    
    // Helper function to get cryptocurrency names
    getCryptoName: function(symbol) {
        const names = {
            "BTC/USD": "Bitcoin",
            "ETH/USD": "Ethereum",
            "BNB/USD": "Binance Coin",
            "XRP/USD": "Ripple",
            "ADA/USD": "Cardano",
            "DOGE/USD": "Dogecoin"
        };
        return names[symbol] || symbol;
    }
};

// Mock WebSocket for real-time updates
class MockWebSocket {
    constructor(url) {
        this.url = url;
        this.onmessage = null;
        this.onopen = null;
        this.onclose = null;
        this.onerror = null;
        this.connected = false;
        
        // Simulate connection establishment
        setTimeout(() => {
            this.connected = true;
            if (this.onopen) this.onopen();
            
            // Simulate real-time data push
            this.simulateDataPush();
        }, 1000);
    }
    
    simulateDataPush() {
        if (!this.connected) return;
        
        // Push data every 2 seconds
        setInterval(() => {
            const mockData = {
                type: 'price_update',
                symbol: this.getRandomSymbol(),
                price: this.getRandomPrice(),
                timestamp: Date.now()
            };
            
            if (this.onmessage) {
                this.onmessage({ data: JSON.stringify(mockData) });
            }
        }, 2000);
    }
    
    getRandomSymbol() {
        const allSymbols = [
            ...mockAPI.stocks.map(s => s.symbol),
            ...mockAPI.forexPairs,
            ...mockAPI.cryptocurrencies
        ];
        return allSymbols[Math.floor(Math.random() * allSymbols.length)];
    }
    
    getRandomPrice() {
        return (Math.random() * 1000).toFixed(2);
    }
    
    send(data) {
        console.log('Mock sending:', data);
    }
    
    close() {
        this.connected = false;
        if (this.onclose) this.onclose();
    }
}

// Export for use in other files
window.mockAPI = mockAPI;
window.MockWebSocket = MockWebSocket;