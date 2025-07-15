import React, { useState, useEffect } from 'react';
import { Compass as CompassIcon, Navigation } from 'lucide-react';

const Compass: React.FC = () => {
  const [heading, setHeading] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  useEffect(() => {
    // Check if DeviceOrientationEvent is supported
    if ('DeviceOrientationEvent' in window) {
      setIsSupported(true);
      
      // Request permission for iOS 13+
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        (DeviceOrientationEvent as any).requestPermission()
          .then((response: string) => {
            setPermission(response as 'granted' | 'denied');
            if (response === 'granted') {
              startListening();
            }
          })
          .catch(() => setPermission('denied'));
      } else {
        // For non-iOS devices
        setPermission('granted');
        startListening();
      }
    }
  }, []);

  const startListening = () => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        setHeading(360 - event.alpha);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  };

  const requestPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        setPermission(response);
        if (response === 'granted') {
          startListening();
        }
      } catch (error) {
        setPermission('denied');
      }
    }
  };

  const getDirection = (heading: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(heading / 45) % 8;
    return directions[index];
  };

  const getDirectionName = (heading: number) => {
    const directions = [
      'North', 'Northeast', 'East', 'Southeast',
      'South', 'Southwest', 'West', 'Northwest'
    ];
    const index = Math.round(heading / 45) % 8;
    return directions[index];
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <CompassIcon className="w-8 h-8 text-red-500" />
          Digital Compass
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Compass Display */}
          <div className="flex flex-col items-center">
            <div className="relative w-80 h-80 mb-6">
              {/* Compass Background */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-gray-300 shadow-lg">
                {/* Compass Markings */}
                <div className="absolute inset-4 rounded-full border-2 border-gray-400">
                  {/* Cardinal directions */}
                  {['N', 'E', 'S', 'W'].map((dir, index) => (
                    <div
                      key={dir}
                      className="absolute text-2xl font-bold text-gray-700"
                      style={{
                        top: index === 0 ? '10px' : index === 2 ? 'calc(100% - 40px)' : '50%',
                        left: index === 1 ? 'calc(100% - 30px)' : index === 3 ? '10px' : '50%',
                        transform: index === 0 || index === 2 ? 'translateX(-50%)' : 'translateY(-50%)'
                      }}
                    >
                      {dir}
                    </div>
                  ))}
                  
                  {/* Degree markings */}
                  {Array.from({ length: 72 }, (_, i) => {
                    const angle = i * 5;
                    const isMainDirection = angle % 90 === 0;
                    const isMinorDirection = angle % 30 === 0;
                    
                    return (
                      <div
                        key={i}
                        className="absolute bg-gray-600 origin-bottom"
                        style={{
                          height: isMainDirection ? '20px' : isMinorDirection ? '15px' : '10px',
                          width: isMainDirection ? '3px' : '2px',
                          left: '50%',
                          top: '8px',
                          transform: `translateX(-50%) rotate(${angle}deg)`,
                          transformOrigin: '50% 140px'
                        }}
                      />
                    );
                  })}
                </div>
                
                {/* Compass Needle */}
                <div
                  className="absolute top-1/2 left-1/2 w-1 h-32 origin-bottom transition-transform duration-300"
                  style={{
                    transform: `translate(-50%, -100%) rotate(${heading}deg)`
                  }}
                >
                  <div className="absolute bottom-0 left-1/2 w-0 h-0 border-l-4 border-r-4 border-b-16 border-l-transparent border-r-transparent border-b-red-500 transform -translate-x-1/2" />
                  <div className="absolute top-0 left-1/2 w-0 h-0 border-l-4 border-r-4 border-t-16 border-l-transparent border-r-transparent border-t-gray-700 transform -translate-x-1/2" />
                </div>
                
                {/* Center dot */}
                <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-gray-800 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Direction Info */}
            <div className="text-center">
              <div className="text-6xl font-bold text-red-500 mb-2">
                {getDirection(heading)}
              </div>
              <div className="text-xl text-gray-600 mb-4">
                {getDirectionName(heading)}
              </div>
              <div className="text-3xl font-mono text-gray-800">
                {Math.round(heading)}°
              </div>
            </div>
          </div>

          {/* Information Panel */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Compass Information
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Heading:</span>
                  <span className="font-semibold">{Math.round(heading)}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Direction:</span>
                  <span className="font-semibold">{getDirectionName(heading)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cardinal Point:</span>
                  <span className="font-semibold">{getDirection(heading)}</span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Status
              </h3>
              
              {!isSupported && (
                <div className="text-red-600 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Device orientation not supported
                </div>
              )}
              
              {isSupported && permission === 'denied' && (
                <div className="text-red-600 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Permission denied
                </div>
              )}
              
              {isSupported && permission === 'prompt' && (
                <div className="space-y-3">
                  <div className="text-yellow-600 flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    Permission required
                  </div>
                  <button
                    onClick={requestPermission}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Enable Compass
                  </button>
                </div>
              )}
              
              {isSupported && permission === 'granted' && (
                <div className="text-green-600 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Compass active
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                How to Use
              </h3>
              <ul className="text-blue-700 space-y-2 text-sm">
                <li>• Hold your device flat and level</li>
                <li>• Allow location and orientation permissions</li>
                <li>• Move away from magnetic interference</li>
                <li>• The red needle points to magnetic north</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compass;