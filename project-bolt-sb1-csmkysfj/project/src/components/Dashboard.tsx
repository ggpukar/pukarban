import React from 'react';
import { 
  FileText, 
  DollarSign, 
  Calculator, 
  StickyNote, 
  Cloud, 
  Music, 
  Compass, 
  Clock, 
  Camera 
} from 'lucide-react';
import { Tool } from '../types';

interface DashboardProps {
  onToolSelect: (toolId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onToolSelect }) => {
  const tools: Tool[] = [
    {
      id: 'converter',
      name: 'Document Converter',
      description: 'Convert between different document formats',
      icon: 'FileText',
      color: 'bg-blue-500',
      category: 'productivity'
    },
    {
      id: 'currency',
      name: 'Currency Exchange',
      description: 'Real-time currency exchange rates',
      icon: 'DollarSign',
      color: 'bg-green-500',
      category: 'utility'
    },
    {
      id: 'calculator',
      name: 'Scientific Calculator',
      description: 'Advanced mathematical calculations',
      icon: 'Calculator',
      color: 'bg-purple-500',
      category: 'utility'
    },
    {
      id: 'notes',
      name: 'Notes',
      description: 'Create and manage your notes',
      icon: 'StickyNote',
      color: 'bg-yellow-500',
      category: 'productivity'
    },
    {
      id: 'weather',
      name: 'Weather',
      description: 'Check current weather conditions',
      icon: 'Cloud',
      color: 'bg-cyan-500',
      category: 'utility'
    },
    {
      id: 'music',
      name: 'Music Player',
      description: 'Play and manage your music',
      icon: 'Music',
      color: 'bg-pink-500',
      category: 'media'
    },
    {
      id: 'compass',
      name: 'Compass',
      description: 'Digital compass for navigation',
      icon: 'Compass',
      color: 'bg-red-500',
      category: 'utility'
    },
    {
      id: 'clock',
      name: 'World Clock',
      description: 'Time zones and world clock',
      icon: 'Clock',
      color: 'bg-indigo-500',
      category: 'utility'
    },
    {
      id: 'camera',
      name: 'Camera',
      description: 'Take photos and videos',
      icon: 'Camera',
      color: 'bg-orange-500',
      category: 'media'
    }
  ];

  const getIcon = (iconName: string) => {
    const icons = {
      FileText,
      DollarSign,
      Calculator,
      StickyNote,
      Cloud,
      Music,
      Compass,
      Clock,
      Camera
    };
    return icons[iconName as keyof typeof icons] || FileText;
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          All-in-One Utility Hub
        </h1>
        <p className="text-gray-600">
          Your complete toolkit in one place
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => {
          const IconComponent = getIcon(tool.icon);
          return (
            <div
              key={tool.id}
              onClick={() => onToolSelect(tool.id)}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-gray-100"
            >
              <div className="p-6">
                <div className={`w-16 h-16 ${tool.color} rounded-lg flex items-center justify-center mb-4`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {tool.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {tool.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;