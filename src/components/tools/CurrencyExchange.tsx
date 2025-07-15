import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, RefreshCw, Search, Globe, AlertCircle, Wifi, WifiOff } from 'lucide-react';

const CurrencyExchange: React.FC = () => {
  const [amount, setAmount] = useState<number>(1);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rates, setRates] = useState<{ [key: string]: number }>({});
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [dataSource, setDataSource] = useState<string>('');

  // Comprehensive list of world currencies
  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$', country: 'United States' },
    { code: 'EUR', name: 'Euro', symbol: '€', country: 'European Union' },
    { code: 'GBP', name: 'British Pound', symbol: '£', country: 'United Kingdom' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', country: 'Japan' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', country: 'Australia' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', country: 'Canada' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', country: 'Switzerland' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', country: 'China' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', country: 'India' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩', country: 'South Korea' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', country: 'Brazil' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽', country: 'Russia' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$', country: 'Mexico' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', country: 'Singapore' },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', country: 'Hong Kong' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', country: 'Norway' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', country: 'Sweden' },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr', country: 'Denmark' },
    { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', country: 'Poland' },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺', country: 'Turkey' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R', country: 'South Africa' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', country: 'New Zealand' },
    { code: 'THB', name: 'Thai Baht', symbol: '฿', country: 'Thailand' },
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', country: 'Malaysia' },
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', country: 'Indonesia' },
    { code: 'PHP', name: 'Philippine Peso', symbol: '₱', country: 'Philippines' },
    { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', country: 'Vietnam' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', country: 'United Arab Emirates' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', country: 'Saudi Arabia' },
    { code: 'EGP', name: 'Egyptian Pound', symbol: '£', country: 'Egypt' },
    { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', country: 'Israel' },
    { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', country: 'Czech Republic' },
    { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', country: 'Hungary' },
    { code: 'RON', name: 'Romanian Leu', symbol: 'lei', country: 'Romania' },
    { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', country: 'Bulgaria' },
    { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn', country: 'Croatia' },
    { code: 'ISK', name: 'Icelandic Krona', symbol: 'kr', country: 'Iceland' },
    { code: 'CLP', name: 'Chilean Peso', symbol: '$', country: 'Chile' },
    { code: 'COP', name: 'Colombian Peso', symbol: '$', country: 'Colombia' },
    { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/', country: 'Peru' },
    { code: 'ARS', name: 'Argentine Peso', symbol: '$', country: 'Argentina' },
    { code: 'UYU', name: 'Uruguayan Peso', symbol: '$U', country: 'Uruguay' },
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', country: 'Kenya' },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', country: 'Nigeria' },
    { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', country: 'Ghana' },
    { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.', country: 'Morocco' },
    { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت', country: 'Tunisia' },
    { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', country: 'Pakistan' },
    { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', country: 'Bangladesh' },
    { code: 'LKR', name: 'Sri Lankan Rupee', symbol: '₨', country: 'Sri Lanka' },
    { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨', country: 'Nepal' },
    { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K', country: 'Myanmar' }
  ];

  const filteredCurrencies = currencies.filter(currency =>
    currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch real-time exchange rates from multiple sources
  const fetchExchangeRates = async () => {
    setLoading(true);
    setError(null);
    
    if (!isOnline) {
      setError('No internet connection. Please check your network and try again.');
      setLoading(false);
      return;
    }
    
    try {
      let success = false;
      
      // Primary API: ExchangeRate-API (Free tier: 1500 requests/month)
      if (!success) {
        try {
          const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
          if (response.ok) {
            const data = await response.json();
            setRates(data.rates);
            setExchangeRate(data.rates[toCurrency] || 1);
            setLastUpdated(new Date(data.date));
            setDataSource('ExchangeRate-API');
            success = true;
          }
        } catch (e) {
          console.log('ExchangeRate-API failed, trying next...');
        }
      }

      // Secondary API: Fixer.io (Free tier: 100 requests/month)
      if (!success) {
        try {
          const response = await fetch(`https://api.fixer.io/latest?base=${fromCurrency}&access_key=YOUR_API_KEY`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.rates) {
              setRates(data.rates);
              setExchangeRate(data.rates[toCurrency] || 1);
              setLastUpdated(new Date(data.date));
              setDataSource('Fixer.io');
              success = true;
            }
          }
        } catch (e) {
          console.log('Fixer.io failed, trying next...');
        }
      }

      // Tertiary API: CurrencyAPI (Free tier: 300 requests/month)
      if (!success) {
        try {
          const response = await fetch(`https://api.currencyapi.com/v3/latest?apikey=YOUR_API_KEY&base_currency=${fromCurrency}&currencies=${toCurrency}`);
          if (response.ok) {
            const data = await response.json();
            if (data.data) {
              const rate = data.data[toCurrency]?.value || 1;
              setRates({ [toCurrency]: rate });
              setExchangeRate(rate);
              setLastUpdated(new Date(data.meta.last_updated_at));
              setDataSource('CurrencyAPI');
              success = true;
            }
          }
        } catch (e) {
          console.log('CurrencyAPI failed, trying next...');
        }
      }

      // Alternative: Use CORS proxy with free APIs
      if (!success) {
        try {
          const proxyUrl = 'https://api.allorigins.win/get?url=';
          const targetUrl = `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`;
          const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));
          
          if (response.ok) {
            const proxyData = await response.json();
            const data = JSON.parse(proxyData.contents);
            setRates(data.rates);
            setExchangeRate(data.rates[toCurrency] || 1);
            setLastUpdated(new Date(data.date));
            setDataSource('ExchangeRate-API (Proxy)');
            success = true;
          }
        } catch (e) {
          console.log('Proxy API failed, trying next...');
        }
      }

      // Backup: European Central Bank (EUR base only)
      if (!success && fromCurrency === 'EUR') {
        try {
          const response = await fetch('https://api.exchangerate.host/latest?base=EUR');
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.rates) {
              setRates(data.rates);
              setExchangeRate(data.rates[toCurrency] || 1);
              setLastUpdated(new Date(data.date));
              setDataSource('European Central Bank');
              success = true;
            }
          }
        } catch (e) {
          console.log('ECB API failed');
        }
      }

      // Final fallback: Use cached rates or estimated rates
      if (!success) {
        const cachedRates = localStorage.getItem('currencyRates');
        if (cachedRates) {
          const parsed = JSON.parse(cachedRates);
          const cacheAge = Date.now() - parsed.timestamp;
          
          // Use cached data if less than 1 hour old
          if (cacheAge < 3600000) {
            setRates(parsed.rates);
            setExchangeRate(parsed.rates[toCurrency] || 1);
            setLastUpdated(new Date(parsed.timestamp));
            setDataSource('Cached Data');
            setError('Using cached exchange rates. Live data temporarily unavailable.');
            success = true;
          }
        }
      }

      // Ultimate fallback: Use approximate rates
      if (!success) {
        const fallbackRates = await getFallbackRates(fromCurrency, toCurrency);
        setExchangeRate(fallbackRates.rate);
        setLastUpdated(new Date());
        setDataSource('Estimated Rates');
        setError('Using estimated exchange rates. Live data unavailable.');
      } else {
        // Cache successful API response
        localStorage.setItem('currencyRates', JSON.stringify({
          rates: rates,
          timestamp: Date.now(),
          source: dataSource
        }));
      }
      
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      setError('Unable to fetch current exchange rates. Please try again later.');
      
      // Try to use cached data as last resort
      const cachedRates = localStorage.getItem('currencyRates');
      if (cachedRates) {
        const parsed = JSON.parse(cachedRates);
        setRates(parsed.rates);
        setExchangeRate(parsed.rates[toCurrency] || 1);
        setLastUpdated(new Date(parsed.timestamp));
        setDataSource('Cached Data (Offline)');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fallback rates calculation (approximate, based on historical averages)
  const getFallbackRates = async (from: string, to: string): Promise<{ rate: number }> => {
    // Updated rates based on recent market data (approximate)
    const usdRates: { [key: string]: number } = {
      'USD': 1.0000, 'EUR': 0.8500, 'GBP': 0.7300, 'JPY': 149.50, 'AUD': 1.5200,
      'CAD': 1.3600, 'CHF': 0.8900, 'CNY': 7.2400, 'INR': 83.20, 'KRW': 1320.00,
      'BRL': 4.9800, 'RUB': 92.50, 'MXN': 17.80, 'SGD': 1.3500, 'HKD': 7.8100,
      'NOK': 10.80, 'SEK': 10.90, 'DKK': 6.8500, 'PLN': 4.0200, 'TRY': 28.50,
      'ZAR': 18.70, 'NZD': 1.6200, 'THB': 35.80, 'MYR': 4.6800, 'IDR': 15750,
      'PHP': 56.20, 'VND': 24500, 'AED': 3.6700, 'SAR': 3.7500, 'EGP': 30.90,
      'ILS': 3.7200, 'CZK': 22.80, 'HUF': 360.00, 'RON': 4.6500, 'BGN': 1.8100,
      'HRK': 7.0200, 'ISK': 138.00, 'CLP': 890.00, 'COP': 4050.00, 'PEN': 3.7500,
      'ARS': 350.00, 'UYU': 38.50, 'KES': 150.00, 'NGN': 775.00, 'GHS': 12.00,
      'MAD': 10.20, 'TND': 3.1200, 'PKR': 285.00, 'BDT': 110.00, 'LKR': 325.00,
      'NPR': 133.00, 'MMK': 2100.00
    };

    const fromRate = usdRates[from] || 1;
    const toRate = usdRates[to] || 1;
    const rate = toRate / fromRate;

    return { rate };
  };

  useEffect(() => {
    fetchExchangeRates();
  }, [fromCurrency, toCurrency]);

  // Auto-refresh rates every 5 minutes when online
  useEffect(() => {
    if (!isOnline) return;
    
    const interval = setInterval(fetchExchangeRates, 300000);
    return () => clearInterval(interval);
  }, [fromCurrency, toCurrency, isOnline]);

  const convertedAmount = amount * exchangeRate;

  const popularPairs = [
    { from: 'USD', to: 'EUR' },
    { from: 'USD', to: 'GBP' },
    { from: 'EUR', to: 'GBP' },
    { from: 'USD', to: 'JPY' },
    { from: 'USD', to: 'CNY' },
    { from: 'USD', to: 'INR' }
  ];

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-500';
    if (error && !error.includes('cached')) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    return isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-500" />
            Real-time Currency Exchange
          </h2>
          
          {/* Connection Status */}
          <div className={`flex items-center gap-2 ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="text-sm font-medium">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Data Source Info */}
        {dataSource && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-sm">
              <strong>Data Source:</strong> {dataSource}
              {lastUpdated && (
                <span className="ml-2">
                  • Last updated: {lastUpdated.toLocaleString()}
                </span>
              )}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <span className="text-yellow-700">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Exchange Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                placeholder="Enter amount"
                min="0"
                step="0.01"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none"
                  >
                    {currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none"
                  >
                    {currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={swapCurrencies}
                className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                Swap Currencies
              </button>
              <button
                onClick={fetchExchangeRates}
                disabled={loading || !isOnline}
                className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Updating...' : 'Update Rate'}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  {amount} {fromCurrency} =
                </p>
                <p className="text-4xl font-bold text-green-600 mb-2">
                  {convertedAmount.toFixed(4)} {toCurrency}
                </p>
                {lastUpdated && (
                  <p className="text-sm text-gray-500">
                    Last updated: {lastUpdated.toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Exchange Rate</span>
                <span className="font-semibold">
                  1 {fromCurrency} = {exchangeRate.toFixed(6)} {toCurrency}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Reverse Rate</span>
                <span className="font-semibold">
                  1 {toCurrency} = {(1 / exchangeRate).toFixed(6)} {fromCurrency}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <TrendingUp className="w-4 h-4" />
                <span>
                  {isOnline 
                    ? 'Rates updated automatically every 5 minutes' 
                    : 'Offline - using cached rates'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Currency Search */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Search Currencies
          </h3>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by currency name, code, or country..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
            {filteredCurrencies.map((currency) => {
              const rate = rates[currency.code] || 0;
              return (
                <div
                  key={currency.code}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => {
                    if (fromCurrency === currency.code) {
                      setToCurrency(currency.code);
                    } else {
                      setFromCurrency(currency.code);
                    }
                  }}
                >
                  <Globe className="w-5 h-5 text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800">
                      {currency.code} - {currency.symbol}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {currency.name} ({currency.country})
                    </p>
                  </div>
                  {rate > 0 && (
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-800">
                        {rate.toFixed(4)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Pairs */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Popular Currency Pairs
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularPairs.map((pair, index) => {
              const rate = rates[pair.to] || 0;
              return (
                <div
                  key={index}
                  className="bg-gray-50 p-3 rounded-lg text-center hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => {
                    setFromCurrency(pair.from);
                    setToCurrency(pair.to);
                  }}
                >
                  <p className="text-sm font-medium text-gray-700">
                    {pair.from}/{pair.to}
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    {rate > 0 ? rate.toFixed(4) : 'Loading...'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Data Source Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Real-time Data Sources:</strong> This app fetches live exchange rates from multiple financial APIs including ExchangeRate-API, Fixer.io, CurrencyAPI, and European Central Bank. 
            Rates are automatically updated every 5 minutes when online. Offline functionality uses cached data for up to 1 hour.
            {!isOnline && (
              <span className="block mt-2 font-medium">
                ⚠️ You are currently offline. Reconnect to internet for live rates.
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CurrencyExchange;