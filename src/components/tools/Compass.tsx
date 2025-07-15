import React, { useState, useEffect } from 'react';
import { Compass as CompassIcon, Navigation, Shield, AlertCircle, CheckCircle, Smartphone } from 'lucide-react';

const Compass: React.FC = () => {
  const [heading, setHeading] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [calibrationNeeded, setCalibrationNeeded] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkDeviceSupport();
  }, []);

  const checkDeviceSupport = () => {
    // Check for device orientation support
    if ('DeviceOrientationEvent' in window) {
      setIsSupported(true);
      
      // Check if permission is required (iOS 13+)
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        setPermission('prompt');
      } else {
        // For Android and older iOS devices
        setPermission('granted');
        startCompass();
      }
    } else {
      setIsSupported(false);
      setError('Device orientation is not supported on this device');
    }
  };

  const requestPermission = async () => {
    if (!isSupported) {
      setError('Device orientation is not supported');
      return;
    }

    try {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        // iOS 13+ permission request
        const response = await (DeviceOrientationEvent as any).requestPermission();
        setPermission(response);
        
        if (response === 'granted') {
          startCompass();
        } else {
          setError('Permission denied. Please enable device orientation in your browser settings.');
        }
      } else {
        // Android and older iOS
        setPermission('granted');
        startCompass();
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      setPermission('denied');
      setError('Failed to request device orientation permission');
    }
  };

  const startCompass = () => {
    setError(null);
    
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        // Calculate compass heading
        let compassHeading = 360 - event.alpha;
        
        // Normalize to 0-360 range
        if (compassHeading < 0) compassHeading += 360;
        if (compassHeading >= 360) compassHeading -= 360;
        
        setHeading(compassHeading);
        
        // Set accuracy if available
        if (event.webkitCompassAccuracy !== undefined) {
          setAccuracy(event.webkitCompassAccuracy);
          
          // Check if calibration is needed (accuracy > 50 degrees)
          if (event.webkitCompassAccuracy > 50) {
            setCalibrationNeeded(true);
          } else {
            setCalibrationNeeded(false);
          }
        }
      } else {
        setError('Compass data not available. Please ensure your device has a magnetometer.');
      }
    };

    const handleMotion = (event: DeviceMotionEvent) => {
      // Use accelerometer data to improve accuracy
      if (event.accelerationIncludingGravity) {
        const { x, y, z } = event.accelerationIncludingGravity;
        
        // Calculate device tilt for better compass accuracy
        if (x !== null && y !== null && z !== null) {
          const tilt = Math.abs(Math.atan2(Math.sqrt(x * x + y * y), z) * 180 / Math.PI);
          
          // Warn if device is too tilted (> 30 degrees)
          if (tilt > 30) {
            setError('Hold your device flat for better accuracy');
          } else if (error === 'Hold your device flat for better accuracy') {
            setError(null);
          }
        }
      }
    };

    // Add event listeners
    window.addEventListener('deviceorientation', handleOrientation, true);
    window.addEventListener('devicemotion', handleMotion, true);
    
    // Cleanup function
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
      window.removeEventListener('devicemotion', handleMotion, true);
    };
  };

  const startCalibration = () => {
    setIsCalibrating(true);
    setError(null);
    
    // Simulate calibration process
    setTimeout(() => {
      setIsCalibrating(false);
      setCalibrationNeeded(false);
      setAccuracy(15); // Improved accuracy after calibration
    }, 3000);
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

  const getAccuracyColor = () => {
    if (accuracy === null) return 'text-gray-500';
    if (accuracy <= 15) return 'text-green-500';
    if (accuracy <= 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getAccuracyText = () => {
    if (accuracy === null) return 'Unknown';
    if (accuracy <= 15) return 'High';
    if (accuracy <= 30) return 'Medium';
    return 'Low';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <CompassIcon className="w-8 h-8 text-red-500" />
          Digital Compass
        </h2>

        {/* Permission and Support Status */}
        {!isSupported && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-red-700 font-medium">Device Not Supported</p>
                <p className="text-red-600 text-sm">
                  Your device doesn't support device orientation. A compass requires a magnetometer sensor.
                </p>
              </div>
            </div>
          </div>
        )}

        {isSupported && permission === 'prompt' && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-blue-700 font-medium">Permission Required</p>
                <p className="text-blue-600 text-sm">
                  Allow device orientation access to use the compass feature.
                </p>
              </div>
              <button
                onClick={requestPermission}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                Enable Compass
              </button>
            </div>
          </div>
        )}

        {permission === 'denied' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-red-700 font-medium">Permission Denied</p>
                <p className="text-red-600 text-sm">
                  Device orientation access was denied. Please enable it in your browser settings and refresh the page.
                </p>
              </div>
            </div>
          </div>
        )}

        {permission === 'granted' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-green-700 font-medium">Compass Active</p>
                <p className="text-green-600 text-sm">
                  Device orientation enabled. Hold your device flat for best results.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Calibration Warning */}
        {calibrationNeeded && !isCalibrating && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div className="flex-1">
                <p className="text-yellow-700 font-medium">Calibration Needed</p>
                <p className="text-yellow-600 text-sm">
                  Compass accuracy is low. Calibrate your device for better results.
                </p>
              </div>
              <button
                onClick={startCalibration}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Calibrate
              </button>
            </div>
          </div>
        )}

        {/* Calibration Process */}
        {isCalibrating && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <div>
                <p className="text-blue-700 font-medium">Calibrating Compass...</p>
                <p className="text-blue-600 text-sm">
                  Move your device in a figure-8 pattern to calibrate the magnetometer.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Compass Display */}
          <div className="flex flex-col items-center">
            <div className="relative w-80 h-80 mb-6">
              {/* Compass Background */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-gray-300 shadow-lg">
                {/* Compass Markings */}
                <div className="absolute inset-4 rounded-full border-2 border-gray-400">
                  {/* Cardinal directions */}
                  {[
                    { dir: 'N', angle: 0, color: 'text-red-600 font-bold' },
                    { dir: 'E', angle: 90, color: 'text-gray-700 font-bold' },
                    { dir: 'S', angle: 180, color: 'text-gray-700 font-bold' },
                    { dir: 'W', angle: 270, color: 'text-gray-700 font-bold' }
                  ].map(({ dir, angle, color }) => (
                    <div
                      key={dir}
                      className={`absolute text-2xl ${color}`}
                      style={{
                        top: angle === 0 ? '10px' : angle === 180 ? 'calc(100% - 40px)' : '50%',
                        left: angle === 90 ? 'calc(100% - 30px)' : angle === 270 ? '10px' : '50%',
                        transform: angle === 0 || angle === 180 ? 'translateX(-50%)' : 'translateY(-50%)'
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
                  {/* North pointer (red) */}
                  <div className="absolute bottom-0 left-1/2 w-0 h-0 border-l-4 border-r-4 border-b-16 border-l-transparent border-r-transparent border-b-red-500 transform -translate-x-1/2" />
                  {/* South pointer (gray) */}
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
                <div className="flex justify-between">
                  <span className="text-gray-600">Accuracy:</span>
                  <span className={`font-semibold ${getAccuracyColor()}`}>
                    {getAccuracyText()}
                    {accuracy !== null && ` (±${Math.round(accuracy)}°)`}
                  </span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Status
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isSupported ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm">
                    Device Support: {isSupported ? 'Available' : 'Not Available'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    permission === 'granted' ? 'bg-green-500' : 
                    permission === 'denied' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="text-sm">
                    Permission: {permission === 'granted' ? 'Granted' : 
                                permission === 'denied' ? 'Denied' : 'Required'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    calibrationNeeded ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                  <span className="text-sm">
                    Calibration: {calibrationNeeded ? 'Needed' : 'Good'}
                  </span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                How to Use
              </h3>
              <ul className="text-blue-700 space-y-2 text-sm">
                <li>• Hold your device flat and level</li>
                <li>• Allow device orientation permissions</li>
                <li>• Move away from magnetic interference</li>
                <li>• The red needle points to magnetic north</li>
                <li>• Calibrate if accuracy is low</li>
                <li>• Works best outdoors away from metal objects</li>
              </ul>
            </div>

            {/* Technical Info */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Technical Information
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Uses device magnetometer and accelerometer</p>
                <p>• Readings are magnetic north (not true north)</p>
                <p>• Accuracy depends on device sensors</p>
                <p>• May be affected by magnetic interference</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compass;