import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Music, Film, Youtube, Disc, Loader2,
  Upload, Maximize2, Minimize2, Info, Trash2
} from 'lucide-react';
import ReactPlayer from 'react-player';
import { useAppStore } from '../store';
import { MusicItem, VideoItem } from '../types';

// Fix: ReactPlayer type definitions can be tricky or mismatched
const ReactPlayerAny = ReactPlayer as any;

// --- COMPONENTS ---

const LegalNotice = () => (
  <div className="flex items-start gap-2 p-3 bg-gray-900/80 rounded-lg border border-white/5 text-[10px] text-gray-500 mt-4">
    <Info size={14} className="shrink-0 mt-0.5" />
    <p>Media streamed via official platforms or local upload for personal use only. All rights belong to their respective owners.</p>
  </div>
);

const MusicPlayer = () => {
  const { musicPlaylist, addMusicTrack, removeMusicTrack } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const playerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Safety: Ensure playlist exists
  const safePlaylist = musicPlaylist || [];
  const currentTrack = safePlaylist[currentIndex];

  // Safety check if current index is out of bounds after deletion
  useEffect(() => {
    if (currentIndex >= safePlaylist.length && safePlaylist.length > 0) {
        setCurrentIndex(0);
    }
  }, [currentIndex, safePlaylist.length]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      const newTrack: MusicItem = {
        id: `local-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: "Local Upload",
        source: "Local",
        url: url,
        cover: ""
      };
      addMusicTrack(newTrack);
      setCurrentIndex(0); // Play new track
      setIsPlaying(true);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      removeMusicTrack(id);
      if (safePlaylist.length <= 1) setIsPlaying(false);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    playerRef.current?.seekTo(percent);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const date = new Date(seconds * 1000);
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  if (safePlaylist.length === 0) {
     return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4 border border-white/10">
                <Music size={32} className="text-gray-500"/>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Music Library Empty</h3>
            <p className="text-gray-400 mb-6 max-w-sm">Upload your own music tracks to start playing. Your tracks will be saved.</p>
            <button
               onClick={() => fileInputRef.current?.click()}
               className="px-6 py-3 bg-[#DC143C] text-white rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-lg"
            >
                <Upload size={20}/> Upload Audio
            </button>
            <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
        </div>
     );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col md:flex-row gap-8 flex-1 min-h-0">
        
        {/* Left: Player Card */}
        <div className="flex-1 flex flex-col gap-6 items-center justify-center">
          <div className="w-full max-w-md bg-gradient-to-br from-gray-900 to-black rounded-[2rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
             {/* Decorative Nepali Border/Glow */}
             <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-[#DC143C] to-blue-600" />
             <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-[#DC143C] to-blue-600" />
             
             {currentTrack && (
                 <div className="flex flex-col items-center justify-center py-4 relative z-10">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      key={currentTrack.id}
                      className="w-56 h-56 rounded-full border-8 border-gray-800 shadow-[0_0_30px_rgba(220,20,60,0.3)] overflow-hidden mb-8 relative"
                    >
                       {currentTrack.cover ? (
                         <img src={currentTrack.cover} className={`w-full h-full object-cover ${isPlaying ? 'animate-[spin_20s_linear_infinite]' : ''}`} alt="Art" />
                       ) : (
                         <div className="w-full h-full bg-gray-800 flex items-center justify-center"><Disc size={64} className="text-gray-600"/></div>
                       )}
                    </motion.div>

                    <h2 className="text-2xl font-bold text-white text-center line-clamp-1 px-4">{currentTrack.title}</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-[#DC143C] font-bold text-sm uppercase tracking-wider">{currentTrack.artist}</span>
                        <span className="text-gray-600 text-xs">•</span>
                        <span className="text-gray-500 text-xs bg-white/10 px-2 py-0.5 rounded">{currentTrack.source}</span>
                    </div>
                 </div>
             )}

             {/* Hidden Player */}
             <div className="hidden">
                {currentTrack && (
                    <ReactPlayerAny
                      ref={playerRef}
                      url={currentTrack.url}
                      playing={isPlaying}
                      volume={volume}
                      onProgress={(p: any) => setPlayed(p.played)}
                      onDuration={setDuration}
                      onBuffer={() => setIsLoading(true)}
                      onBufferEnd={() => setIsLoading(false)}
                      onEnded={() => {
                         const next = (currentIndex + 1) % safePlaylist.length;
                         setCurrentIndex(next);
                      }}
                      config={{ 
                        youtube: { playerVars: { showinfo: 0, origin: window.location.origin } },
                        file: { forceAudio: true }
                      }}
                    />
                )}
             </div>

             {/* Controls */}
             <div className="mt-6">
                <div 
                  className="w-full h-1.5 bg-gray-800 rounded-full cursor-pointer mb-2 relative group/seek"
                  onClick={handleSeek}
                >
                   <div className="absolute inset-0 bg-[#DC143C] rounded-full" style={{ width: `${played * 100}%` }} />
                   <div className="absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover/seek:opacity-100 transition-opacity" style={{ left: `${played * 100}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mb-6 font-mono">
                   <span>{formatTime(played * duration)}</span>
                   <span>{formatTime(duration)}</span>
                </div>

                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 group/vol relative w-24">
                      <button onClick={() => setVolume(v => v === 0 ? 0.5 : 0)} className="text-gray-400 hover:text-white">
                         {volume === 0 ? <VolumeX size={20}/> : <Volume2 size={20}/>}
                      </button>
                      <input 
                        type="range" min="0" max="1" step="0.1" value={volume} 
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#DC143C]"
                      />
                   </div>

                   <div className="flex items-center gap-6">
                      <button onClick={() => setCurrentIndex((currentIndex - 1 + safePlaylist.length) % safePlaylist.length)} className="text-gray-300 hover:text-white transition-colors">
                         <SkipBack size={28} fill="currentColor" />
                      </button>
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                      >
                         {isLoading ? <Loader2 size={32} className="animate-spin text-[#DC143C]" /> : (isPlaying ? <Pause size={32} fill="black"/> : <Play size={32} fill="black" className="ml-1"/>)}
                      </button>
                      <button onClick={() => setCurrentIndex((currentIndex + 1) % safePlaylist.length)} className="text-gray-300 hover:text-white transition-colors">
                         <SkipForward size={28} fill="currentColor" />
                      </button>
                   </div>

                   <div className="w-24 text-right">
                        <button 
                           onClick={() => fileInputRef.current?.click()}
                           className="text-gray-400 hover:text-white"
                           title="Upload Local File"
                        >
                            <Upload size={20}/>
                        </button>
                        <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Right: Playlist */}
        <div className="w-full md:w-80 flex flex-col gap-4 min-h-0 bg-gray-900/50 border border-white/5 rounded-2xl p-4 overflow-hidden">
           <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Playlist</h3>
                <span className="text-xs text-gray-600">{safePlaylist.length} Tracks</span>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
              {safePlaylist.map((track, i) => (
                <div 
                  key={`${track.id}-${i}`}
                  onClick={() => { setCurrentIndex(i); setIsPlaying(true); }}
                  className={`relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all group ${currentIndex === i ? 'bg-white/10 border-l-2 border-[#DC143C]' : 'hover:bg-white/5 border-l-2 border-transparent'}`}
                >
                   <div className="relative w-10 h-10 shrink-0">
                        {track.cover ? (
                            <img src={track.cover} className="w-full h-full rounded object-cover" alt="T" />
                        ) : (
                            <div className="w-full h-full bg-gray-800 rounded flex items-center justify-center"><Music size={16} className="text-gray-500"/></div>
                        )}
                        {currentIndex === i && isPlaying && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                                <div className="w-1 h-3 bg-[#DC143C] animate-[bounce_1s_infinite] mx-0.5" />
                                <div className="w-1 h-4 bg-[#DC143C] animate-[bounce_1.2s_infinite] mx-0.5" />
                                <div className="w-1 h-2 bg-[#DC143C] animate-[bounce_0.8s_infinite] mx-0.5" />
                            </div>
                        )}
                   </div>
                   <div className="flex-1 min-w-0 pr-6">
                      <h4 className={`text-sm font-bold truncate ${currentIndex === i ? 'text-white' : 'text-gray-300'}`}>{track.title}</h4>
                      <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                   </div>
                   
                   {/* Delete Button */}
                   <button 
                        onClick={(e) => handleDelete(e, track.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full"
                        title="Delete Track"
                   >
                        <Trash2 size={14} />
                   </button>
                </div>
              ))}
           </div>
           <LegalNotice />
        </div>

      </div>
    </div>
  );
};

const VideoPlayer = () => {
  const { videoPlaylist, addVideoTrack, removeVideoTrack } = useAppStore();
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Safety: Ensure playlist exists
  const safePlaylist = videoPlaylist || [];

  // Sync current video when playlist changes or on init
  useEffect(() => {
    if (!currentVideo && safePlaylist.length > 0) {
        setCurrentVideo(safePlaylist[0]);
    } else if (currentVideo && !safePlaylist.find(v => v.id === currentVideo.id)) {
        setCurrentVideo(safePlaylist.length > 0 ? safePlaylist[0] : null);
    }
  }, [safePlaylist, currentVideo]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      const newVideo: VideoItem = {
        id: `local-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        description: "Local File",
        source: "Local",
        url: url,
        thumbnail: ""
      };
      addVideoTrack(newVideo);
      setCurrentVideo(newVideo);
      setIsPlaying(true);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      removeVideoTrack(id);
  };

  if (!currentVideo) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4 border border-white/10">
                <Film size={32} className="text-gray-500"/>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Video Library Empty</h3>
            <p className="text-gray-400 mb-6 max-w-sm">Upload videos to watch them here. They will be saved to your collection.</p>
            <button
               onClick={() => fileInputRef.current?.click()}
               className="px-6 py-3 bg-blue-600 text-white rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-lg"
            >
                <Upload size={20}/> Upload Video
            </button>
            <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
        </div>
      );
  }

  return (
    <div className="flex flex-col h-full gap-6">
      <div className={`w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative group ${isFullScreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}>
         {/* Decorative Top Line */}
         {!isFullScreen && (
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#DC143C] via-blue-600 to-[#DC143C] z-10 opacity-50" />
         )}
         
         <ReactPlayerAny
            url={currentVideo.url}
            width="100%"
            height="100%"
            playing={isPlaying}
            controls
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            style={{ backgroundColor: 'black' }}
         />

         {isFullScreen && (
            <button onClick={() => setIsFullScreen(false)} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full z-20 hover:bg-black/80">
                <Minimize2 size={24}/>
            </button>
         )}
      </div>

      <div className="flex flex-col md:flex-row gap-8 flex-1 min-h-0">
         <div className="flex-1 overflow-y-auto custom-scrollbar">
             <div className="flex justify-between items-start mb-4">
                 <div>
                    <h2 className="text-2xl font-bold text-white">{currentVideo.title}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="bg-[#DC143C]/20 text-[#DC143C] text-xs font-bold px-2 py-0.5 rounded border border-[#DC143C]/30">{currentVideo.source}</span>
                        {currentVideo.source === 'Local' && <span className="text-xs text-gray-500">File loaded from device</span>}
                    </div>
                 </div>
                 <div className="flex gap-2">
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:text-white hover:bg-gray-700 transition-colors"
                        title="Upload New Video"
                     >
                        <Upload size={20}/>
                     </button>
                     <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:text-white hover:bg-gray-700 hidden md:block">
                        <Maximize2 size={20}/>
                     </button>
                 </div>
                 <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
             </div>
             
             <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-gray-400 text-sm leading-relaxed">
                    {currentVideo.description}
                </p>
             </div>

             <LegalNotice />
         </div>

         <div className="w-full md:w-80 bg-gray-900/50 border border-white/5 rounded-2xl p-4 overflow-hidden flex flex-col">
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 shrink-0">Library</h3>
             <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                {safePlaylist.map((vid, i) => (
                   <div 
                     key={i}
                     onClick={() => { setCurrentVideo(vid); setIsPlaying(true); }}
                     className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all cursor-pointer group relative ${currentVideo.id === vid.id ? 'bg-white/10 border-l-2 border-[#DC143C]' : 'hover:bg-white/5 border-l-2 border-transparent'}`}
                   >
                      <div className="w-16 h-10 rounded bg-gray-800 overflow-hidden shrink-0 relative">
                         {vid.thumbnail ? (
                             <img src={vid.thumbnail} className="w-full h-full object-cover" alt="Thumb" />
                         ) : (
                             <div className="w-full h-full flex items-center justify-center text-gray-500"><Film size={14}/></div>
                         )}
                         {currentVideo.id === vid.id && isPlaying && (
                             <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                 <Play size={12} fill="white" className="text-white"/>
                             </div>
                         )}
                      </div>
                      <div className="min-w-0 pr-6">
                         <p className={`text-sm font-bold truncate ${currentVideo.id === vid.id ? 'text-white' : 'text-gray-300'}`}>{vid.title}</p>
                         <p className="text-[10px] text-gray-500">{vid.source}</p>
                      </div>

                       {/* Delete Button */}
                       <button 
                            onClick={(e) => handleDelete(e, vid.id)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full"
                            title="Delete Video"
                        >
                            <Trash2 size={14} />
                        </button>
                   </div>
                ))}
             </div>
         </div>
      </div>
    </div>
  );
};

export const MultimediaSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'MUSIC' | 'VIDEO'>('MUSIC');

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-6 pt-20">
      <div className="w-full max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
              <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Media Center
              </h2>
              <p className="text-gray-400 text-sm mt-1">Local Playback & Streaming</p>
          </div>
          
          <div className="flex bg-gray-900 rounded-full p-1 border border-white/10 relative">
             <div 
               className="absolute top-1 bottom-1 bg-white/10 rounded-full transition-all duration-300 ease-out"
               style={{ 
                 left: activeTab === 'MUSIC' ? '4px' : '50%', 
                 width: 'calc(50% - 4px)' 
               }} 
             />
            <button 
              onClick={() => setActiveTab('MUSIC')}
              className={`flex items-center justify-center gap-2 px-8 py-2 rounded-full font-bold transition-all relative z-10 w-36 ${activeTab === 'MUSIC' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Music size={16} /> Music
            </button>
            <button 
              onClick={() => setActiveTab('VIDEO')}
              className={`flex items-center justify-center gap-2 px-8 py-2 rounded-full font-bold transition-all relative z-10 w-36 ${activeTab === 'VIDEO' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Youtube size={16} /> Video
            </button>
          </div>
        </div>

        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 min-h-[600px] h-auto flex flex-col shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Background Art with Nepali Colors */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#DC143C]/5 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2" />
          
          {activeTab === 'MUSIC' ? <MusicPlayer /> : <VideoPlayer />}
        </motion.div>
      </div>
    </div>
  );
};
