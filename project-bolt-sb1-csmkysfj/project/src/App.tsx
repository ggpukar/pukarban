import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import InstallPrompt from './components/InstallPrompt';
import DocumentConverter from './components/tools/DocumentConverter';
import CurrencyExchange from './components/tools/CurrencyExchange';
import ScientificCalculator from './components/tools/ScientificCalculator';
import Notes from './components/tools/Notes';
import Weather from './components/tools/Weather';
import MusicPlayer from './components/tools/MusicPlayer';
import Compass from './components/tools/Compass';
import WorldClock from './components/tools/WorldClock';
import Camera from './components/tools/Camera';

function App() {
  const [currentTool, setCurrentTool] = useState<string | null>(null);

  const handleToolSelect = (toolId: string) => {
    setCurrentTool(toolId);
  };

  const handleBack = () => {
    setCurrentTool(null);
  };

  const renderTool = () => {
    switch (currentTool) {
      case 'converter':
        return <DocumentConverter />;
      case 'currency':
        return <CurrencyExchange />;
      case 'calculator':
        return <ScientificCalculator />;
      case 'notes':
        return <Notes />;
      case 'weather':
        return <Weather />;
      case 'music':
        return <MusicPlayer />;
      case 'compass':
        return <Compass />;
      case 'clock':
        return <WorldClock />;
      case 'camera':
        return <Camera />;
      default:
        return <Dashboard onToolSelect={handleToolSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation
        currentTool={currentTool}
        onBack={handleBack}
        onHome={() => setCurrentTool(null)}
      />
      <main className="py-8">
        {renderTool()}
      </main>
      <InstallPrompt />
    </div>
  );
}

export default App;