
export enum AppSection {
  HOME = 'HOME',
  GALLERY = 'GALLERY',
  ABOUT = 'ABOUT',
  GAMES = 'GAMES',
  TOOLS = 'TOOLS',
  CONTACT = 'CONTACT',
  MULTIMEDIA = 'MULTIMEDIA'
}

export interface GameItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface GalleryItem {
  id: number;
  url: string;
  title: string;
  location: string;
  filter?: string;
  type?: 'image' | 'video';
}

export interface MusicItem {
  id: string;
  title: string;
  artist: string;
  source: string;
  url: string;
  cover: string;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  source: string;
  url: string;
  thumbnail: string;
}

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  icon: string;
}

export interface WeatherData {
  temp: number;
  condition: string;
  description: string;
  city: string;
  country: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  timezone: number; // Offset in seconds from UTC
}
