import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, RefreshCw, Search, Globe, AlertCircle } from 'lucide-react';

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

  // Fetch real-time exchange rates
  const fetchExchangeRates = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try multiple free APIs for exchange rates
      let response;
      let data;
      
      // Primary API: exchangerate-api.com (free tier)
      try {
        response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
        if (response.ok) {
          data = await response.json();
          setRates(data.rates);
          setExchangeRate(data.rates[toCurrency] || 1);
          setLastUpdated(new Date(data.date));
          return;
        }
      } catch (e) {
        console.log('Primary API failed, trying backup...');
      }

      // Backup API: fixer.io (requires API key but has free tier)
      try {
        response = await fetch(`https://api.fixer.io/latest?base=${fromCurrency}&symbols=${toCurrency}`);
        if (response.ok) {
          data = await response.json();
          if (data.rates) {
            setRates(data.rates);
            setExchangeRate(data.rates[toCurrency] || 1);
            setLastUpdated(new Date(data.date));
            return;
          }
        }
      } catch (e) {
        console.log('Backup API failed, trying alternative...');
      }

      // Alternative: Use a CORS proxy with a free API
      try {
        response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`)}`);
        if (response.ok) {
          const proxyData = await response.json();
          data = JSON.parse(proxyData.contents);
          setRates(data.rates);
          setExchangeRate(data.rates[toCurrency] || 1);
          setLastUpdated(new Date(data.date));
          return;
        }
      } catch (e) {
        console.log('Proxy API failed');
      }

      // If all APIs fail, use a fallback calculation based on common rates
      const fallbackRates = await getFallbackRates(fromCurrency, toCurrency);
      setExchangeRate(fallbackRates.rate);
      setLastUpdated(new Date());
      setError('Using approximate rates. Real-time data unavailable.');
      
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      setError('Unable to fetch current exchange rates. Please try again later.');
      
      // Use fallback rates
      const fallbackRates = await getFallbackRates(fromCurrency, toCurrency);
      setExchangeRate(fallbackRates.rate);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  // Fallback rates calculation (approximate)
  const getFallbackRates = async (from: string, to: string): Promise<{ rate: number }> => {
    // Basic conversion rates relative to USD (approximate)
    const usdRates: { [key: string]: number } = {
      'USD': 1, 'EUR': 0.85, 'GBP': 0.73, 'JPY': 110, 'AUD': 1.35,
      'CAD': 1.25, 'CHF': 0.92, 'CNY': 6.45, 'INR': 74.5, 'KRW': 1180,
      'BRL': 5.2, 'RUB': 73.5, 'MXN': 20.1, 'SGD': 1.35, 'HKD': 7.8,
      'NOK': 8.5, 'SEK': 8.7, 'DKK': 6.3, 'PLN': 3.8, 'TRY': 8.5,
      'ZAR': 14.2, 'NZD': 1.4, 'THB': 31.5, 'MYR': 4.1, 'IDR': 14250,
      'PHP': 50.5, 'VND': 23000, 'AED': 3.67, 'SAR': 3.75, 'EGP': 15.7,
      'ILS': 3.2, 'CZK': 21.5, 'HUF': 295, 'RON': 4.1, 'BGN': 1.66,
      'HRK': 6.4, 'ISK': 125, 'CLP': 750, 'COP': 3800, 'PEN': 3.6,
      'ARS': 98, 'UYU': 43, 'KES': 108, 'NGN': 411, 'GHS': 6.1,
      'MAD': 9.0, 'TND': 2.8, 'PKR': 170, 'BDT': 85, 'LKR': 200,
      'NPR': 119, 'MMK': 1850
    };

    const fromRate = usdRates[from] || 1;
    const toRate = usdRates[to] || 1;
    const rate = toRate / fromRate;

    return { rate };
  };

  useEffect(() => {
    fetchExchangeRates();
  }, [fromCurrency, toCurrency]);

  // Auto-refresh rates every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchExchangeRates, 300000);
    return () => clearInterval(interval);
  }, [fromCurrency, toCurrency]);

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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-green-500" />
          Real-time Currency Exchange
        </h2>

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
                disabled={loading}
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
                <span>Rates updated automatically every 5 minutes</span>
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
            <strong>Data Sources:</strong> Exchange rates are fetched from multiple reliable financial APIs including ExchangeRate-API and Fixer.io. 
            Rates are updated every 5 minutes during market hours. All rates are for informational purposes only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CurrencyExchange;