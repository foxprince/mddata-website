// 真实市场数据抓取模块
// 支持股票、外汇、加密货币的实时数据

class RealDataFetcher {
    constructor(config = {}) {
        // API 配置
        this.config = {
            // Finnhub API（免费额度：60次/分钟）
            finnhubApiKey: config.finnhubApiKey || 'demo', // 使用 demo 或注册免费 API key
            finnhubBaseUrl: 'https://finnhub.io/api/v1',
            
            // Binance 公开 WebSocket（无需 API key）
            binanceWsUrl: 'wss://stream.binance.com:9443/ws',
            
            // Alpha Vantage API（备用，免费额度：5次/分钟）
            alphaVantageApiKey: config.alphaVantageApiKey || 'demo',
            alphaVantageBaseUrl: 'https://www.alphavantage.co/query',
            
            // 缓存时间（毫秒）
            cacheTime: 5000,
            
            // 是否使用模拟数据作为后备
            useFallback: config.useFallback !== false
        };
        
        // 数据缓存
        this.cache = {
            stocks: { data: null, timestamp: 0 },
            forex: { data: null, timestamp: 0 },
            crypto: { data: null, timestamp: 0 }
        };
        
        // WebSocket 连接
        this.cryptoWs = null;
        this.cryptoData = new Map();
        
        // 股票列表
        this.stockSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META'];
        
        // 外汇对列表
        this.forexPairs = [
            { symbol: 'EUR/USD', finnhubSymbol: 'OANDA:EUR_USD' },
            { symbol: 'GBP/USD', finnhubSymbol: 'OANDA:GBP_USD' },
            { symbol: 'USD/JPY', finnhubSymbol: 'OANDA:USD_JPY' },
            { symbol: 'USD/CHF', finnhubSymbol: 'OANDA:USD_CHF' },
            { symbol: 'AUD/USD', finnhubSymbol: 'OANDA:AUD_USD' },
            { symbol: 'USD/CAD', finnhubSymbol: 'OANDA:USD_CAD' }
        ];
        
        // 加密货币列表
        this.cryptoSymbols = [
            { symbol: 'BTC/USDT', binanceSymbol: 'btcusdt', name: 'Bitcoin' },
            { symbol: 'ETH/USDT', binanceSymbol: 'ethusdt', name: 'Ethereum' },
            { symbol: 'BNB/USDT', binanceSymbol: 'bnbusdt', name: 'Binance Coin' },
            { symbol: 'XRP/USDT', binanceSymbol: 'xrpusdt', name: 'Ripple' },
            { symbol: 'ADA/USDT', binanceSymbol: 'adausdt', name: 'Cardano' },
            { symbol: 'DOGE/USDT', binanceSymbol: 'dogeusdt', name: 'Dogecoin' }
        ];
    }
    
    // 检查缓存是否有效
    isCacheValid(cacheKey) {
        const cache = this.cache[cacheKey];
        return cache.data && (Date.now() - cache.timestamp < this.config.cacheTime);
    }
    
    // 更新缓存
    updateCache(cacheKey, data) {
        this.cache[cacheKey] = {
            data: data,
            timestamp: Date.now()
        };
    }
    
    // ==================== 股票数据 ====================
    
    /**
     * 获取股票实时报价
     * 使用 Finnhub API
     */
    async getStockQuotes() {
        // 检查缓存
        if (this.isCacheValid('stocks')) {
            return this.cache.stocks.data;
        }
        
        try {
            const promises = this.stockSymbols.map(symbol => 
                this.fetchStockQuote(symbol)
            );
            
            const results = await Promise.allSettled(promises);
            const stockData = results
                .filter(result => result.status === 'fulfilled')
                .map(result => result.value);
            
            if (stockData.length > 0) {
                this.updateCache('stocks', stockData);
                return stockData;
            }
            
            // 如果所有请求都失败，使用后备数据
            if (this.config.useFallback) {
                console.warn('股票数据获取失败，使用模拟数据');
                return this.getFallbackStockData();
            }
            
            throw new Error('无法获取股票数据');
            
        } catch (error) {
            console.error('获取股票数据错误:', error);
            if (this.config.useFallback) {
                return this.getFallbackStockData();
            }
            throw error;
        }
    }
    
    /**
     * 获取单个股票报价
     */
    async fetchStockQuote(symbol) {
        const url = `${this.config.finnhubBaseUrl}/quote?symbol=${symbol}&token=${this.config.finnhubApiKey}`;
        
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Finnhub 返回格式: {c: current, h: high, l: low, o: open, pc: previous close, t: timestamp}
            if (data.c === 0 && data.pc === 0) {
                throw new Error(`${symbol} 数据无效`);
            }
            
            const currentPrice = data.c;
            const previousClose = data.pc;
            const change = currentPrice - previousClose;
            const changePercent = (change / previousClose) * 100;
            
            return {
                symbol: symbol,
                name: this.getStockName(symbol),
                price: currentPrice,
                change: parseFloat(change.toFixed(2)),
                changePercent: parseFloat(changePercent.toFixed(2)),
                high: data.h,
                low: data.l,
                open: data.o,
                prevClose: previousClose,
                volume: 0, // Finnhub 免费版不提供成交量
                timestamp: new Date(data.t * 1000).toISOString()
            };
            
        } catch (error) {
            console.error(`获取 ${symbol} 数据失败:`, error.message);
            throw error;
        }
    }
    
    /**
     * 获取股票名称
     */
    getStockName(symbol) {
        const names = {
            'AAPL': 'Apple Inc.',
            'GOOGL': 'Alphabet Inc.',
            'MSFT': 'Microsoft Corp.',
            'AMZN': 'Amazon.com Inc.',
            'TSLA': 'Tesla Inc.',
            'META': 'Meta Platforms Inc.'
        };
        return names[symbol] || symbol;
    }
    
    // ==================== 外汇数据 ====================
    
    /**
     * 获取外汇实时报价
     * 使用 Finnhub API
     */
    async getForexQuotes() {
        // 检查缓存
        if (this.isCacheValid('forex')) {
            return this.cache.forex.data;
        }
        
        try {
            const promises = this.forexPairs.map(pair => 
                this.fetchForexQuote(pair)
            );
            
            const results = await Promise.allSettled(promises);
            const forexData = results
                .filter(result => result.status === 'fulfilled')
                .map(result => result.value);
            
            if (forexData.length > 0) {
                this.updateCache('forex', forexData);
                return forexData;
            }
            
            if (this.config.useFallback) {
                console.warn('外汇数据获取失败，使用模拟数据');
                return this.getFallbackForexData();
            }
            
            throw new Error('无法获取外汇数据');
            
        } catch (error) {
            console.error('获取外汇数据错误:', error);
            if (this.config.useFallback) {
                return this.getFallbackForexData();
            }
            throw error;
        }
    }
    
    /**
     * 获取单个外汇对报价
     */
    async fetchForexQuote(pair) {
        const url = `${this.config.finnhubBaseUrl}/quote?symbol=${pair.finnhubSymbol}&token=${this.config.finnhubApiKey}`;
        
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.c === 0 && data.pc === 0) {
                throw new Error(`${pair.symbol} 数据无效`);
            }
            
            const currentPrice = data.c;
            const previousClose = data.pc;
            const change = currentPrice - previousClose;
            const changePercent = (change / previousClose) * 100;
            
            return {
                symbol: pair.symbol,
                name: this.getForexName(pair.symbol),
                price: parseFloat(currentPrice.toFixed(4)),
                change: parseFloat(change.toFixed(4)),
                changePercent: parseFloat(changePercent.toFixed(2)),
                bid: parseFloat((currentPrice - 0.0001).toFixed(4)),
                ask: parseFloat((currentPrice + 0.0001).toFixed(4)),
                high: data.h,
                low: data.l,
                timestamp: new Date(data.t * 1000).toISOString()
            };
            
        } catch (error) {
            console.error(`获取 ${pair.symbol} 数据失败:`, error.message);
            throw error;
        }
    }
    
    /**
     * 获取外汇对名称
     */
    getForexName(symbol) {
        const names = {
            'EUR/USD': 'Euro to US Dollar',
            'GBP/USD': 'British Pound to US Dollar',
            'USD/JPY': 'US Dollar to Japanese Yen',
            'USD/CHF': 'US Dollar to Swiss Franc',
            'AUD/USD': 'Australian Dollar to US Dollar',
            'USD/CAD': 'US Dollar to Canadian Dollar'
        };
        return names[symbol] || symbol;
    }
    
    // ==================== 加密货币数据 ====================
    
    /**
     * 获取加密货币实时报价
     * 使用 Binance 公开 API
     */
    async getCryptoQuotes() {
        // 检查缓存
        if (this.isCacheValid('crypto')) {
            return this.cache.crypto.data;
        }
        
        try {
            // 使用 Binance REST API 获取 24h ticker
            const symbols = this.cryptoSymbols.map(c => c.binanceSymbol).join(',');
            const url = `https://api.binance.com/api/v3/ticker/24hr`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const allData = await response.json();
            
            // 过滤我们需要的交易对
            const cryptoData = this.cryptoSymbols.map(crypto => {
                const ticker = allData.find(t => 
                    t.symbol.toLowerCase() === crypto.binanceSymbol.toLowerCase()
                );
                
                if (!ticker) {
                    throw new Error(`${crypto.symbol} 数据未找到`);
                }
                
                return {
                    symbol: crypto.symbol,
                    name: crypto.name,
                    price: parseFloat(ticker.lastPrice),
                    change: parseFloat(ticker.priceChange),
                    changePercent: parseFloat(ticker.priceChangePercent),
                    volume: parseFloat(ticker.volume),
                    marketCap: parseFloat(ticker.quoteVolume),
                    high: parseFloat(ticker.highPrice),
                    low: parseFloat(ticker.lowPrice),
                    timestamp: new Date(ticker.closeTime).toISOString()
                };
            });
            
            this.updateCache('crypto', cryptoData);
            return cryptoData;
            
        } catch (error) {
            console.error('获取加密货币数据错误:', error);
            if (this.config.useFallback) {
                console.warn('使用模拟加密货币数据');
                return this.getFallbackCryptoData();
            }
            throw error;
        }
    }
    
    /**
     * 启动加密货币 WebSocket 实时推送
     */
    startCryptoWebSocket(callback) {
        if (this.cryptoWs && this.cryptoWs.readyState === WebSocket.OPEN) {
            console.log('WebSocket 已连接');
            return;
        }
        
        // 如果重连次数过多，停止尝试
        if (!this.wsRetryCount) {
            this.wsRetryCount = 0;
        }
        
        if (this.wsRetryCount >= 3) {
            console.warn('⚠️ WebSocket 连接失败次数过多，停止重连');
            console.warn('💡 可能原因：网络限制、防火墙、地区限制');
            console.warn('📊 将继续使用 REST API 定期更新加密货币数据');
            return;
        }
        
        try {
            // Binance 组合流端点
            // 正确格式: wss://stream.binance.com:9443/stream?streams=btcusdt@ticker/ethusdt@ticker
            const streams = this.cryptoSymbols
                .map(c => `${c.binanceSymbol.toLowerCase()}@ticker`)
                .join('/');
            
            const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;
            
            console.log(`🔌 连接 Binance WebSocket (尝试 ${this.wsRetryCount + 1}/3):`, wsUrl);
            this.cryptoWs = new WebSocket(wsUrl);
            
            this.cryptoWs.onopen = () => {
                console.log('✅ Binance WebSocket 已连接');
                this.wsRetryCount = 0; // 重置重试计数
            };
            
            this.cryptoWs.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    
                    // 组合流格式: { stream: "btcusdt@ticker", data: {...} }
                    if (!message.data) {
                        return;
                    }
                    
                    const data = message.data;
                    
                    // Binance ticker 格式
                    const crypto = this.cryptoSymbols.find(c => 
                        c.binanceSymbol.toLowerCase() === data.s.toLowerCase()
                    );
                    
                    if (crypto) {
                        const update = {
                            symbol: crypto.symbol,
                            name: crypto.name,
                            price: parseFloat(data.c),
                            change: parseFloat(data.p),
                            changePercent: parseFloat(data.P),
                            volume: parseFloat(data.v),
                            high: parseFloat(data.h),
                            low: parseFloat(data.l),
                            timestamp: new Date(data.E).toISOString()
                        };
                        
                        this.cryptoData.set(crypto.symbol, update);
                        
                        if (callback) {
                            callback(update);
                        }
                    }
                } catch (error) {
                    console.error('WebSocket 消息解析错误:', error);
                }
            };
            
            this.cryptoWs.onerror = (error) => {
                console.error('❌ WebSocket 连接错误');
                this.wsRetryCount++;
            };
            
            this.cryptoWs.onclose = (event) => {
                if (this.wsRetryCount < 3) {
                    console.log(`🔄 WebSocket 已断开，5秒后重连... (${this.wsRetryCount}/3)`);
                    setTimeout(() => this.startCryptoWebSocket(callback), 5000);
                } else {
                    console.warn('⚠️ WebSocket 已停止重连，将使用 REST API 更新数据');
                }
            };
            
        } catch (error) {
            console.error('启动 WebSocket 失败:', error);
        }
    }
    
    /**
     * 停止 WebSocket 连接
     */
    stopCryptoWebSocket() {
        if (this.cryptoWs) {
            this.cryptoWs.close();
            this.cryptoWs = null;
        }
    }
    
    // ==================== 后备数据（模拟） ====================
    
    getFallbackStockData() {
        return this.stockSymbols.map(symbol => ({
            symbol: symbol,
            name: this.getStockName(symbol),
            price: 150 + Math.random() * 100,
            change: (Math.random() - 0.5) * 10,
            changePercent: (Math.random() - 0.5) * 5,
            high: 160 + Math.random() * 100,
            low: 140 + Math.random() * 100,
            open: 145 + Math.random() * 100,
            prevClose: 148 + Math.random() * 100,
            volume: Math.floor(Math.random() * 10000000),
            timestamp: new Date().toISOString()
        }));
    }
    
    getFallbackForexData() {
        return this.forexPairs.map(pair => ({
            symbol: pair.symbol,
            name: this.getForexName(pair.symbol),
            price: 1.0 + Math.random() * 0.2,
            change: (Math.random() - 0.5) * 0.01,
            changePercent: (Math.random() - 0.5) * 2,
            bid: 1.0 + Math.random() * 0.2,
            ask: 1.0 + Math.random() * 0.2,
            high: 1.05 + Math.random() * 0.2,
            low: 0.95 + Math.random() * 0.2,
            timestamp: new Date().toISOString()
        }));
    }
    
    getFallbackCryptoData() {
        return this.cryptoSymbols.map(crypto => ({
            symbol: crypto.symbol,
            name: crypto.name,
            price: crypto.binanceSymbol.includes('btc') ? 30000 : 2000,
            change: (Math.random() - 0.5) * 1000,
            changePercent: (Math.random() - 0.5) * 5,
            volume: Math.floor(Math.random() * 1000000),
            marketCap: Math.floor(Math.random() * 1000000000),
            high: 31000,
            low: 29000,
            timestamp: new Date().toISOString()
        }));
    }
}

// 导出为全局变量
window.RealDataFetcher = RealDataFetcher;
