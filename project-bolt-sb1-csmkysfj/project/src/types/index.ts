export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'productivity' | 'utility' | 'media' | 'system';
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  category?: string;
}

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

export interface CurrencyRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: Date;
}

export interface WorldClock {
  id: string;
  city: string;
  timezone: string;
  time: string;
  date: string;
}