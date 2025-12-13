import { WeatherData } from '../types';

// Robust Nepali Date Converter (Approximation for Display)
// Removing external dependency to prevent load crashes.
export const getNepaliDate = (): string => {
  try {
    const date = new Date();
    // Rough calculation: AD + 56 years, ~8.5 months offset
    // This is a display-only approximation to ensure stability
    const enYear = date.getFullYear();
    const enMonth = date.getMonth(); // 0-11
    const enDay = date.getDate();

    const npYear = enMonth > 3 || (enMonth === 3 && enDay > 13) ? enYear + 57 : enYear + 56;
    
    // Simple month mapping based on typical mid-month start
    const npMonths = [
      "Baishakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin", 
      "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
    ];
    
    // Calculate index offset (mid-April start)
    // April (3) -> Baishakh (0)
    let monthIndex = (enMonth - 3 + 12) % 12;
    if (enDay < 14) { 
       monthIndex = (monthIndex - 1 + 12) % 12;
    }

    const npMonth = npMonths[monthIndex];
    
    // Day approximation (just for visual reference, not calendar accurate)
    // 1-1 mapping with offset of ~14 days
    let npDay = enDay > 13 ? enDay - 13 : enDay + 17;
    if (npDay > 30) npDay -= 30;

    return `${npDay} ${npMonth} ${npYear}`;
  } catch (error) {
    return "Nepali Date";
  }
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
};

// Real Weather API
export const getWeather = async (city: string = 'Kathmandu'): Promise<WeatherData | null> => {
  try {
    const API_KEY = 'dc17d4347af673fe4ccce73b04182645';
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`);
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return { 
      temp: Math.round(data.main.temp), 
      condition: data.weather[0].main,
      description: data.weather[0].description,
      city: data.name,
      country: data.sys.country,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      icon: data.weather[0].icon,
      timezone: data.timezone // Seconds from UTC
    };
  } catch (error) {
    console.error("Weather API Error:", error);
    return null;
  }
};

// Live Currency API
export const getExchangeRates = async (base: string = 'USD') => {
  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${base}`);
    if (!response.ok) throw new Error('Failed to fetch rates');
    const data = await response.json();
    return data.rates;
  } catch (error) {
    console.error("Currency API Error:", error);
    return null;
  }
};

export const convertCurrency = (amount: number, from: string, to: string): number => {
  const rates: Record<string, number> = {
    USD: 1,
    NPR: 133.5,
    EUR: 0.92,
    GBP: 0.79
  };
  const inUSD = amount / (rates[from] || 1);
  return inUSD * (rates[to] || 1);
};
