import React, { useState, useRef, useEffect } from 'react';
import { Camera as CameraIcon, Video, Square, FlipHorizontal, Settings, Download, Palette, Sun, Contrast, Zap, AlertCircle, CheckCircle, Shield } from 'lucide-react';

const Camera: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showEnhancements, setShowEnhancements] = useState(false);
  const [permission, setPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [permissionRequested, setPermissionRequested] = useState(false);
  
  // AI Enhancement settings
  const [enhancements, setEnhancements] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hdr: false,
    colorGrading: 'none',
    aiEnhance: false
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const colorGradingPresets = {
    'none': 'None',
    'warm': 'Warm',
    'cool': 'Cool',
    'vintage': 'Vintage',
    'dramatic': 'Dramatic',
    'natural': 'Natural',
    'cinematic': 'Cinematic'
  };

  // Check if camera is supported
  const isCameraSupported = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  };

  // Request camera permission
  const requestCameraPermission = async () => {
    if (!isCameraSupported()) {
      setError('Camera is not supported on this device');
      setPermission('denied');
      return;
    }

    setPermissionRequested(true);
    setError(null);

    try {
      // First check if permission is already granted
      if ('permissions' in navigator) {
        const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        
        if (cameraPermission.state === 'denied') {
          setPermission('denied');
          setError('Camera permission was previously denied. Please enable it in your browser settings.');
          return;
        }
      }

      // Request camera access
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: true
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setPermission('granted');
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

    } catch (err: any) {
      console.error('Camera access error:', err);
      setPermission('denied');
      
      let errorMessage = 'Unable to access camera. ';
      
      switch (err.name) {
        case 'NotAllowedError':
          errorMessage += 'Camera access was denied. Please allow camera access and try again.';
          break;
        case 'NotFoundError':
          errorMessage += 'No camera found on this device.';
          break;
        case 'NotReadableError':
          errorMessage += 'Camera is already in use by another application.';
          break;
        case 'OverconstrainedError':
          errorMessage += 'Camera constraints could not be satisfied.';
          break;
        case 'SecurityError':
          errorMessage += 'Camera access blocked due to security restrictions.';
          break;
        default:
          errorMessage += 'An unknown error occurred while accessing the camera.';
          break;
      }
      
      setError(errorMessage);
    }
  };

  useEffect(() => {
    // Check permission status on component mount
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'camera' as PermissionName }).then((permission) => {
        if (permission.state === 'granted') {
          setPermission('granted');
          requestCameraPermission();
        } else if (permission.state === 'denied') {
          setPermission('denied');
        }
      });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (permission === 'granted' && stream) {
      applyFilters();
    }
  }, [enhancements, permission, stream]);

  const applyFilters = () => {
    if (videoRef.current) {
      const filters = [];
      
      if (enhancements.brightness !== 0) {
        filters.push(`brightness(${1 + enhancements.brightness / 100})`);
      }
      
      if (enhancements.contrast !== 0) {
        filters.push(`contrast(${1 + enhancements.contrast / 100})`);
      }
      
      if (enhancements.saturation !== 0) {
        filters.push(`saturate(${1 + enhancements.saturation / 100})`);
      }

      // Color grading filters
      switch (enhancements.colorGrading) {
        case 'warm':
          filters.push('sepia(0.3)', 'hue-rotate(10deg)');
          break;
        case 'cool':
          filters.push('hue-rotate(-10deg)', 'saturate(1.1)');
          break;
        case 'vintage':
          filters.push('sepia(0.5)', 'contrast(1.2)', 'brightness(0.9)');
          break;
        case 'dramatic':
          filters.push('contrast(1.3)', 'saturate(1.2)', 'brightness(0.95)');
          break;
        case 'natural':
          filters.push('saturate(1.1)', 'contrast(1.05)');
          break;
        case 'cinematic':
          filters.push('contrast(1.2)', 'saturate(0.9)', 'brightness(0.95)', 'sepia(0.1)');
          break;
      }

      if (enhancements.hdr) {
        filters.push('contrast(1.1)', 'brightness(1.05)', 'saturate(1.1)');
      }

      videoRef.current.style.filter = filters.join(' ');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && stream) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        // Apply enhancements to canvas
        context.filter = video.style.filter;
        context.drawImage(video, 0, 0);
        
        // AI Enhancement simulation (in real app, this would call an AI service)
        if (enhancements.aiEnhance) {
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Simple AI enhancement simulation - noise reduction and sharpening
          for (let i = 0; i < data.length; i += 4) {
            // Enhance colors slightly
            data[i] = Math.min(255, data[i] * 1.05);     // Red
            data[i + 1] = Math.min(255, data[i + 1] * 1.05); // Green
            data[i + 2] = Math.min(255, data[i + 2] * 1.05); // Blue
          }
          
          context.putImageData(imageData, 0, 0);
        }
        
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95);
        setCapturedImage(imageDataUrl);
      }
    }
  };

  const startRecording = () => {
    if (stream) {
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      const chunks: BlobPart[] = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        setRecordedVideo(videoUrl);
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const switchCamera = async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    try {
      const constraints = {
        video: {
          facingMode: newFacingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: true
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error switching camera:', err);
      setError('Failed to switch camera');
    }
  };

  const downloadImage = () => {
    if (capturedImage) {
      const link = document.createElement('a');
      link.download = `enhanced_photo_${new Date().toISOString()}.jpg`;
      link.href = capturedImage;
      link.click();
    }
  };

  const downloadVideo = () => {
    if (recordedVideo) {
      const link = document.createElement('a');
      link.download = `enhanced_video_${new Date().toISOString()}.webm`;
      link.href = recordedVideo;
      link.click();
    }
  };

  const resetEnhancements = () => {
    setEnhancements({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hdr: false,
      colorGrading: 'none',
      aiEnhance: false
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
            <CameraIcon className="w-8 h-8" />
            AI Enhanced Camera
          </h2>
        </div>

        <div className="p-6">
          {/* Permission Status */}
          {!isCameraSupported() && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-red-700 font-medium">Camera Not Supported</p>
                  <p className="text-red-600 text-sm">
                    Your browser or device doesn't support camera access.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isCameraSupported() && permission === 'prompt' && !permissionRequested && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-blue-700 font-medium">Camera Access Required</p>
                  <p className="text-blue-600 text-sm">
                    Allow camera access to take photos and record videos. Your camera data is processed locally and not stored.
                  </p>
                </div>
                <button
                  onClick={requestCameraPermission}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <CameraIcon className="w-4 h-4" />
                  Enable Camera
                </button>
              </div>
            </div>
          )}

          {permission === 'granted' && stream && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-green-700 font-medium">Camera Active</p>
                  <p className="text-green-600 text-sm">
                    Camera access granted. You can now take photos and record videos.
                  </p>
                </div>
              </div>
            </div>
          )}

          {permission === 'denied' && permissionRequested && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-red-700 font-medium">Camera Access Denied</p>
                  <p className="text-red-600 text-sm">
                    To enable camera access: Click the camera icon in your browser's address bar, select "Allow", and refresh the page.
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Camera View */}
            <div className="lg:col-span-2">
              <div className="bg-black rounded-lg overflow-hidden relative">
                {permission === 'granted' && stream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full aspect-video object-cover"
                  />
                ) : (
                  <div className="aspect-video flex items-center justify-center text-white">
                    <div className="text-center">
                      <CameraIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg">
                        {permission === 'prompt' ? 'Click "Enable Camera" to start' : 
                         permission === 'denied' ? 'Camera access denied' : 
                         'Camera not available'}
                      </p>
                      {permission === 'prompt' && !permissionRequested && (
                        <button
                          onClick={requestCameraPermission}
                          className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          Enable Camera
                        </button>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Camera Controls Overlay */}
                {permission === 'granted' && stream && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
                    <button
                      onClick={capturePhoto}
                      className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 hover:bg-gray-100 transition-colors flex items-center justify-center"
                    >
                      <CameraIcon className="w-8 h-8 text-gray-700" />
                    </button>
                    
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-16 h-16 rounded-full border-4 border-white transition-colors flex items-center justify-center ${
                        isRecording 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : 'bg-red-500 hover:bg-red-600'
                      }`}
                    >
                      {isRecording ? (
                        <Square className="w-8 h-8 text-white" />
                      ) : (
                        <Video className="w-8 h-8 text-white" />
                      )}
                    </button>
                    
                    <button
                      onClick={switchCamera}
                      className="w-12 h-12 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-colors flex items-center justify-center"
                    >
                      <FlipHorizontal className="w-6 h-6 text-gray-700" />
                    </button>
                  </div>
                )}

                {/* Enhancement Indicator */}
                {(enhancements.aiEnhance || enhancements.hdr || enhancements.colorGrading !== 'none') && (
                  <div className="absolute top-4 left-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Enhanced
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    stream ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm text-gray-600">
                    {stream ? 'Camera Active' : 'Camera Inactive'}
                  </span>
                </div>
                {isRecording && (
                  <div className="flex items-center gap-2 text-red-500">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm font-semibold">Recording...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Controls and Gallery */}
            <div className="space-y-6">
              {/* AI Enhancement Controls */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    AI Enhancements
                  </h3>
                  <button
                    onClick={() => setShowEnhancements(!showEnhancements)}
                    className="text-sm text-blue-500 hover:text-blue-600"
                  >
                    {showEnhancements ? 'Hide' : 'Show'}
                  </button>
                </div>
                
                {showEnhancements && (
                  <div className="space-y-4">
                    {/* AI Enhancement Toggle */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">AI Enhancement</label>
                      <button
                        onClick={() => setEnhancements(prev => ({ ...prev, aiEnhance: !prev.aiEnhance }))}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          enhancements.aiEnhance ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          enhancements.aiEnhance ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    {/* HDR Toggle */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">HDR</label>
                      <button
                        onClick={() => setEnhancements(prev => ({ ...prev, hdr: !prev.hdr }))}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          enhancements.hdr ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          enhancements.hdr ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    {/* Brightness */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        Brightness: {enhancements.brightness}%
                      </label>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={enhancements.brightness}
                        onChange={(e) => setEnhancements(prev => ({ ...prev, brightness: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    {/* Contrast */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <Contrast className="w-4 h-4" />
                        Contrast: {enhancements.contrast}%
                      </label>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={enhancements.contrast}
                        onChange={(e) => setEnhancements(prev => ({ ...prev, contrast: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    {/* Saturation */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Saturation: {enhancements.saturation}%
                      </label>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={enhancements.saturation}
                        onChange={(e) => setEnhancements(prev => ({ ...prev, saturation: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    {/* Color Grading */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color Grading
                      </label>
                      <select
                        value={enhancements.colorGrading}
                        onChange={(e) => setEnhancements(prev => ({ ...prev, colorGrading: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        {Object.entries(colorGradingPresets).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={resetEnhancements}
                      className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Reset All
                    </button>
                  </div>
                )}
              </div>

              {/* Camera Settings */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Camera Settings
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Camera
                    </label>
                    <select
                      value={facingMode}
                      onChange={(e) => setFacingMode(e.target.value as 'user' | 'environment')}
                      disabled={!stream}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
                    >
                      <option value="user">Front Camera</option>
                      <option value="environment">Back Camera</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Captured Media */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Captured Media
                </h3>
                
                {capturedImage && (
                  <div className="mb-4">
                    <div className="relative">
                      <img
                        src={capturedImage}
                        alt="Captured"
                        className="w-full rounded-lg"
                      />
                      <button
                        onClick={downloadImage}
                        className="absolute top-2 right-2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-colors"
                      >
                        <Download className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Enhanced Photo</p>
                  </div>
                )}
                
                {recordedVideo && (
                  <div className="mb-4">
                    <div className="relative">
                      <video
                        src={recordedVideo}
                        controls
                        className="w-full rounded-lg"
                      />
                      <button
                        onClick={downloadVideo}
                        className="absolute top-2 right-2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-colors"
                      >
                        <Download className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Enhanced Video</p>
                  </div>
                )}
                
                {!capturedImage && !recordedVideo && (
                  <p className="text-gray-500 text-sm">No media captured yet</p>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">
                  AI Features
                </h3>
                <ul className="text-blue-700 space-y-2 text-sm">
                  <li>• AI Enhancement: Automatic noise reduction and sharpening</li>
                  <li>• HDR: High Dynamic Range for better exposure</li>
                  <li>• Color Grading: Professional color presets</li>
                  <li>• Real-time filters with live preview</li>
                  <li>• Enhanced photo and video capture</li>
                </ul>
              </div>

              {/* Privacy Info */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacy & Security
                </h3>
                <ul className="text-green-700 space-y-2 text-sm">
                  <li>• All processing happens locally on your device</li>
                  <li>• No images or videos are uploaded to servers</li>
                  <li>• Camera access can be revoked anytime</li>
                  <li>• Your media stays private and secure</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden canvas for photo processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default Camera;