import React from 'react';
import { Home, ArrowLeft } from 'lucide-react';

interface NavigationProps {
  currentTool: string | null;
  onBack: () => void;
  onHome: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentTool, onBack, onHome }) => {
  const getToolName = (toolId: string) => {
    const toolNames: { [key: string]: string } = {
      'converter': 'Document Converter',
      'currency': 'Currency Exchange',
      'calculator': 'Scientific Calculator',
      'notes': 'Notes',
      'weather': 'Weather',
      'music': 'Music Player',
      'compass': 'Compass',
      'clock': 'World Clock',
      'camera': 'Camera'
    };
    return toolNames[toolId] || toolId;
  };

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={onHome}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="font-semibold">Utility Hub</span>
            </button>
            
            {currentTool && (
              <>
                <span className="text-gray-400">/</span>
                <span className="text-gray-800 font-medium">
                  {getToolName(currentTool)}
                </span>
              </>
            )}
          </div>
          
          {currentTool && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;