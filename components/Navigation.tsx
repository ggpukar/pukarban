import React from 'react';
import { Home, Image, User, Gamepad2, Wrench, Mail, Headphones } from 'lucide-react';
import { useAppStore } from '../store';
import { AppSection } from '../types';

export const Navigation: React.FC = () => {
  const { activeSection, setActiveSection } = useAppStore();

  const navItems = [
    { id: AppSection.HOME, icon: Home, label: 'Home' },
    { id: AppSection.GALLERY, icon: Image, label: 'Gallery' },
    { id: AppSection.MULTIMEDIA, icon: Headphones, label: 'Media' },
    { id: AppSection.ABOUT, icon: User, label: 'About' },
    { id: AppSection.GAMES, icon: Gamepad2, label: 'Games' },
    { id: AppSection.TOOLS, icon: Wrench, label: 'Tools' },
    { id: AppSection.CONTACT, icon: Mail, label: 'Contact' },
  ];

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      // We also set state immediately for visual feedback, 
      // although the IntersectionObserver in App.tsx will also update it.
      setActiveSection(id as AppSection);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl overflow-x-auto max-w-[95vw] no-scrollbar">
      <div className="flex items-center gap-2 sm:gap-4 min-w-max">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleScrollTo(item.id)}
            className={`p-3 rounded-full transition-all duration-300 relative group ${
              activeSection === item.id 
                ? 'bg-white/20 text-white scale-110' 
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <item.icon size={20} />
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
