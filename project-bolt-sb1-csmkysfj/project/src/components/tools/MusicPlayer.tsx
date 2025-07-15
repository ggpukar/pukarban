import React, { useState, useRef, useEffect } from 'react';
import { Music, Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat, Search, Upload, Sliders, Youtube } from 'lucide-react';

const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [currentSong, setCurrentSong] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEqualizer, setShowEqualizer] = useState(false);
  const [localFiles, setLocalFiles] = useState<File[]>([]);

  // Equalizer settings
  const [equalizer, setEqualizer] = useState({
    bass: 0,
    mid: 0,
    treble: 0,
    preset: 'Normal'
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const playlist = [
    {
      id: 1,
      title: "Bohemian Rhapsody",
      artist: "Queen",
      album: "A Night at the Opera",
      duration: "5:55",
      cover: "https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?auto=compress&cs=tinysrgb&w=400",
      source: "online"
    },
    {
      id: 2,
      title: "Stairway to Heaven",
      artist: "Led Zeppelin",
      album: "Led Zeppelin IV",
      duration: "8:02",
      cover: "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=400",
      source: "online"
    },
    {
      id: 3,
      title: "Hotel California",
      artist: "Eagles",
      album: "Hotel California",
      duration: "6:30",
      cover: "https://images.pexels.com/photos/1626481/pexels-photo-1626481.jpeg?auto=compress&cs=tinysrgb&w=400",
      source: "online"
    },
    {
      id: 4,
      title: "Imagine",
      artist: "John Lennon",
      album: "Imagine",
      duration: "3:03",
      cover: "https://images.pexels.com/photos/1407322/pexels-photo-1407322.jpeg?auto=compress&cs=tinysrgb&w=400",
      source: "online"
    },
    {
      id: 5,
      title: "Billie Jean",
      artist: "Michael Jackson",
      album: "Thriller",
      duration: "4:54",
      cover: "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400",
      source: "online"
    }
  ];

  const [allSongs, setAllSongs] = useState(playlist);
  const [filteredSongs, setFilteredSongs] = useState(playlist);

  const equalizerPresets = {
    'Normal': { bass: 0, mid: 0, treble: 0 },
    'Rock': { bass: 3, mid: 1, treble: 2 },
    'Pop': { bass: 2, mid: 0, treble: 3 },
    'Jazz': { bass: 1, mid: 2, treble: 1 },
    'Classical': { bass: -1, mid: 1, treble: 2 },
    'Electronic': { bass: 4, mid: -1, treble: 3 },
    'Hip Hop': { bass: 5, mid: 0, treble: 1 }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  useEffect(() => {
    const filtered = allSongs.filter(song =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.album.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSongs(filtered);
  }, [searchQuery, allSongs]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const audioFiles = files.filter(file => file.type.startsWith('audio/'));
    
    setLocalFiles(prev => [...prev, ...audioFiles]);
    
    const newSongs = audioFiles.map((file, index) => ({
      id: Date.now() + index,
      title: file.name.replace(/\.[^/.]+$/, ""),
      artist: "Local File",
      album: "Local Storage",
      duration: "0:00",
      cover: "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400",
      source: "local" as const,
      file: file
    }));
    
    setAllSongs(prev => [...prev, ...newSongs]);
  };

  const searchYouTube = async () => {
    if (!searchQuery.trim()) return;
    
    // In a real app, you would integrate with YouTube API
    // For demo purposes, we'll simulate search results
    const mockResults = [
      {
        id: Date.now() + 1,
        title: `${searchQuery} - Official Video`,
        artist: "YouTube",
        album: "YouTube Music",
        duration: "3:45",
        cover: "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400",
        source: "youtube" as const,
        url: `https://youtube.com/watch?v=${searchQuery}`
      },
      {
        id: Date.now() + 2,
        title: `${searchQuery} - Live Performance`,
        artist: "YouTube",
        album: "YouTube Music",
        duration: "4:12",
        cover: "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400",
        source: "youtube" as const,
        url: `https://youtube.com/watch?v=${searchQuery}_live`
      }
    ];
    
    setAllSongs(prev => [...prev, ...mockResults]);
    alert(`Found ${mockResults.length} results for "${searchQuery}" on YouTube (Demo)`);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const nextSong = () => {
    if (isShuffling) {
      setCurrentSong(Math.floor(Math.random() * filteredSongs.length));
    } else {
      setCurrentSong((prev) => (prev + 1) % filteredSongs.length);
    }
  };

  const prevSong = () => {
    setCurrentSong((prev) => (prev - 1 + filteredSongs.length) % filteredSongs.length);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = (parseFloat(e.target.value) / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100;
    setVolume(newVolume);
    
    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVolume;
    }
  };

  const applyEqualizerPreset = (preset: string) => {
    const settings = equalizerPresets[preset as keyof typeof equalizerPresets];
    setEqualizer({ ...settings, preset });
  };

  const current = filteredSongs[currentSong] || playlist[0];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
            <Music className="w-8 h-8" />
            Advanced Music Player
          </h2>
        </div>

        <div className="p-6">
          {/* Search and Upload */}
          <div className="mb-6 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search music or artist..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                onKeyPress={(e) => e.key === 'Enter' && searchYouTube()}
              />
            </div>
            <button
              onClick={searchYouTube}
              className="bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <Youtube className="w-5 h-5" />
              YouTube
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload
            </button>
            <button
              onClick={() => setShowEqualizer(!showEqualizer)}
              className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <Sliders className="w-5 h-5" />
              EQ
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Equalizer */}
          {showEqualizer && (
            <div className="mb-6 bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Equalizer</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-4">
                {Object.keys(equalizerPresets).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => applyEqualizerPreset(preset)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      equalizer.preset === preset
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bass</label>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    value={equalizer.bass}
                    onChange={(e) => setEqualizer(prev => ({ ...prev, bass: parseInt(e.target.value), preset: 'Custom' }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm text-gray-600">{equalizer.bass}dB</span>
                </div>
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mid</label>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    value={equalizer.mid}
                    onChange={(e) => setEqualizer(prev => ({ ...prev, mid: parseInt(e.target.value), preset: 'Custom' }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm text-gray-600">{equalizer.mid}dB</span>
                </div>
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Treble</label>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    value={equalizer.treble}
                    onChange={(e) => setEqualizer(prev => ({ ...prev, treble: parseInt(e.target.value), preset: 'Custom' }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm text-gray-600">{equalizer.treble}dB</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Now Playing */}
            <div className="lg:col-span-1">
              <div className="text-center">
                <div className="relative mb-4">
                  <img
                    src={current.cover}
                    alt={current.title}
                    className="w-64 h-64 object-cover rounded-lg mx-auto shadow-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <button
                      onClick={togglePlay}
                      className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      {isPlaying ? (
                        <Pause className="w-8 h-8 text-gray-800" />
                      ) : (
                        <Play className="w-8 h-8 text-gray-800 ml-1" />
                      )}
                    </button>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {current.title}
                </h3>
                <p className="text-gray-600 mb-2">{current.artist}</p>
                <p className="text-sm text-gray-500">{current.album}</p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    current.source === 'local' ? 'bg-blue-100 text-blue-800' :
                    current.source === 'youtube' ? 'bg-red-100 text-red-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {current.source === 'local' ? 'Local' : 
                     current.source === 'youtube' ? 'YouTube' : 'Online'}
                  </span>
                </div>
              </div>
            </div>

            {/* Controls & Playlist */}
            <div className="lg:col-span-2 space-y-6">
              {/* Player Controls */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <button
                    onClick={() => setIsShuffling(!isShuffling)}
                    className={`p-2 rounded-full transition-colors ${
                      isShuffling ? 'bg-purple-500 text-white' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Shuffle className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={prevSong}
                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <SkipBack className="w-6 h-6" />
                  </button>
                  
                  <button
                    onClick={togglePlay}
                    className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 ml-1" />
                    )}
                  </button>
                  
                  <button
                    onClick={nextSong}
                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <SkipForward className="w-6 h-6" />
                  </button>
                  
                  <button
                    onClick={() => setIsRepeating(!isRepeating)}
                    className={`p-2 rounded-full transition-colors ${
                      isRepeating ? 'bg-purple-500 text-white' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Repeat className="w-5 h-5" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={duration ? (currentTime / duration) * 100 : 0}
                    onChange={handleSeek}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{formatTime(currentTime)}</span>
                    <span>{current.duration}</span>
                  </div>
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-3 mt-4">
                  <Volume2 className="w-5 h-5 text-gray-600" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume * 100}
                    onChange={handleVolumeChange}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm text-gray-600 w-10">{Math.round(volume * 100)}%</span>
                </div>
              </div>

              {/* Playlist */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Playlist ({filteredSongs.length} songs)
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredSongs.map((song, index) => (
                    <div
                      key={song.id}
                      onClick={() => setCurrentSong(index)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        index === currentSong
                          ? 'bg-purple-100 border-l-4 border-purple-500'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <img
                        src={song.cover}
                        alt={song.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {song.title}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {song.artist}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-500">
                          {song.duration}
                        </span>
                        <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                          song.source === 'local' ? 'bg-blue-100 text-blue-800' :
                          song.source === 'youtube' ? 'bg-red-100 text-red-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {song.source === 'local' ? 'Local' : 
                           song.source === 'youtube' ? 'YT' : 'Online'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} preload="metadata" />
    </div>
  );
};

export default MusicPlayer;