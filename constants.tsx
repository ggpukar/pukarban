import React from 'react';
import { Facebook, Instagram, Github, Linkedin } from 'lucide-react';
import { NavItem, SocialLink } from './types';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Games', href: '#games' },
  { label: 'Tools', href: '#tools' },
  { label: 'Contact', href: '#contact' },
];

export const SOCIAL_LINKS: SocialLink[] = [
  { icon: <Facebook size={24} />, url: 'https://www.facebook.com/pukar.ban.58', label: 'Facebook' },
  { icon: <Instagram size={24} />, url: 'https://www.instagram.com/whisp_eringwillowx0_0/', label: 'Instagram' },
  { icon: <Github size={24} />, url: '#', label: 'GitHub' },
  { icon: <Linkedin size={24} />, url: '#', label: 'LinkedIn' },
];

export const GALLERY_IMAGES = [
  { 
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Swayambhunath_temple_-_an_ancient_religious_architecture_of_Nepal.jpg', 
    title: 'Swayambhunath Stupa (Kathmandu)', 
    coords: [0, 0.5, 0] 
  },
  { 
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Nyatapole_temple%2C_Bhaktapur_Durbar_square.JPG', 
    title: 'Nyatapola Temple (Bhaktapur)', 
    coords: [1.8, 0.1, 0.6] 
  },
  { 
    // Using direct image link derived from the Wiki file page provided
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Phewa_Lake%2C_Pokhara_22.JPG', 
    title: 'Phewa Lake (Pokhara)', 
    coords: [-2.5, -0.5, 1] 
  },
  { 
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Boudhanath_Stupa_Nepal_%28cropped%29.jpg', 
    title: 'Boudhanath Stupa (Kathmandu)', 
    coords: [0.8, 0.2, 0.5] 
  },
  { 
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Nepal_Patan_Durbar_Square_10_%28full_res%29.jpg', 
    title: 'Patan Durbar Square (Lalitpur)', 
    coords: [0.2, -0.2, 0.8] 
  },
  { 
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Pashupatinath_temple_Nepal_2013_01.jpg', 
    title: 'Pashupatinath Temple (Kathmandu)', 
    coords: [0.5, 0.1, 0.2] 
  },
  { 
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/88/Mt._Everest_from_Kalapathar.jpg', 
    title: 'Mount Everest (Nepal Himalayas)', 
    coords: [3.5, 1.5, -1] 
  },
  { 
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Annapurna_Range_from_Manang.jpg', 
    title: 'Annapurna Range (Himalayas)', 
    coords: [-3, 1.2, -1.5] 
  },
  { 
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Kathmandu_und_Bhaktapur_2013-05-11_16-03-39.jpg', 
    title: 'Bhaktapur Durbar Square', 
    coords: [1.5, 0, 0.5] 
  },
  { 
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Sagarmatha_National_Park_Valley.jpg', 
    title: 'Sagarmatha National Park', 
    coords: [3.0, 0.8, -0.5] 
  },
];

// Devanagari numerals for the Nepali watch
export const NEPALI_NUMERALS = ['१२', '१', '२', '३', '४', '५', '६', '७', '८', '९', '१०', '११'];
