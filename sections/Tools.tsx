import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, DollarSign, Globe, FileText, X, Upload, Download, RefreshCw, Search, Wind, Droplets, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { getWeather, getExchangeRates } from '../utils/helpers';
import { WeatherData } from '../types';

// --- SUB-COMPONENTS ---

// 1. Document & Image Converter Tool
const DocConverter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState('pdf');
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setDownloadUrl(null);
      setProgress(0);
      
      // Smart default format selection
      if (selectedFile.type.startsWith('image/')) {
        // If it's an image, default to PNG unless it is PNG then JPG
        setFormat(selectedFile.type.includes('png') ? 'jpg' : 'png');
      } else {
        setFormat('pdf');
      }
    }
  };

  const handleConvert = () => {
    if (!file) return;
    setConverting(true);
    setProgress(0);

    // Simulation of conversion process
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setConverting(false);
          // Create a dummy blob for download simulation
          const blob = new Blob([`Converted content of ${file.name} to ${format.toUpperCase()}`], { type: 'text/plain' });
          setDownloadUrl(URL.createObjectURL(blob));
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const isImage = file?.type.startsWith('image/');

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-blue-500/50 transition-colors relative">
        <input 
          type="file" 
          accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.svg,.gif,.webp"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Upload className="mx-auto mb-4 text-gray-400" size={48} />
        {file ? (
          <div>
            <p className="text-xl font-bold text-white">{file.name}</p>
            <p className="text-sm text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
          </div>
        ) : (
          <p className="text-gray-400">Drag & Drop or Click to Upload (Docs & Images)</p>
        )}
      </div>

      {file && (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-xl">
           <div className="flex items-center gap-2">
              <span className="text-gray-400">Convert to:</span>
              <select 
                value={format} 
                onChange={(e) => setFormat(e.target.value)}
                className="bg-black border border-white/20 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
              >
                {isImage ? (
                    <>
                        <option value="png">PNG</option>
                        <option value="jpg">JPG</option>
                        <option value="jpeg">JPEG</option>
                        <option value="svg">SVG</option>
                        <option value="gif">GIF</option>
                        <option value="webp">WEBP</option>
                        <option value="pdf">PDF</option>
                        <option value="ico">ICO</option>
                    </>
                ) : (
                    <>
                        <option value="pdf">PDF</option>
                        <option value="docx">DOCX</option>
                        <option value="txt">TXT</option>
                        <option value="html">HTML</option>
                    </>
                )}
              </select>
           </div>
           <button 
             onClick={handleConvert}
             disabled={converting || !!downloadUrl}
             className="px-6 py-2 bg-blue-600 rounded-lg font-bold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
           >
             {converting ? 'Converting...' : 'Convert File'}
           </button>
        </div>
      )}

      {converting && (
        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
          <div className="bg-blue-500 h-full transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>
      )}

      {downloadUrl && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-500/20 border border-green-500/50 p-4 rounded-xl flex items-center justify-between">
           <div className="flex items-center gap-2 text-green-400">
             <CheckCircle size={20}/> 
             <span>Conversion Complete</span>
           </div>
           <a 
             href={downloadUrl} 
             download={`converted_file.${format}`}
             className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-500"
           >
             <Download size={18}/> Download
           </a>
        </motion.div>
      )}
    </div>
  );
};

// 2. Weather Tool
const WeatherTool = () => {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    const data = await getWeather(query);
    if (data) {
      setWeather(data);
    } else {
      setError('City not found. Please try again.');
      setWeather(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    setQuery('Kathmandu');
    getWeather('Kathmandu').then(setWeather);
  }, []);

  return (
    <div className="space-y-6">
       <form onSubmit={handleSearch} className="flex gap-2">
         <input 
           value={query}
           onChange={(e) => setQuery(e.target.value)}
           placeholder="Search city (e.g. London, Tokyo)"
           className="flex-1 bg-black/30 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-all"
         />
         <button type="submit" disabled={loading} className="bg-blue-600 p-3 rounded-xl hover:bg-blue-500 disabled:opacity-50">
           {loading ? <RefreshCw className="animate-spin" /> : <Search />}
         </button>
       </form>

       {error && <div className="p-4 bg-red-500/20 text-red-300 rounded-xl border border-red-500/30 text-center">{error}</div>}

       {weather && (
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gradient-to-br from-blue-900/50 to-slate-900/50 p-6 rounded-2xl border border-white/10">
           <div className="flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="text-center md:text-left">
                <h2 className="text-4xl font-bold text-white mb-1">{weather.city}</h2>
                <p className="text-gray-400 text-lg">{weather.country}</p>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-4 bg-white/10 w-fit px-4 py-1 rounded-full mx-auto md:mx-0">
                  <span className="capitalize">{weather.description}</span>
                </div>
             </div>
             
             <div className="flex flex-col items-center">
               <img 
                 src={`http://openweathermap.org/img/wn/${weather.icon}@4x.png`} 
                 alt={weather.condition}
                 className="w-32 h-32 -my-4 drop-shadow-2xl"
               />
               <div className="text-6xl font-bold">{weather.temp}°</div>
             </div>
           </div>

           <div className="grid grid-cols-2 gap-4 mt-8">
             <div className="bg-black/30 p-4 rounded-xl flex items-center gap-3">
               <Wind className="text-blue-400" />
               <div>
                 <p className="text-xs text-gray-500">Wind Speed</p>
                 <p className="font-bold">{weather.windSpeed} m/s</p>
               </div>
             </div>
             <div className="bg-black/30 p-4 rounded-xl flex items-center gap-3">
               <Droplets className="text-blue-400" />
               <div>
                 <p className="text-xs text-gray-500">Humidity</p>
                 <p className="font-bold">{weather.humidity}%</p>
               </div>
             </div>
           </div>
         </motion.div>
       )}
    </div>
  );
};

// 3. World Clock Tool (Fixed Analog + Search)
const ClockTool = () => {
  const [cityQuery, setCityQuery] = useState('Kathmandu');
  const [location, setLocation] = useState<{name: string, country: string, offset: number}>({
    name: 'Kathmandu', country: 'NP', offset: 20700 // +5:45 default
  });
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date());

  // Search Logic
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityQuery.trim()) return;
    setLoading(true);
    // Use existing weather API to fetch timezone data for a city
    const data = await getWeather(cityQuery);
    if (data) {
      setLocation({
        name: data.city,
        country: data.country,
        offset: data.timezone
      });
    }
    setLoading(false);
  };

  // Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate local time for the target city
  // 1. Get current UTC time (ms) = local time (ms) + (timezone offset in min * 60000)
  // 2. Target time (ms) = UTC time + (target offset in sec * 1000)
  const utc = time.getTime() + (time.getTimezoneOffset() * 60000);
  const targetDate = new Date(utc + (location.offset * 1000));

  const hours = targetDate.getHours();
  const minutes = targetDate.getMinutes();
  const seconds = targetDate.getSeconds();

  // Analog Hands Degree
  const hDeg = (hours % 12) * 30 + minutes / 2;
  const mDeg = minutes * 6;
  const sDeg = seconds * 6;

  return (
    <div className="space-y-8 flex flex-col items-center">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="w-full flex gap-2">
         <input 
           value={cityQuery}
           onChange={(e) => setCityQuery(e.target.value)}
           placeholder="Search city (e.g. New York, Sydney)..."
           className="flex-1 bg-black/30 border border-white/20 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-all"
         />
         <button type="submit" disabled={loading} className="bg-purple-600 p-3 rounded-xl hover:bg-purple-500 disabled:opacity-50">
            {loading ? <RefreshCw className="animate-spin" /> : <Search />}
         </button>
      </form>

      {/* Analog Clock */}
      <div className="relative w-72 h-72 rounded-full bg-gradient-to-br from-gray-800 to-black border-8 border-gray-700 shadow-2xl flex items-center justify-center">
         {/* Bezel Ring */}
         <div className="absolute inset-0 rounded-full border-2 border-white/10" />
         
         {/* Hour Markers */}
         {[...Array(12)].map((_, i) => (
           <div 
             key={i} 
             className="absolute inset-0"
             style={{ transform: `rotate(${i * 30}deg)` }}
           >
             <div className="mx-auto mt-2 w-1.5 h-4 bg-white/80 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
           </div>
         ))}

         {/* Minute Ticks */}
         {[...Array(60)].map((_, i) => (
           i % 5 !== 0 && (
            <div 
                key={i} 
                className="absolute inset-0"
                style={{ transform: `rotate(${i * 6}deg)` }}
            >
                <div className="mx-auto mt-2 w-0.5 h-1.5 bg-white/30 rounded-full" />
            </div>
           )
         ))}

         {/* Center Pin */}
         <div className="absolute w-4 h-4 bg-white rounded-full z-20 shadow-md ring-2 ring-gray-900" />
         
         {/* Hour Hand */}
         <div 
             className="absolute w-2 bg-white rounded-full origin-bottom z-10 shadow-lg"
             style={{ 
                 height: '25%', 
                 bottom: '50%',
                 transform: `rotate(${hDeg}deg)` 
             }} 
         />
         
         {/* Minute Hand */}
         <div 
             className="absolute w-1.5 bg-gray-300 rounded-full origin-bottom z-10 shadow-lg"
             style={{ 
                 height: '35%', 
                 bottom: '50%',
                 transform: `rotate(${mDeg}deg)` 
             }} 
         />
         
         {/* Second Hand */}
         <div 
             className="absolute w-0.5 bg-red-500 rounded-full origin-bottom z-10"
             style={{ 
                 height: '40%', 
                 bottom: '50%',
                 transform: `rotate(${sDeg}deg)` 
             }} 
         />
         {/* Second Hand Tail */}
         <div 
             className="absolute w-0.5 bg-red-500 rounded-full origin-top z-10"
             style={{ 
                 height: '10%', 
                 top: '50%',
                 transform: `rotate(${sDeg}deg)` 
             }} 
         />
      </div>

      {/* Digital Info */}
      <div className="text-center bg-white/5 p-6 rounded-2xl border border-white/10 w-full">
         <div className="text-6xl font-mono font-bold tracking-widest text-white mb-2">
           {targetDate.toLocaleTimeString('en-US', { hour12: false })}
         </div>
         <h3 className="text-2xl font-bold text-purple-400">{location.name}</h3>
         <p className="text-gray-500 font-medium">{location.country}</p>
         <p className="text-sm text-gray-600 mt-2 uppercase tracking-widest">
            {targetDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
         </p>
      </div>
    </div>
  );
};

// 4. Currency Tool
const CurrencyTool = () => {
  const [amount, setAmount] = useState(1);
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('NPR');
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExchangeRates().then(data => {
      setRates(data);
      setLoading(false);
    });
  }, []);

  const result = rates ? (amount / rates[from]) * rates[to] : 0;
  const currencies = rates ? Object.keys(rates) : ['USD', 'NPR', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-end">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">From</label>
          <select 
             value={from} onChange={e => setFrom(e.target.value)}
             className="w-full bg-black/30 border border-white/20 rounded-xl px-3 py-3 outline-none"
             disabled={loading}
          >
            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="pb-3 text-gray-500">
           <ArrowRight size={20} />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">To</label>
          <select 
             value={to} onChange={e => setTo(e.target.value)}
             className="w-full bg-black/30 border border-white/20 rounded-xl px-3 py-3 outline-none"
             disabled={loading}
          >
            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
         <label className="text-xs text-gray-500 mb-1 block">Amount</label>
         <div className="relative">
           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
           <input 
             type="number" 
             value={amount}
             onChange={e => setAmount(Number(e.target.value))}
             className="w-full bg-black/30 border border-white/20 rounded-xl pl-8 pr-4 py-4 text-xl font-bold outline-none focus:border-green-500 transition-colors"
           />
         </div>
      </div>

      <div className="bg-emerald-900/30 border border-emerald-500/30 p-6 rounded-2xl text-center">
         <p className="text-gray-400 mb-2">Converted Amount</p>
         {loading ? (
           <div className="h-10 w-32 bg-emerald-500/20 animate-pulse rounded mx-auto" />
         ) : (
           <div className="text-4xl font-bold text-emerald-400">
             {result.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-lg">{to}</span>
           </div>
         )}
         <p className="text-xs text-gray-500 mt-2">1 {from} = {(rates?.[to] / rates?.[from] || 0).toFixed(4)} {to}</p>
      </div>
    </div>
  );
};

// --- MAIN SECTION ---

const TOOLS = [
  { id: 'doc', name: 'Doc & Img Converter', icon: FileText, color: 'text-orange-400', bg: 'bg-orange-500/10', component: DocConverter },
  { id: 'weather', name: 'Weather', icon: Cloud, color: 'text-blue-400', bg: 'bg-blue-500/10', component: WeatherTool },
  { id: 'clock', name: 'World Clock', icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/10', component: ClockTool },
  { id: 'currency', name: 'Currency', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10', component: CurrencyTool },
];

export const ToolsSection: React.FC = () => {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);

  const ActiveComponent = TOOLS.find(t => t.id === activeToolId)?.component;

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-6 pt-20">
      <h2 className="text-4xl font-bold mb-12 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
        Utilities
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {TOOLS.map((tool, i) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -5 }}
            onClick={() => setActiveToolId(tool.id)}
            className="bg-gray-900/50 backdrop-blur-sm border border-white/10 p-6 rounded-3xl cursor-pointer group hover:bg-gray-800/80 transition-all shadow-xl hover:shadow-2xl hover:border-blue-500/30"
          >
             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${tool.bg} ${tool.color} group-hover:scale-110 transition-transform`}>
               <tool.icon size={28} />
             </div>
             <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{tool.name}</h3>
             <p className="text-gray-400 text-sm">Click to open tool</p>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {activeToolId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setActiveToolId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                   {TOOLS.find(t => t.id === activeToolId)?.icon && React.createElement(TOOLS.find(t => t.id === activeToolId)!.icon, { className: "text-blue-400" })}
                   <h3 className="text-xl font-bold">{TOOLS.find(t => t.id === activeToolId)?.name}</h3>
                </div>
                <button onClick={() => setActiveToolId(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                 {ActiveComponent && <ActiveComponent />}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};