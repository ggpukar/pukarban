import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';

const PrayerWheel = () => {
  const wheelRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (wheelRef.current) {
      wheelRef.current.rotation.y += delta * 3; // Spin speed
    }
  });

  return (
    <group position={[0, 0.5, 0]}>
      {/* Handle Stick (Stationary relative to the spinning drum in this simplified view) */}
      <mesh position={[0, -2.2, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 3.5, 16]} />
        <meshStandardMaterial color="#5D4037" roughness={0.8} />
      </mesh>
      
      {/* Handle Grip Area */}
      <mesh position={[0, -3.0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 1.5, 16]} />
        <meshStandardMaterial color="#3E2723" roughness={0.9} />
      </mesh>

      {/* Spinning Assembly */}
      <group ref={wheelRef}>
        {/* Main Drum */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[1.2, 1.2, 2, 32]} />
          <meshStandardMaterial color="#B91C1C" roughness={0.3} metalness={0.1} /> {/* Deep Red */}
        </mesh>
        
        {/* Gold Trim Top */}
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[1.25, 1.25, 0.2, 32]} />
          <meshStandardMaterial color="#FFD700" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* Gold Trim Bottom */}
        <mesh position={[0, -0.9, 0]}>
          <cylinderGeometry args={[1.25, 1.25, 0.2, 32]} />
          <meshStandardMaterial color="#FFD700" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* Conical Cap */}
        <mesh position={[0, 1.3, 0]}>
          <coneGeometry args={[1.2, 0.8, 32]} />
          <meshStandardMaterial color="#FFD700" metalness={0.6} roughness={0.3} />
        </mesh>
        
        {/* Decorative Spire on Cap */}
        <mesh position={[0, 1.8, 0]}>
           <sphereGeometry args={[0.15, 16, 16]} />
           <meshStandardMaterial color="#FFD700" metalness={0.8} />
        </mesh>

        {/* Mantras (Om Mani Padme Hum) */}
        {Array.from({ length: 6 }).map((_, i) => (
          <group key={i} rotation={[0, (i * Math.PI * 2) / 6, 0]}>
             <Text
               position={[0, 0, 1.22]} // Slightly outside radius
               fontSize={0.6}
               color="#FFD700"
               font="https://fonts.gstatic.com/s/notosans/v27/o-0IIpQlx3QUlC5A4PNr5TRA.woff" // Fallback font, or default
               anchorX="center"
               anchorY="middle"
             >
               ॐ
             </Text>
          </group>
        ))}
        
        {/* Weight Visual (The heavy object that helps it spin) */}
        {/* Represented as a small chain and weight swinging out */}
        <group position={[1.2, 0, 0]}>
             {/* Not simulating physics chain, just a static visual attached to drum */}
             <mesh position={[0.2, 0, 0]} rotation={[0,0, -0.5]}>
                <boxGeometry args={[0.4, 0.1, 0.1]} />
                <meshStandardMaterial color="#FFD700" />
             </mesh>
             <mesh position={[0.5, -0.2, 0]}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial color="#B91C1C" />
             </mesh>
        </group>
      </group>
    </group>
  );
};

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-[#0f172a] z-[100] flex flex-col items-center justify-center overflow-hidden">
      {/* 3D Scene */}
      <div className="w-full h-full absolute inset-0">
        <Canvas camera={{ position: [0, 1, 6], fov: 40 }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#FFD700" />
          <pointLight position={[-10, 0, 5]} intensity={0.5} color="#DC143C" />
          <pointLight position={[0, -5, 2]} intensity={0.3} color="#003893" />
          
          <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <PrayerWheel />
          </Float>
          
          {/* Subtle background particles or stars */}
          <mesh position={[0, 0, -5]}>
             <planeGeometry args={[20, 20]} />
             <meshBasicMaterial color="#0f172a" />
          </mesh>
        </Canvas>
      </div>
      
      {/* Overlay Text */}
      <div className="absolute bottom-16 md:bottom-24 flex flex-col items-center pointer-events-none z-10 p-4 text-center">
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold via-white to-gold tracking-widest mb-6 drop-shadow-lg">
          NAMASTE
        </h1>
        
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-3">
             <div className="w-3 h-3 bg-nepalRed rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
             <div className="w-3 h-3 bg-nepalBlue rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
             <div className="w-3 h-3 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
          </div>
          <p className="text-gold/60 text-xs uppercase tracking-[0.3em] font-light mt-2 animate-pulse">Initializing 3D Environment</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
