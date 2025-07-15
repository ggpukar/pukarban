import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets, Eye, Thermometer, MapPin, Search, AlertCircle, Loader } from 'lucide-react';

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
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);

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

  // Request location permission
  const requestLocationPermission = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLocationPermission('denied');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      });

      const coords = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
      };

      setCoordinates(coords);
      setLocationPermission('granted');
      await fetchWeatherByCoords(coords.lat, coords.lon);

    } catch (error: any) {
      console.error('Location error:', error);
      setLocationPermission('denied');
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          setError('Location access denied by user');
          break;
        case error.POSITION_UNAVAILABLE:
          setError('Location information unavailable');
          break;
        case error.TIMEOUT:
          setError('Location request timed out');
          break;
        default:
          setError('An unknown error occurred while retrieving location');
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch weather by coordinates
  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);

    try {
      // Try multiple weather APIs
      let weatherResponse;
      
      // Primary API: OpenWeatherMap (requires API key)
      const API_KEY = 'your_openweather_api_key'; // You would need to get this
      
      try {
        weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        
        if (weatherResponse.ok) {
          const data = await weatherResponse.json();
          updateWeatherFromAPI(data);
          return;
        }
      } catch (e) {
        console.log('OpenWeatherMap API failed, trying alternatives...');
      }

      // Alternative: Use a free weather API with CORS proxy
      try {
        const proxyUrl = 'https://api.allorigins.win/get?url=';
        const weatherUrl = `https://wttr.in/${lat},${lon}?format=j1`;
        
        weatherResponse = await fetch(proxyUrl + encodeURIComponent(weatherUrl));
        
        if (weatherResponse.ok) {
          const proxyData = await weatherResponse.json();
          const weatherData = JSON.parse(proxyData.contents);
          updateWeatherFromWttr(weatherData, lat, lon);
          return;
        }
      } catch (e) {
        console.log('Alternative API failed');
      }

      // Fallback: Generate realistic weather data based on location
      await generateLocationBasedWeather(lat, lon);
      setError('Using simulated weather data. Real-time API unavailable.');

    } catch (error) {
      console.error('Weather fetch error:', error);
      setError('Unable to fetch weather data');
      await generateLocationBasedWeather(lat, lon);
    } finally {
      setLoading(false);
    }
  };

  // Update weather from OpenWeatherMap API response
  const updateWeatherFromAPI = (data: any) => {
    setWeatherData({
      location: `${data.name}, ${data.sys.country}`,
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      visibility: Math.round(data.visibility / 1000), // Convert m to km
      feelsLike: Math.round(data.main.feels_like),
      pressure: data.main.pressure,
      uvIndex: 5, // UV index not available in basic API
      sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    });
  };

  // Update weather from wttr.in API response
  const updateWeatherFromWttr = (data: any, lat: number, lon: number) => {
    const current = data.current_condition[0];
    const location = data.nearest_area[0];
    
    setWeatherData({
      location: `${location.areaName[0].value}, ${location.country[0].value}`,
      temperature: parseInt(current.temp_C),
      condition: current.weatherDesc[0].value.toLowerCase(),
      humidity: parseInt(current.humidity),
      windSpeed: parseInt(current.windspeedKmph),
      visibility: parseInt(current.visibility),
      feelsLike: parseInt(current.FeelsLikeC),
      pressure: parseInt(current.pressure),
      uvIndex: parseInt(current.uvIndex || '5'),
      sunrise: data.weather[0].astronomy[0].sunrise,
      sunset: data.weather[0].astronomy[0].sunset
    });
  };

  // Generate realistic weather based on location and season
  const generateLocationBasedWeather = async (lat: number, lon: number) => {
    // Get location name using reverse geocoding
    let locationName = 'Current Location';
    
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      
      if (response.ok) {
        const data = await response.json();
        locationName = `${data.city || data.locality || 'Unknown'}, ${data.countryName || 'Unknown'}`;
      }
    } catch (e) {
      console.log('Reverse geocoding failed');
    }

    // Generate weather based on latitude (climate zone) and current season
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const isWinter = month >= 11 || month <= 2;
    const isSummer = month >= 5 && month <= 8;
    
    // Temperature based on latitude and season
    let baseTemp = 20; // Default moderate temperature
    
    if (Math.abs(lat) > 60) { // Arctic/Antarctic
      baseTemp = isWinter ? -10 : 10;
    } else if (Math.abs(lat) > 40) { // Temperate
      baseTemp = isWinter ? 5 : isSummer ? 25 : 15;
    } else if (Math.abs(lat) < 23.5) { // Tropical
      baseTemp = isSummer ? 30 : 25;
    } else { // Subtropical
      baseTemp = isWinter ? 15 : isSummer ? 28 : 22;
    }

    // Add some randomness
    const temperature = baseTemp + (Math.random() - 0.5) * 10;
    
    const conditions = ['clear sky', 'few clouds', 'scattered clouds', 'broken clouds'];
    if (Math.random() > 0.8) conditions.push('rain');
    
    setWeatherData({
      location: locationName,
      temperature: Math.round(temperature),
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      humidity: Math.floor(Math.random() * 40) + 40,
      windSpeed: Math.floor(Math.random() * 20) + 5,
      visibility: Math.floor(Math.random() * 10) + 5,
      feelsLike: Math.round(temperature + (Math.random() - 0.5) * 5),
      pressure: Math.floor(Math.random() * 50) + 1000,
      uvIndex: Math.floor(Math.random() * 11),
      sunrise: '06:30',
      sunset: '19:45'
    });
  };

  // Search weather by city name
  const searchWeather = async () => {
    if (!searchLocation.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Try to get coordinates for the city first
      const geocodeResponse = await fetch(
        `https://api.bigdatacloud.net/data/geocode-city?city=${encodeURIComponent(searchLocation)}&key=bdc_geocoding`
      );
      
      if (geocodeResponse.ok) {
        const geocodeData = await geocodeResponse.json();
        if (geocodeData.latitude && geocodeData.longitude) {
          await fetchWeatherByCoords(geocodeData.latitude, geocodeData.longitude);
          setSearchLocation('');
          return;
        }
      }

      // Fallback: Generate weather for searched city
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
      setError('Showing simulated weather data for searched location.');
      
    } catch (err) {
      setError('City not found or weather data unavailable');
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
    // Auto-refresh weather data every 10 minutes if location is available
    const interval = setInterval(() => {
      if (coordinates) {
        fetchWeatherByCoords(coordinates.lat, coordinates.lon);
      }
    }, 600000);

    return () => clearInterval(interval);
  }, [coordinates]);

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
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Search'}
          </button>
          <button
            onClick={requestLocationPermission}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <MapPin className="w-5 h-5" />
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Current'}
          </button>
        </div>

        {/* Location Permission Status */}
        {locationPermission === 'prompt' && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Click "Current" to allow location access for accurate local weather
            </p>
          </div>
        )}

        {locationPermission === 'denied' && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Location access denied. You can still search for weather by city name.
            </p>
          </div>
        )}

        {locationPermission === 'granted' && coordinates && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location access granted. Showing weather for your current location.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
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
                {coordinates && (
                  <p className="text-cyan-200 text-xs">
                    Coordinates: {coordinates.lat.toFixed(4)}, {coordinates.lon.toFixed(4)}
                  </p>
                )}
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

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">
          How to Use
        </h3>
        <ul className="text-blue-700 space-y-2 text-sm">
          <li>• Click "Current" to allow location access for local weather</li>
          <li>• Search for any city worldwide using the search box</li>
          <li>• Weather data updates automatically every 10 minutes</li>
          <li>• Location permission is required for accurate local weather</li>
          <li>• If real-time data is unavailable, simulated data is shown</li>
        </ul>
      </div>
    </div>
  );
};

export default Weather;