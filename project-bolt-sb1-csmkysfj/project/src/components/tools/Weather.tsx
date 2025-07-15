import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets, Eye, Thermometer, MapPin, Search } from 'lucide-react';

const Weather: React.FC = () => {
  const [weatherData, setWeatherData] = useState({
    location: 'New York',
    temperature: 22,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12,
    visibility: 10,
    feelsLike: 25,
    pressure: 1013,
    uvIndex: 6,
    sunrise: '06:30',
    sunset: '19:45'
  });

  const [loading, setLoading] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [error, setError] = useState<string | null>(null);

  const weatherConditions = {
    'clear sky': { icon: Sun, color: 'text-yellow-500' },
    'few clouds': { icon: Cloud, color: 'text-gray-400' },
    'scattered clouds': { icon: Cloud, color: 'text-gray-500' },
    'broken clouds': { icon: Cloud, color: 'text-gray-600' },
    'shower rain': { icon: CloudRain, color: 'text-blue-500' },
    'rain': { icon: CloudRain, color: 'text-blue-600' },
    'thunderstorm': { icon: CloudRain, color: 'text-purple-600' },
    'snow': { icon: Cloud, color: 'text-blue-200' },
    'mist': { icon: Cloud, color: 'text-gray-400' }
  };

  const forecast = [
    { day: 'Today', high: 25, low: 18, condition: 'Partly Cloudy', icon: 'few clouds' },
    { day: 'Tomorrow', high: 28, low: 20, condition: 'Sunny', icon: 'clear sky' },
    { day: 'Wednesday', high: 23, low: 16, condition: 'Rainy', icon: 'rain' },
    { day: 'Thursday', high: 26, low: 19, condition: 'Partly Cloudy', icon: 'few clouds' },
    { day: 'Friday', high: 24, low: 17, condition: 'Cloudy', icon: 'broken clouds' }
  ];

  // Get user's current location
  const getCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          setError('Location access denied');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation not supported');
      setLoading(false);
    }
  };

  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    try {
      // In a real app, you would use OpenWeatherMap API
      // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=YOUR_API_KEY&units=metric`);
      
      // Simulating API call with realistic data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData = {
        location: 'Current Location',
        temperature: Math.floor(Math.random() * 30) + 5,
        condition: Object.keys(weatherConditions)[Math.floor(Math.random() * Object.keys(weatherConditions).length)],
        humidity: Math.floor(Math.random() * 40) + 40,
        windSpeed: Math.floor(Math.random() * 20) + 5,
        visibility: Math.floor(Math.random() * 10) + 5,
        feelsLike: Math.floor(Math.random() * 35) + 10,
        pressure: Math.floor(Math.random() * 50) + 1000,
        uvIndex: Math.floor(Math.random() * 11),
        sunrise: '06:30',
        sunset: '19:45'
      };
      
      setWeatherData(mockData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const searchWeather = async () => {
    if (!searchLocation.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, you would use OpenWeatherMap API
      // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${searchLocation}&appid=YOUR_API_KEY&units=metric`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData = {
        location: searchLocation,
        temperature: Math.floor(Math.random() * 30) + 5,
        condition: Object.keys(weatherConditions)[Math.floor(Math.random() * Object.keys(weatherConditions).length)],
        humidity: Math.floor(Math.random() * 40) + 40,
        windSpeed: Math.floor(Math.random() * 20) + 5,
        visibility: Math.floor(Math.random() * 10) + 5,
        feelsLike: Math.floor(Math.random() * 35) + 10,
        pressure: Math.floor(Math.random() * 50) + 1000,
        uvIndex: Math.floor(Math.random() * 11),
        sunrise: '06:30',
        sunset: '19:45'
      };
      
      setWeatherData(mockData);
      setSearchLocation('');
    } catch (err) {
      setError('City not found');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentWeatherIcon = () => {
    const condition = weatherConditions[weatherData.condition as keyof typeof weatherConditions];
    return condition || weatherConditions['few clouds'];
  };

  const WeatherIcon = getCurrentWeatherIcon().icon;
  const iconColor = getCurrentWeatherIcon().color;

  useEffect(() => {
    // Auto-refresh weather data every 10 minutes
    const interval = setInterval(() => {
      if (weatherData.location === 'Current Location') {
        getCurrentLocation();
      }
    }, 600000);

    return () => clearInterval(interval);
  }, [weatherData.location]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
          <Cloud className="w-8 h-8 text-cyan-500" />
          Real-time Weather
        </h2>
        
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              placeholder="Search for a city..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              onKeyPress={(e) => e.key === 'Enter' && searchWeather()}
            />
          </div>
          <button
            onClick={searchWeather}
            disabled={loading}
            className="bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button
            onClick={getCurrentLocation}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <MapPin className="w-5 h-5" />
            Current
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Weather */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-3xl font-bold">{weatherData.location}</h3>
                <p className="text-cyan-100">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-cyan-200 text-sm">
                  Last updated: {new Date().toLocaleTimeString()}
                </p>
              </div>
              <WeatherIcon className="w-16 h-16 text-white" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-6xl font-bold">{weatherData.temperature}°C</p>
                <p className="text-xl text-cyan-100 capitalize">{weatherData.condition}</p>
              </div>
              <div className="text-right">
                <p className="text-cyan-100">Feels like</p>
                <p className="text-2xl font-semibold">{weatherData.feelsLike}°C</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-cyan-400">
              <div className="text-center">
                <p className="text-cyan-200 text-sm">Sunrise</p>
                <p className="text-lg font-semibold">{weatherData.sunrise}</p>
              </div>
              <div className="text-center">
                <p className="text-cyan-200 text-sm">Sunset</p>
                <p className="text-lg font-semibold">{weatherData.sunset}</p>
              </div>
            </div>
          </div>

          {/* Weather Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Wind className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-600">Wind</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{weatherData.windSpeed}</p>
              <p className="text-sm text-gray-500">km/h</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-600">Humidity</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{weatherData.humidity}</p>
              <p className="text-sm text-gray-500">%</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-600">Visibility</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{weatherData.visibility}</p>
              <p className="text-sm text-gray-500">km</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-600">UV Index</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{weatherData.uvIndex}</p>
              <p className="text-sm text-gray-500">
                {weatherData.uvIndex <= 2 ? 'Low' : weatherData.uvIndex <= 5 ? 'Moderate' : weatherData.uvIndex <= 7 ? 'High' : 'Very High'}
              </p>
            </div>
          </div>
        </div>

        {/* 5-Day Forecast */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">5-Day Forecast</h3>
          {forecast.map((day, index) => {
            const dayCondition = weatherConditions[day.icon as keyof typeof weatherConditions];
            const DayIcon = dayCondition.icon;
            
            return (
              <div key={index} className="bg-white rounded-xl p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DayIcon className={`w-8 h-8 ${dayCondition.color}`} />
                    <div>
                      <p className="font-medium text-gray-800">{day.day}</p>
                      <p className="text-sm text-gray-500 capitalize">{day.condition}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{day.high}°</p>
                    <p className="text-sm text-gray-500">{day.low}°</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Weather;