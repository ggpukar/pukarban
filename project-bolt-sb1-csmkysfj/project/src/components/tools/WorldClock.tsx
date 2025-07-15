import React, { useState, useEffect } from 'react';
import { Clock, Globe, Search, Plus, X } from 'lucide-react';

const WorldClock: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimezones, setSelectedTimezones] = useState([
    'America/New_York',
    'Europe/London',
    'Asia/Tokyo',
    'Australia/Sydney'
  ]);

  // Comprehensive list of world timezones
  const allTimezones = [
    // Americas
    { city: 'New York', timezone: 'America/New_York', country: 'United States', region: 'Americas' },
    { city: 'Los Angeles', timezone: 'America/Los_Angeles', country: 'United States', region: 'Americas' },
    { city: 'Chicago', timezone: 'America/Chicago', country: 'United States', region: 'Americas' },
    { city: 'Denver', timezone: 'America/Denver', country: 'United States', region: 'Americas' },
    { city: 'Toronto', timezone: 'America/Toronto', country: 'Canada', region: 'Americas' },
    { city: 'Vancouver', timezone: 'America/Vancouver', country: 'Canada', region: 'Americas' },
    { city: 'Mexico City', timezone: 'America/Mexico_City', country: 'Mexico', region: 'Americas' },
    { city: 'São Paulo', timezone: 'America/Sao_Paulo', country: 'Brazil', region: 'Americas' },
    { city: 'Buenos Aires', timezone: 'America/Argentina/Buenos_Aires', country: 'Argentina', region: 'Americas' },
    { city: 'Lima', timezone: 'America/Lima', country: 'Peru', region: 'Americas' },
    { city: 'Bogotá', timezone: 'America/Bogota', country: 'Colombia', region: 'Americas' },
    { city: 'Santiago', timezone: 'America/Santiago', country: 'Chile', region: 'Americas' },
    
    // Europe
    { city: 'London', timezone: 'Europe/London', country: 'United Kingdom', region: 'Europe' },
    { city: 'Paris', timezone: 'Europe/Paris', country: 'France', region: 'Europe' },
    { city: 'Berlin', timezone: 'Europe/Berlin', country: 'Germany', region: 'Europe' },
    { city: 'Rome', timezone: 'Europe/Rome', country: 'Italy', region: 'Europe' },
    { city: 'Madrid', timezone: 'Europe/Madrid', country: 'Spain', region: 'Europe' },
    { city: 'Amsterdam', timezone: 'Europe/Amsterdam', country: 'Netherlands', region: 'Europe' },
    { city: 'Brussels', timezone: 'Europe/Brussels', country: 'Belgium', region: 'Europe' },
    { city: 'Vienna', timezone: 'Europe/Vienna', country: 'Austria', region: 'Europe' },
    { city: 'Zurich', timezone: 'Europe/Zurich', country: 'Switzerland', region: 'Europe' },
    { city: 'Stockholm', timezone: 'Europe/Stockholm', country: 'Sweden', region: 'Europe' },
    { city: 'Oslo', timezone: 'Europe/Oslo', country: 'Norway', region: 'Europe' },
    { city: 'Copenhagen', timezone: 'Europe/Copenhagen', country: 'Denmark', region: 'Europe' },
    { city: 'Helsinki', timezone: 'Europe/Helsinki', country: 'Finland', region: 'Europe' },
    { city: 'Warsaw', timezone: 'Europe/Warsaw', country: 'Poland', region: 'Europe' },
    { city: 'Prague', timezone: 'Europe/Prague', country: 'Czech Republic', region: 'Europe' },
    { city: 'Budapest', timezone: 'Europe/Budapest', country: 'Hungary', region: 'Europe' },
    { city: 'Moscow', timezone: 'Europe/Moscow', country: 'Russia', region: 'Europe' },
    { city: 'Istanbul', timezone: 'Europe/Istanbul', country: 'Turkey', region: 'Europe' },
    { city: 'Athens', timezone: 'Europe/Athens', country: 'Greece', region: 'Europe' },
    
    // Asia
    { city: 'Tokyo', timezone: 'Asia/Tokyo', country: 'Japan', region: 'Asia' },
    { city: 'Seoul', timezone: 'Asia/Seoul', country: 'South Korea', region: 'Asia' },
    { city: 'Beijing', timezone: 'Asia/Shanghai', country: 'China', region: 'Asia' },
    { city: 'Shanghai', timezone: 'Asia/Shanghai', country: 'China', region: 'Asia' },
    { city: 'Hong Kong', timezone: 'Asia/Hong_Kong', country: 'Hong Kong', region: 'Asia' },
    { city: 'Singapore', timezone: 'Asia/Singapore', country: 'Singapore', region: 'Asia' },
    { city: 'Bangkok', timezone: 'Asia/Bangkok', country: 'Thailand', region: 'Asia' },
    { city: 'Manila', timezone: 'Asia/Manila', country: 'Philippines', region: 'Asia' },
    { city: 'Jakarta', timezone: 'Asia/Jakarta', country: 'Indonesia', region: 'Asia' },
    { city: 'Kuala Lumpur', timezone: 'Asia/Kuala_Lumpur', country: 'Malaysia', region: 'Asia' },
    { city: 'Mumbai', timezone: 'Asia/Kolkata', country: 'India', region: 'Asia' },
    { city: 'Delhi', timezone: 'Asia/Kolkata', country: 'India', region: 'Asia' },
    { city: 'Kolkata', timezone: 'Asia/Kolkata', country: 'India', region: 'Asia' },
    { city: 'Dhaka', timezone: 'Asia/Dhaka', country: 'Bangladesh', region: 'Asia' },
    { city: 'Karachi', timezone: 'Asia/Karachi', country: 'Pakistan', region: 'Asia' },
    { city: 'Dubai', timezone: 'Asia/Dubai', country: 'UAE', region: 'Asia' },
    { city: 'Riyadh', timezone: 'Asia/Riyadh', country: 'Saudi Arabia', region: 'Asia' },
    { city: 'Tel Aviv', timezone: 'Asia/Jerusalem', country: 'Israel', region: 'Asia' },
    { city: 'Tehran', timezone: 'Asia/Tehran', country: 'Iran', region: 'Asia' },
    
    // Africa
    { city: 'Cairo', timezone: 'Africa/Cairo', country: 'Egypt', region: 'Africa' },
    { city: 'Lagos', timezone: 'Africa/Lagos', country: 'Nigeria', region: 'Africa' },
    { city: 'Nairobi', timezone: 'Africa/Nairobi', country: 'Kenya', region: 'Africa' },
    { city: 'Cape Town', timezone: 'Africa/Johannesburg', country: 'South Africa', region: 'Africa' },
    { city: 'Johannesburg', timezone: 'Africa/Johannesburg', country: 'South Africa', region: 'Africa' },
    { city: 'Casablanca', timezone: 'Africa/Casablanca', country: 'Morocco', region: 'Africa' },
    { city: 'Tunis', timezone: 'Africa/Tunis', country: 'Tunisia', region: 'Africa' },
    { city: 'Algiers', timezone: 'Africa/Algiers', country: 'Algeria', region: 'Africa' },
    { city: 'Accra', timezone: 'Africa/Accra', country: 'Ghana', region: 'Africa' },
    { city: 'Addis Ababa', timezone: 'Africa/Addis_Ababa', country: 'Ethiopia', region: 'Africa' },
    
    // Oceania
    { city: 'Sydney', timezone: 'Australia/Sydney', country: 'Australia', region: 'Oceania' },
    { city: 'Melbourne', timezone: 'Australia/Melbourne', country: 'Australia', region: 'Oceania' },
    { city: 'Brisbane', timezone: 'Australia/Brisbane', country: 'Australia', region: 'Oceania' },
    { city: 'Perth', timezone: 'Australia/Perth', country: 'Australia', region: 'Oceania' },
    { city: 'Adelaide', timezone: 'Australia/Adelaide', country: 'Australia', region: 'Oceania' },
    { city: 'Auckland', timezone: 'Pacific/Auckland', country: 'New Zealand', region: 'Oceania' },
    { city: 'Wellington', timezone: 'Pacific/Auckland', country: 'New Zealand', region: 'Oceania' },
    { city: 'Fiji', timezone: 'Pacific/Fiji', country: 'Fiji', region: 'Oceania' },
    { city: 'Honolulu', timezone: 'Pacific/Honolulu', country: 'United States', region: 'Oceania' }
  ];

  const filteredTimezones = allTimezones.filter(tz =>
    tz.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tz.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tz.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getTimeForTimezone = (timezone: string) => {
    return new Date().toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getDateForTimezone = (timezone: string) => {
    return new Date().toLocaleDateString('en-US', {
      timeZone: timezone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeIn12Hour = (timezone: string) => {
    return new Date().toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour12: true,
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getTimeDifference = (timezone: string) => {
    const now = new Date();
    const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    const targetTime = new Date(utc.toLocaleString('en-US', { timeZone: timezone }));
    const localTime = new Date(utc.toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }));
    
    const diff = (targetTime.getTime() - localTime.getTime()) / (1000 * 60 * 60);
    const sign = diff >= 0 ? '+' : '';
    return `${sign}${Math.round(diff)}h`;
  };

  const isBusinessHours = (timezone: string) => {
    const hour = parseInt(getTimeForTimezone(timezone).split(':')[0]);
    return hour >= 9 && hour <= 17;
  };

  const addTimezone = (timezone: string) => {
    if (!selectedTimezones.includes(timezone)) {
      setSelectedTimezones([...selectedTimezones, timezone]);
    }
    setSearchTerm('');
  };

  const removeTimezone = (timezone: string) => {
    setSelectedTimezones(selectedTimezones.filter(tz => tz !== timezone));
  };

  const getTimezoneInfo = (timezone: string) => {
    return allTimezones.find(tz => tz.timezone === timezone);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <Clock className="w-8 h-8 text-indigo-500" />
          World Clock
        </h2>

        {/* Current Local Time */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6 mb-6">
          <div className="text-center">
            <p className="text-indigo-100 mb-2">Your Local Time</p>
            <div className="text-5xl font-bold mb-2">
              {currentTime.toLocaleTimeString('en-US', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
            <p className="text-indigo-100">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <p className="text-indigo-200 text-sm mt-2">
              Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </p>
          </div>
        </div>

        {/* Search and Add Timezone */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search cities, countries, or regions..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          {searchTerm && (
            <div className="mt-2 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
              {filteredTimezones.map((tz, index) => (
                <div
                  key={index}
                  onClick={() => addTimezone(tz.timezone)}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-800">{tz.city}</p>
                      <p className="text-sm text-gray-600">{tz.country} • {tz.region}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      {getTimeIn12Hour(tz.timezone)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {getTimeDifference(tz.timezone)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Time Zones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {selectedTimezones.map((timezone, index) => {
            const info = getTimezoneInfo(timezone);
            if (!info) return null;
            
            return (
              <div
                key={index}
                className={`rounded-lg p-4 shadow-md transition-all duration-300 hover:shadow-lg relative ${
                  isBusinessHours(timezone)
                    ? 'bg-green-50 border-l-4 border-green-500'
                    : 'bg-gray-50 border-l-4 border-gray-300'
                }`}
              >
                <button
                  onClick={() => removeTimezone(timezone)}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-gray-600" />
                  <div className="flex-1 min-w-0 pr-6">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {info.city}
                    </h3>
                    <p className="text-sm text-gray-600">{info.country}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-gray-800">
                    {getTimeIn12Hour(timezone)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {getDateForTimezone(timezone)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {getTimeDifference(timezone)} from local
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      isBusinessHours(timezone)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isBusinessHours(timezone) ? 'Business' : 'After Hours'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Add Popular Cities */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Quick Add Popular Cities
          </h3>
          <div className="flex flex-wrap gap-2">
            {['America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney', 'Europe/Paris', 'Asia/Shanghai', 'America/Los_Angeles', 'Asia/Dubai'].map((timezone) => {
              const info = getTimezoneInfo(timezone);
              if (!info || selectedTimezones.includes(timezone)) return null;
              
              return (
                <button
                  key={timezone}
                  onClick={() => addTimezone(timezone)}
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-800 rounded-lg hover:bg-indigo-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {info.city}
                </button>
              );
            })}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Time Zone Tips
            </h3>
            <ul className="text-blue-700 space-y-2 text-sm">
              <li>• Green cards indicate business hours (9 AM - 5 PM)</li>
              <li>• Time differences are calculated from your local time</li>
              <li>• All times update automatically every second</li>
              <li>• Perfect for scheduling international meetings</li>
              <li>• Click the X to remove unwanted time zones</li>
            </ul>
          </div>

          <div className="bg-yellow-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">
              Quick Reference
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-yellow-700">UTC Time:</span>
                <span className="font-semibold text-yellow-800">
                  {getTimeForTimezone('UTC')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-700">GMT Time:</span>
                <span className="font-semibold text-yellow-800">
                  {getTimeForTimezone('Europe/London')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-700">EST Time:</span>
                <span className="font-semibold text-yellow-800">
                  {getTimeForTimezone('America/New_York')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-700">PST Time:</span>
                <span className="font-semibold text-yellow-800">
                  {getTimeForTimezone('America/Los_Angeles')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldClock;