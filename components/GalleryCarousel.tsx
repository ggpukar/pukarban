import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float, Text, Sphere } from '@react-three/drei';
import { ChevronLeft, ChevronRight, MapPin, Search, Globe, Layout, X } from 'lucide-react';
import * as THREE from 'three';
import { GALLERY_IMAGES } from '../constants';

/* --- 3D MAP COMPONENTS --- */

interface MapMarkerProps {
  position: number[];
  title: string;
  isSelected: boolean;
  onClick: () => void;
  imgUrl: string;
}

const MapMarker: React.FC<MapMarkerProps> = ({ 
  position, 
  title, 
  isSelected, 
  onClick, 
  imgUrl 
}) => {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if(ref.current) {
      // Bobbing animation
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.5;
      // Rotate if selected
      if (isSelected) {
        ref.current.rotation.y += 0.02;
      }
    }
  });

  return (
    <group ref={ref} position={[position[0], position[1], position[2]]}>
      {/* The Pin */}
      <mesh onClick={(e) => { e.stopPropagation(); onClick(); }} cursor="pointer">
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial 
          color={isSelected ? "#FFD700" : "#DC143C"} 
          emissive={isSelected ? "#FFD700" : "#500000"}
          emissiveIntensity={isSelected ? 0.8 : 0.2}
          wireframe={!isSelected}
        />
      </mesh>
      
      {/* Label / Image Card */}
      {isSelected && (
        <Html position={[0, 0.5, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
          <div className="bg-black/80 backdrop-blur-md border border-gold/50 p-2 rounded-xl w-48 text-center pointer-events-none transform transition-all duration-300">
            <img src={imgUrl} alt={title} className="w-full h-24 object-cover rounded-lg mb-2" />
            <p className="text-white font-bold text-xs">{title}</p>
          </div>
        </Html>
      )}
      
      {/* Ground Shadow */}
      <mesh position={[0, -position[1] - 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.1, 0.2, 16]} />
        <meshBasicMaterial color={isSelected ? "gold" : "red"} transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

const NepalMap3D = ({ 
  selectedIndex, 
  setIndex, 
  images 
}: { 
  selectedIndex: number, 
  setIndex: (i: number) => void, 
  images: typeof GALLERY_IMAGES 
}) => {
  return (
    <Canvas camera={{ position: [0, 5, 8], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#FFD700" />
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={0} 
        maxPolarAngle={Math.PI / 2.2} 
        minDistance={5}
        maxDistance={15}
        autoRotate={false}
      />
      
      {/* Stylized Nepal Terrain Base */}
      <group rotation={[0, 0, 0]}>
        {/* Abstract Grid Map */}
        <gridHelper args={[20, 20, 0x333333, 0x111111]} position={[0, -0.1, 0]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshBasicMaterial color="#020617" transparent opacity={0.8} />
        </mesh>
        
        {/* Stylized Mountain Ranges (Decor) */}
        <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
           <mesh position={[3, 0, -2]} scale={[2, 1.5, 2]}>
              <coneGeometry args={[1, 2, 4]} />
              <meshStandardMaterial color="#1e293b" wireframe />
           </mesh>
           <mesh position={[-3, 0, -1]} scale={[1.5, 1, 1.5]}>
              <coneGeometry args={[1, 2, 4]} />
              <meshStandardMaterial color="#1e293b" wireframe />
           </mesh>
        </Float>
      </group>

      {/* Location Markers */}
      {images.map((img, i) => (
        <MapMarker 
          key={i}
          position={img.coords || [0, 0, 0]}
          title={img.title}
          imgUrl={img.url}
          isSelected={i === selectedIndex}
          onClick={() => setIndex(i)}
        />
      ))}
      
      <Html position={[0, -2, 3]} center>
         <div className="flex gap-2 pointer-events-none opacity-50">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">West</span>
            <div className="w-12 h-px bg-gray-700 self-center"></div>
            <span className="text-[10px] text-gold uppercase tracking-widest font-bold">Nepal 3D Map</span>
            <div className="w-12 h-px bg-gray-700 self-center"></div>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">East</span>
         </div>
      </Html>
    </Canvas>
  );
};

/* --- MAIN GALLERY COMPONENT --- */

const GalleryCarousel: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'carousel' | 'map'>('carousel');

  const filteredImages = useMemo(() => {
    return GALLERY_IMAGES.filter(img => 
      img.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Reset index when search results change to prevent out of bounds
  useEffect(() => {
    setIndex(0);
  }, [searchTerm]);

  const nextSlide = () => {
    if (filteredImages.length === 0) return;
    setIndex((prev) => (prev + 1) % filteredImages.length);
  };

  const prevSlide = () => {
    if (filteredImages.length === 0) return;
    setIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
  };

  const getSlideStyles = (i: number) => {
    const total = filteredImages.length;
    if (total === 0) return {};
    
    // Calculate distance from current index, handling wrap-around
    let diff = (i - index + total) % total;
    if (diff > total / 2) diff -= total;
    
    // Only show center, 1 left, 1 right, and keep others hidden or subtle
    const isCenter = diff === 0;
    const isVisible = Math.abs(diff) <= 1 || (total < 3); // Always show if few items

    return {
      x: `${diff * 110}%`,
      scale: isCenter ? 1 : 0.8,
      opacity: isVisible ? (isCenter ? 1 : 0.5) : 0,
      zIndex: isCenter ? 10 : 5,
      rotateY: isCenter ? 0 : diff * -25,
      filter: isCenter ? 'brightness(1)' : 'brightness(0.4) blur(2px)',
      display: Math.abs(diff) > 2 ? 'none' : 'block'
    };
  };

  return (
    <div className="w-full flex flex-col items-center gap-8">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center w-full max-w-4xl justify-between animate-in fade-in slide-in-from-bottom-4 duration-500 z-20">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Filter places..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-full text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-transparent backdrop-blur-md transition-all hover:bg-white/15"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* View Toggle */}
        <div className="flex bg-black/40 p-1 rounded-full border border-white/10 backdrop-blur-md">
          <button 
            onClick={() => setViewMode('carousel')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${viewMode === 'carousel' ? 'bg-gold text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            <Layout size={16} /> Carousel
          </button>
          <button 
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${viewMode === 'map' ? 'bg-gold text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            <Globe size={16} /> 3D Map
          </button>
        </div>
      </div>

      <div className="relative w-full h-[500px] flex items-center justify-center perspective-1000 bg-black/20 rounded-3xl border border-white/5 overflow-hidden">
        
        {viewMode === 'map' ? (
           <div className="w-full h-full animate-in fade-in zoom-in duration-500">
             <NepalMap3D selectedIndex={index} setIndex={setIndex} images={GALLERY_IMAGES} />
             
             {/* Map Overlay Instructions */}
             <div className="absolute bottom-4 left-4 bg-black/60 p-3 rounded-xl border border-white/10 backdrop-blur-md text-xs text-gray-300 pointer-events-none select-none">
               <p className="font-bold text-gold mb-1">Interactive Mode</p>
               <p>• Click pins to view location</p>
               <p>• Drag to rotate map</p>
             </div>
           </div>
        ) : filteredImages.length > 0 ? (
          <>
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
              <AnimatePresence>
                {filteredImages.map((img, i) => {
                  const styles = getSlideStyles(i);
                  return (
                    <motion.div
                      key={img.url} // Use URL as key for filtering stability
                      className="absolute w-[80%] sm:w-[60%] md:w-[500px] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 bg-black cursor-pointer"
                      initial={false}
                      animate={styles as any}
                      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                      onClick={() => setIndex(i)} // Allow clicking to center
                    >
                      <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-1">{img.title}</h3>
                        <div className="flex items-center gap-1 text-gold text-sm">
                          <MapPin size={14} />
                          <span>Nepal</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Controls - Only show if more than 1 image */}
            {filteredImages.length > 1 && (
              <>
                <button 
                  onClick={prevSlide}
                  className="absolute left-4 md:left-20 z-20 bg-black/50 hover:bg-nepalRed text-white p-3 md:p-4 rounded-full backdrop-blur-md border border-white/10 transition-all hover:scale-110"
                >
                  <ChevronLeft size={32} />
                </button>
                <button 
                  onClick={nextSlide}
                  className="absolute right-4 md:right-20 z-20 bg-black/50 hover:bg-nepalRed text-white p-3 md:p-4 rounded-full backdrop-blur-md border border-white/10 transition-all hover:scale-110"
                >
                  <ChevronRight size={32} />
                </button>

                {/* Indicators */}
                <div className="absolute bottom-4 flex gap-2 z-20">
                  {filteredImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIndex(i)}
                      className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${i === index ? 'bg-gold w-6 md:w-8' : 'bg-white/30 hover:bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="text-center text-gray-400 flex flex-col items-center animate-in zoom-in duration-300 relative z-10 max-w-md mx-auto p-8 rounded-2xl bg-black/40 backdrop-blur-sm border border-white/10">
             <div className="w-32 h-32 mb-6 rounded-full overflow-hidden border-4 border-white/10 shadow-xl relative group">
                <img 
                  src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=400&auto=format&fit=crop" 
                  alt="Nepal Landscape" 
                  className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Search size={32} className="text-white/80" />
                </div>
             </div>
             <p className="text-2xl font-bold text-white mb-2">No destinations found</p>
             <p className="text-sm mb-6 text-gray-300">We couldn't find any places matching "{searchTerm}". Try searching for 'Everest', 'Pokhara', or 'Kathmandu'.</p>
             <button 
               onClick={() => setSearchTerm('')}
               className="text-black bg-gold px-6 py-2 rounded-full font-bold hover:bg-yellow-400 transition-colors shadow-[0_0_15px_rgba(255,215,0,0.3)]"
             >
               View all locations
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryCarousel;