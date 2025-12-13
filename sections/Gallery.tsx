import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, X, Save, ChevronLeft, ChevronRight, RefreshCw, 
  Image as ImageIcon, Upload, Trash2, Maximize2, AlertTriangle,
  Video, Zap, ZapOff, Aperture, Circle, StopCircle, Play, Scan,
  Filter, MapPin
} from 'lucide-react';
import { GalleryItem } from '../types';
import { useAppStore } from '../store';

type CameraMode = 'PHOTO' | 'VIDEO' | 'PORTRAIT';
type FlashMode = 'OFF' | 'ON' | 'AUTO';

const ZOOM_LEVELS = [0.6, 1, 3, 5, 10];

export const GallerySection: React.FC = () => {
  // Use Global Store for Images
  const { galleryImages, addGalleryImage, removeGalleryImage } = useAppStore();
  
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Filtering State
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'image' | 'video'>('ALL');
  const [filterLocation, setFilterLocation] = useState<string>('ALL');

  // View State (Lightbox)
  const [viewedImage, setViewedImage] = useState<GalleryItem | null>(null);
  const [hoveredImage, setHoveredImage] = useState<GalleryItem | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // Camera State
  const [cameraOpen, setCameraOpen] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState<{ url: string, type: 'image' | 'video' } | null>(null);
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoLocation, setNewPhotoLocation] = useState('S25 Ultra Cam');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [permissionError, setPermissionError] = useState(false);
  
  // S25 Ultra Features
  const [mode, setMode] = useState<CameraMode>('PHOTO');
  const [zoom, setZoom] = useState(1);
  const [flash, setFlash] = useState<FlashMode>('OFF');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [focusPoint, setFocusPoint] = useState<{x: number, y: number} | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const mainUploadInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Filtering Logic ---
  const uniqueLocations = ['ALL', ...Array.from(new Set(galleryImages.map(img => img.location)))];
  
  const filteredImages = galleryImages.filter(img => {
    const matchType = filterType === 'ALL' || img.type === filterType;
    const matchLocation = filterLocation === 'ALL' || img.location === filterLocation;
    return matchType && matchLocation;
  });

  // Reset active index when filters change to avoid out-of-bounds
  useEffect(() => {
    setActiveIndex(0);
  }, [filterType, filterLocation]);

  // --- Navigation & Deletion ---
  const handleNext = () => {
     if (filteredImages.length === 0) return;
     setActiveIndex((prev) => (prev + 1) % filteredImages.length);
  };

  const handlePrev = () => {
     if (filteredImages.length === 0) return;
     setActiveIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
  };

  const confirmDelete = () => {
    if (deleteTargetId === null) return;
    removeGalleryImage(deleteTargetId);
    setDeleteTargetId(null);
  };

  // --- Camera Core ---
  const startCamera = async () => {
    try {
      if (stream) stream.getTracks().forEach(track => track.stop());
      
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: mode === 'VIDEO',
        video: { 
          facingMode: facingMode,
          width: { ideal: 2560 }, // 2K
          height: { ideal: 1440 },
          frameRate: { ideal: 60 } // 60 FPS
        }
      });
      setStream(newStream);
      setPermissionError(false);
      setTimeout(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = newStream;
        }
      }, 100);
    } catch (err) {
      console.error("Camera error", err);
      setPermissionError(true);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    if (cameraOpen && !capturedMedia) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [cameraOpen, capturedMedia, facingMode, mode]); // Re-init on mode change for Audio permissions

  // --- Focus System ---
  const handleTapToFocus = (e: React.MouseEvent | React.TouchEvent) => {
    if (!videoRef.current) return;
    const rect = videoRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    setFocusPoint({ x, y });
    
    // Auto clear focus reticle after 2s
    setTimeout(() => setFocusPoint(null), 2000);
  };

  // --- Photo Capture with AI Processing Sim ---
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsProcessing(true); // "AI Processing" UI

    // Simulate AI ISP delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set high res canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // 1. Draw Base
      if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
      }
      
      // 2. Apply Mode Effects
      if (mode === 'PORTRAIT') {
          // Draw blurred background
          ctx.filter = 'blur(8px) contrast(1.1)';
          ctx.drawImage(video, 0, 0);
          ctx.filter = 'none';
          
          // Draw sharp center (Simulated depth)
          ctx.save();
          ctx.beginPath();
          // Assume center focus for portrait or use tap point
          const cx = canvas.width / 2;
          const cy = canvas.height / 2;
          const r = Math.min(canvas.width, canvas.height) * 0.4;
          
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(video, 0, 0);
          ctx.restore();

          // Add a vignette for drama
          const grad = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, r * 1.5);
          grad.addColorStop(0, 'rgba(0,0,0,0)');
          grad.addColorStop(1, 'rgba(0,0,0,0.4)');
          ctx.fillStyle = grad;
          ctx.fillRect(0,0, canvas.width, canvas.height);

      } else {
          // Standard Photo processing (Sharpening sim via contrast)
          ctx.filter = 'contrast(1.1) saturate(1.1)';
          ctx.drawImage(video, 0, 0);
      }
      
      if (facingMode === 'user') ctx.setTransform(1, 0, 0, 1, 0, 0);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setCapturedMedia({ url: dataUrl, type: 'image' });
    }
    setIsProcessing(false);
  };

  // --- Video Recording ---
  const toggleRecording = () => {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
  };

  const startRecording = () => {
    if (!stream) return;
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setCapturedMedia({ url, type: 'video' });
    };

    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = window.setInterval(() => {
        setRecordingTime(t => t + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const saveToGallery = () => {
    if (!capturedMedia) return;
    const newItem: GalleryItem = {
      id: Date.now(),
      url: capturedMedia.url,
      title: newPhotoTitle.trim() || (capturedMedia.type === 'video' ? 'New Video' : 'New Photo'),
      location: newPhotoLocation.trim() || 'S25 Ultra Cam',
      type: capturedMedia.type
    };
    addGalleryImage(newItem);
    // Reset filters to show new item if possible, or leave as is
    setFilterType('ALL'); 
    setFilterLocation('ALL');
    setActiveIndex(galleryImages.length); // Point to new item
    closeCamera();
  };

  const closeCamera = () => {
      setCameraOpen(false); 
      setCapturedMedia(null); 
      setNewPhotoTitle('');
      setNewPhotoLocation('S25 Ultra Cam');
      setIsRecording(false);
      setRecordingTime(0);
      if (timerRef.current) clearInterval(timerRef.current);
      stopCamera(); 
  };

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCapturedMedia({ 
            url: ev.target?.result as string, 
            type: file.type.startsWith('video') ? 'video' : 'image' 
        });
        setNewPhotoLocation('Local Upload');
        setCameraOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col justify-center px-4 relative overflow-hidden bg-[#0a0a0a]">
      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-30 pt-20 pointer-events-none bg-gradient-to-b from-black/80 to-transparent">
        <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 pointer-events-auto">
            Gallery
        </h2>
        <div className="flex gap-2 pointer-events-auto">
           <button 
             onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)} 
             className={`p-3 rounded-full hover:bg-white/20 transition-all ${isFilterPanelOpen ? 'bg-blue-600 text-white' : 'bg-white/10 text-white'}`}
             title="Filter Gallery"
           >
              <Filter size={20} />
           </button>
           <button onClick={() => mainUploadInputRef.current?.click()} className="p-3 bg-white/10 rounded-full hover:bg-white/20 text-white"><Upload size={20}/></button>
           <button onClick={() => setCameraOpen(true)} className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform"><Camera size={20}/> Camera</button>
        </div>
      </div>
      <input ref={mainUploadInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileUpload} />

      {/* Filter Panel */}
      <AnimatePresence>
        {isFilterPanelOpen && (
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="absolute top-32 left-0 w-full z-20 bg-black/80 backdrop-blur-xl border-b border-white/10 overflow-hidden shadow-2xl"
            >
                <div className="p-6 max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
                    {/* Type Filter */}
                    <div>
                       <h4 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest">Media Type</h4>
                       <div className="flex gap-2">
                          {['ALL', 'image', 'video'].map(type => (
                              <button
                                 key={type}
                                 onClick={() => setFilterType(type as any)}
                                 className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all border ${filterType === type ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'}`}
                              >
                                 {type === 'ALL' ? 'All Types' : type === 'image' ? 'Photos' : 'Videos'}
                              </button>
                          ))}
                       </div>
                    </div>

                    {/* Location Filter */}
                     <div>
                       <h4 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest">Location</h4>
                       <div className="flex flex-wrap gap-2">
                          {uniqueLocations.map(loc => (
                              <button
                                 key={loc}
                                 onClick={() => setFilterLocation(loc)}
                                 className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all border ${filterLocation === loc ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'}`}
                              >
                                 {loc === 'ALL' ? 'Everywhere' : loc}
                              </button>
                          ))}
                       </div>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Gallery View */}
      <div className="relative w-full h-[600px] flex items-center justify-center z-10" style={{ perspective: '1200px' }}>
        {filteredImages.length === 0 ? (
            <div className="text-center text-gray-500 z-50 bg-black/50 p-8 rounded-2xl backdrop-blur-md border border-white/10">
                <p className="text-xl mb-4 font-bold text-white">No items found</p>
                <p className="text-sm mb-6">Try adjusting your filters or add new media.</p>
                {galleryImages.length === 0 && (
                    <button onClick={() => setCameraOpen(true)} className="px-6 py-2 bg-blue-600 text-white rounded-full pointer-events-auto">Open Camera</button>
                )}
            </div>
        ) : (
            <>
                {filteredImages.map((img, index) => {
                    let offset = index - activeIndex;
                    const count = filteredImages.length;
                    
                    if (count > 1) { // Loop logic for filtered list
                       if (offset > count/2) offset -= count;
                       else if (offset < -count/2) offset += count;
                    }
                    
                    const isActive = offset === 0;
                    const absOffset = Math.abs(offset);
                    const isVisible = absOffset <= 2;

                    return (
                        <motion.div
                            key={img.id}
                            className={`absolute w-[280px] sm:w-[320px] h-[450px] sm:h-[500px] rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/10 ${isActive ? 'z-20' : 'z-10'}`}
                            animate={{
                                x: offset * 260, 
                                z: -absOffset * 100, 
                                rotateY: offset * -25, 
                                scale: 1 - absOffset * 0.1, 
                                opacity: isVisible ? 1 : 0
                            }}
                            transition={{ type: "spring", stiffness: 150, damping: 20 }}
                            style={{ pointerEvents: isVisible ? 'auto' : 'none', transformStyle: 'preserve-3d' }}
                            onClick={() => isActive ? setViewedImage(img) : setActiveIndex(index)}
                            onMouseEnter={() => !cameraOpen && setHoveredImage(img)}
                            onMouseLeave={() => setHoveredImage(null)}
                        >
                             <div className="w-full h-full relative">
                                {img.type === 'video' ? (
                                    <video src={img.url} className="w-full h-full object-cover opacity-80" muted loop autoPlay playsInline />
                                ) : (
                                    <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                                )}
                                {/* Overlay Info */}
                                <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black to-transparent">
                                    <h3 className="text-white font-bold text-xl truncate">{img.title}</h3>
                                    <p className="text-gray-400 text-sm flex items-center gap-1"><MapPin size={12} className="text-blue-400"/> {img.location}</p>
                                </div>
                                {isActive && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setDeleteTargetId(img.id); }}
                                        className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-red-400 hover:bg-black/80 transition-colors border border-white/5"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                             </div>
                        </motion.div>
                    );
                })}
                
                {filteredImages.length > 1 && (
                    <>
                        <button onClick={handlePrev} className="absolute left-4 z-30 p-4 bg-white/5 rounded-full hover:bg-white/20 border border-white/5"><ChevronLeft/></button>
                        <button onClick={handleNext} className="absolute right-4 z-30 p-4 bg-white/5 rounded-full hover:bg-white/20 border border-white/5"><ChevronRight/></button>
                    </>
                )}
            </>
        )}
      </div>

      {/* Hover Preview Overlay */}
      <AnimatePresence>
        {hoveredImage && !viewedImage && !cameraOpen && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[45] pointer-events-none"
            >
                <div className="relative rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.8)] border border-white/20 bg-black/90 p-1">
                     {hoveredImage.type === 'video' ? (
                         <video src={hoveredImage.url} autoPlay muted loop className="max-w-[600px] max-h-[60vh] object-contain rounded-xl" />
                     ) : (
                         <img src={hoveredImage.url} alt={hoveredImage.title} className="max-w-[600px] max-h-[60vh] object-contain rounded-xl" />
                     )}
                     <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-md p-3 rounded-lg border border-white/10">
                        <p className="text-white font-bold text-sm">{hoveredImage.title}</p>
                        <p className="text-gray-300 text-xs uppercase tracking-widest">{hoveredImage.location}</p>
                     </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteTargetId !== null && (
            <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
                <div className="bg-gray-900 p-6 rounded-2xl max-w-sm w-full border border-white/10 text-center">
                    <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Delete Item?</h3>
                    <div className="flex gap-4 mt-6">
                        <button onClick={() => setDeleteTargetId(null)} className="flex-1 py-2 bg-white/10 rounded-lg">Cancel</button>
                        <button onClick={confirmDelete} className="flex-1 py-2 bg-red-600 rounded-lg">Delete</button>
                    </div>
                </div>
            </div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {viewedImage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[50] bg-black flex items-center justify-center" onClick={() => setViewedImage(null)}>
                <button className="absolute top-6 right-6 p-4 text-white z-50"><X size={32}/></button>
                {viewedImage.type === 'video' ? (
                    <video src={viewedImage.url} controls autoPlay className="max-w-full max-h-[90vh] rounded-lg" />
                ) : (
                    <img src={viewedImage.url} alt={viewedImage.title} className="max-w-full max-h-[90vh] rounded-lg object-contain" />
                )}
            </motion.div>
        )}
      </AnimatePresence>

      {/* ULTRA CAMERA UI */}
      <AnimatePresence>
        {cameraOpen && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'tween', duration: 0.3 }} className="fixed inset-0 z-[70] bg-black flex flex-col">
            
            {/* Top Bar (Settings) */}
            <div className="h-20 flex justify-between items-center px-6 bg-black/40 backdrop-blur-sm z-20 absolute top-0 w-full">
               <button onClick={closeCamera} className="p-2 rounded-full bg-black/20 text-white"><X size={24}/></button>
               
               {!capturedMedia && (
                   <div className="flex gap-6">
                       <button onClick={() => setFlash(f => f === 'ON' ? 'OFF' : 'ON')} className={`p-2 rounded-full ${flash === 'ON' ? 'text-yellow-400' : 'text-white'}`}>
                           {flash === 'ON' ? <Zap size={24} fill="currentColor"/> : <ZapOff size={24}/>}
                       </button>
                       <div className="flex items-center gap-1 text-xs font-bold bg-gray-800 px-3 py-1 rounded-full text-yellow-500 border border-yellow-500/30">
                           <Scan size={14}/> 200MP
                       </div>
                   </div>
               )}
            </div>

            {/* Viewfinder */}
            <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center" onClick={handleTapToFocus}>
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Processing Overlay */}
                {isProcessing && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4" />
                        <span className="text-yellow-500 font-bold tracking-widest text-sm animate-pulse">AI PROCESSING</span>
                    </div>
                )}

                {capturedMedia ? (
                    capturedMedia.type === 'video' ? (
                        <video src={capturedMedia.url} controls className="w-full h-full object-contain" />
                    ) : (
                        <img src={capturedMedia.url} className="w-full h-full object-contain" />
                    )
                ) : permissionError ? (
                     <div className="text-white text-center">Camera Permission Denied</div>
                ) : (
                    <>
                        {/* Live Feed */}
                        <video 
                            ref={videoRef}
                            autoPlay 
                            playsInline
                            muted
                            className={`w-full h-full object-cover transition-transform duration-500`}
                            style={{ 
                                transform: `scale(${zoom}) ${facingMode === 'user' ? 'scaleX(-1)' : ''}`,
                                filter: mode === 'PORTRAIT' ? 'contrast(1.1)' : 'none' // Preview effect
                            }}
                        />
                        
                        {/* Grid Lines */}
                        <div className="absolute inset-0 pointer-events-none opacity-20">
                            <div className="w-full h-1/3 border-t border-b border-white absolute top-1/3" />
                            <div className="h-full w-1/3 border-l border-r border-white absolute left-1/3" />
                        </div>

                        {/* Focus Reticle */}
                        {focusPoint && (
                            <div 
                                className="absolute w-16 h-16 border-2 border-yellow-400 rounded-full transition-opacity duration-500 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                                style={{ left: focusPoint.x, top: focusPoint.y }}
                            >
                                <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-ping" />
                            </div>
                        )}

                        {/* Recording Timer */}
                        {isRecording && (
                            <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-red-600/90 text-white px-4 py-1 rounded-full font-mono font-bold animate-pulse flex items-center gap-2">
                                <div className="w-3 h-3 bg-white rounded-full" /> {formatTime(recordingTime)}
                            </div>
                        )}
                        
                        {/* Portrait Mode Hint */}
                        {mode === 'PORTRAIT' && !isRecording && (
                            <div className="absolute bottom-40 left-1/2 -translate-x-1/2 bg-black/50 text-yellow-400 text-xs px-3 py-1 rounded-full uppercase tracking-widest border border-yellow-400/20">
                                Depth Effect Ready
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Bottom Controls (S25 Ultra Style) */}
            <div className="bg-black/90 pb-8 pt-4 relative z-20">
                {capturedMedia ? (
                    // Review Mode Controls
                    <div className="flex flex-col gap-4 px-8">
                         <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-xs text-gray-500 ml-2 mb-1 block">Title</label>
                                <input 
                                    type="text" 
                                    placeholder="Add a title..." 
                                    value={newPhotoTitle} 
                                    onChange={e => setNewPhotoTitle(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-yellow-500"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-500 ml-2 mb-1 block">Location</label>
                                <input 
                                    type="text" 
                                    placeholder="Where was this?" 
                                    value={newPhotoLocation} 
                                    onChange={e => setNewPhotoLocation(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-yellow-500"
                                />
                            </div>
                         </div>
                         <div className="flex gap-4 h-16">
                            <button onClick={() => { setCapturedMedia(null); setIsRecording(false); }} className="flex-1 bg-gray-800 rounded-xl font-bold text-white hover:bg-gray-700">Discard</button>
                            <button onClick={saveToGallery} className="flex-1 bg-yellow-500 text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-yellow-400"><Save size={20}/> Save</button>
                         </div>
                    </div>
                ) : (
                    // Capture Mode Controls
                    <>
                         {/* Zoom Selector */}
                         <div className="flex justify-center gap-4 mb-6">
                            {ZOOM_LEVELS.map(z => (
                                <button 
                                    key={z} 
                                    onClick={() => setZoom(z)}
                                    className={`w-10 h-10 rounded-full text-xs font-bold transition-all ${zoom === z ? 'bg-white text-black scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'bg-gray-800/80 text-white hover:bg-gray-700'}`}
                                >
                                    {z}x
                                </button>
                            ))}
                         </div>

                         {/* Mode Selector */}
                         <div className="flex justify-center gap-8 mb-8 text-sm font-bold tracking-widest overflow-x-auto px-8 no-scrollbar">
                            {['VIDEO', 'PHOTO', 'PORTRAIT'].map((m) => (
                                <button 
                                    key={m}
                                    onClick={() => { setMode(m as CameraMode); setZoom(1); }}
                                    className={`transition-colors ${mode === m ? 'text-yellow-400' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    {m}
                                </button>
                            ))}
                         </div>

                         {/* Shutter Area */}
                         <div className="flex items-center justify-between px-10">
                            {/* Gallery Preview / Upload */}
                            <button onClick={() => fileInputRef.current?.click()} className="w-14 h-14 rounded-xl bg-gray-800 border border-gray-600 overflow-hidden relative group">
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400"><ImageIcon size={24}/></div>
                            </button>
                            <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileUpload} />

                            {/* Shutter Button */}
                            <div className="relative">
                                <button 
                                    onClick={mode === 'VIDEO' ? toggleRecording : capturePhoto}
                                    className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all duration-200 active:scale-90 ${
                                        mode === 'VIDEO' 
                                            ? (isRecording ? 'border-red-500' : 'border-white')
                                            : (mode === 'PORTRAIT' ? 'border-yellow-400' : 'border-white')
                                    }`}
                                >
                                    <div className={`rounded-full transition-all duration-300 ${
                                        mode === 'VIDEO'
                                            ? (isRecording ? 'w-8 h-8 bg-red-500 rounded-sm' : 'w-16 h-16 bg-red-600')
                                            : (mode === 'PORTRAIT' ? 'w-16 h-16 bg-yellow-400' : 'w-16 h-16 bg-white')
                                    }`} />
                                </button>
                            </div>

                            {/* Camera Switch */}
                            <button onClick={() => setFacingMode(m => m === 'user' ? 'environment' : 'user')} className="w-14 h-14 rounded-full bg-gray-800/50 flex items-center justify-center text-white hover:bg-gray-700 transition-colors">
                                <RefreshCw size={24} />
                            </button>
                         </div>
                    </>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
