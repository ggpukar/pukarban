import { ReactNode } from 'react';
// Import ThreeElements to fix JSX.IntrinsicElements errors for React Three Fiber
import { ThreeElements } from '@react-three/fiber';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

export interface SectionProps {
  id: string;
  className?: string;
}

export interface GameProps {
  onClose: () => void;
}

export type ToolType = 'converter' | 'temperature' | 'clock' | 'currency' | 'calculator';

export type ThemeMode = 'dawn' | 'tihar' | 'neon';

export interface NavItem {
  label: string;
  href: string;
}

export interface SocialLink {
  icon: ReactNode;
  url: string;
  label: string;
}