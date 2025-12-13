import React, { useEffect, useRef } from 'react';
import { useAppStore } from './store';
import { AppSection } from './types';
import { Loader } from './components/Loader';
import { Navigation } from './components/Navigation';
import { BackgroundScene } from './components/3d/Scene';
import { LoginPage } from './components/LoginPage';

// Sections
import { HomeSection } from './sections/Home';
import { GallerySection } from './sections/Gallery';
import { AboutSection } from './sections/About';
import { GamesSection } from './sections/Games';
import { ToolsSection } from './sections/Tools';
import { ContactSection } from './sections/Contact';
import { MultimediaSection } from './sections/Multimedia';

const App: React.FC = () => {
  const { isLoading, isAuthenticated, setActiveSection } = useAppStore();
  const mainRef = useRef<HTMLElement>(null);

  // Scroll Spy Logic
  useEffect(() => {
    if (isLoading || !isAuthenticated || !mainRef.current) return;

    const observerOptions = {
      root: mainRef.current, // Observe scrolling within main container
      threshold: 0.25 // Trigger when 25% of section is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id as AppSection);
        }
      });
    }, observerOptions);

    Object.values(AppSection).forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [isLoading, isAuthenticated, setActiveSection]);

  return (
    <div className="relative w-full h-full text-white overflow-hidden">
      {/* 3D Background */}
      <BackgroundScene />
      
      {/* Loading Screen Overlay */}
      <Loader />

      {/* Main Content Area */}
      {!isLoading && (
        <>
          {!isAuthenticated ? (
            <LoginPage />
          ) : (
            <main 
              ref={mainRef} 
              className="relative z-10 w-full h-full overflow-y-auto overflow-x-hidden scroll-smooth"
            >
              <section id={AppSection.HOME} className="min-h-screen w-full">
                <HomeSection />
              </section>
              <section id={AppSection.GALLERY} className="min-h-screen w-full">
                <GallerySection />
              </section>
              <section id={AppSection.MULTIMEDIA} className="min-h-screen w-full">
                <MultimediaSection />
              </section>
              <section id={AppSection.ABOUT} className="min-h-screen w-full">
                <AboutSection />
              </section>
              <section id={AppSection.GAMES} className="min-h-screen w-full">
                <GamesSection />
              </section>
              <section id={AppSection.TOOLS} className="min-h-screen w-full">
                <ToolsSection />
              </section>
              <section id={AppSection.CONTACT} className="min-h-screen w-full">
                <ContactSection />
              </section>
              
              {/* Bottom Navigation Dock */}
              <Navigation />
            </main>
          )}
        </>
      )}
    </div>
  );
};

export default App;
