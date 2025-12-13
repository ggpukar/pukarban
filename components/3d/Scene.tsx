import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../../store';

// --- MATERIALS ---
// Reusing materials for performance
const skinMaterial = new THREE.MeshStandardMaterial({ 
  color: '#e0ac69', 
  roughness: 0.5, 
  metalness: 0.1 
});

const suitMaterial = new THREE.MeshStandardMaterial({ 
  color: '#1a1a1a', 
  roughness: 0.8, 
  metalness: 0.1 
});

const shirtMaterial = new THREE.MeshStandardMaterial({ 
  color: '#ffffff', 
  roughness: 0.4 
});

const capMaterial = new THREE.MeshStandardMaterial({ 
  color: '#262626', 
  roughness: 0.9, 
  metalness: 0.0 
});

const eyeMaterial = new THREE.MeshStandardMaterial({ 
  color: '#111111', 
  roughness: 0.1, 
  metalness: 0.8 
});

// --- AVATAR COMPONENT ---
const PeakyAvatar = () => {
  const group = useRef<THREE.Group>(null);
  const headGroup = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current || !headGroup.current) return;

    const t = state.clock.getElapsedTime();
    const { x, y } = state.pointer;

    // 1. IDLE ANIMATION (Breathing/Sway)
    // Subtle vertical movement for breathing
    group.current.position.y = -1.5 + Math.sin(t * 1.5) * 0.02;
    // Micro rotation for life-like sway
    group.current.rotation.z = Math.sin(t * 0.5) * 0.02;

    // 2. PARALLAX / LOOK AT
    // Body rotates slightly towards mouse
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, x * 0.3, 0.05);
    
    // Head rotates more towards mouse (looking effect)
    headGroup.current.rotation.y = THREE.MathUtils.lerp(headGroup.current.rotation.y, x * 0.6, 0.05);
    headGroup.current.rotation.x = THREE.MathUtils.lerp(headGroup.current.rotation.x, -y * 0.3, 0.05);
  });

  return (
    <group ref={group} position={[0, -1.5, 0]}>
      
      {/* --- BODY --- */}
      <group position={[0, 0, 0]}>
        {/* Torso (Suit Jacket) */}
        <mesh material={suitMaterial} position={[0, 0.8, 0]}>
           <cylinderGeometry args={[0.45, 0.4, 1.8, 32]} />
        </mesh>
        
        {/* Shoulders */}
        <mesh material={suitMaterial} position={[0, 1.5, 0]} rotation={[0,0,Math.PI/2]}>
           <capsuleGeometry args={[0.42, 1.2, 4, 16]} />
        </mesh>

        {/* White Shirt Collar area */}
        <mesh material={shirtMaterial} position={[0, 1.6, 0.15]}>
           <cylinderGeometry args={[0.18, 0.22, 0.4, 32]} />
        </mesh>
        
        {/* Tie (Black) */}
        <mesh position={[0, 1.4, 0.36]} rotation={[0.1, 0, 0]}>
           <boxGeometry args={[0.1, 0.5, 0.05]} />
           <meshStandardMaterial color="#050505" />
        </mesh>

        {/* Buttons / Watch Chain */}
        <mesh position={[0.15, 0.8, 0.4]} rotation={[0, 0, -0.5]}>
           <torusGeometry args={[0.15, 0.005, 8, 20]} />
           <meshStandardMaterial color="#c0a040" metalness={1} roughness={0.2} />
        </mesh>
      </group>

      {/* --- HEAD GROUP --- */}
      <group ref={headGroup} position={[0, 1.85, 0]}>
        
        {/* Neck */}
        <mesh material={skinMaterial} position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.12, 0.15, 0.4, 32]} />
        </mesh>

        {/* Face Base */}
        <mesh material={skinMaterial} position={[0, 0.25, 0]}>
          <sphereGeometry args={[0.32, 64, 64]} />
        </mesh>

        {/* Eyes */}
        <mesh material={eyeMaterial} position={[0.12, 0.3, 0.26]}>
           <sphereGeometry args={[0.035, 16, 16]} />
        </mesh>
        <mesh material={eyeMaterial} position={[-0.12, 0.3, 0.26]}>
           <sphereGeometry args={[0.035, 16, 16]} />
        </mesh>

        {/* --- FLAT CAP (Peaky Style) --- */}
        <group position={[0, 0.55, 0.05]} rotation={[0.1, 0, 0]}>
            {/* Cap Main Dome */}
            <mesh material={capMaterial} scale={[1, 0.4, 1.1]}>
               <sphereGeometry args={[0.34, 32, 32, 0, Math.PI * 2, 0, Math.PI/2]} />
            </mesh>
            
            {/* Cap Brim */}
            <mesh material={capMaterial} position={[0, -0.05, 0.3]} rotation={[0.2, 0, 0]}>
                <cylinderGeometry args={[0.34, 0.34, 0.05, 32, 1, false, 0, Math.PI]} />
            </mesh>
            <mesh material={capMaterial} position={[0, -0.05, 0.3]} scale={[1, 0.1, 1.5]}>
               <cylinderGeometry args={[0.34, 0.34, 0.1, 32, 1, false, 0, Math.PI]} /> 
            </mesh>
        </group>

      </group>
      
      {/* Ground Shadow */}
      <ContactShadows opacity={0.6} scale={10} blur={2.5} far={4} />
    </group>
  );
};

// --- ENVIRONMENT & LIGHTING ---
const CinematicEnvironment = () => {
  return (
    <>
      {/* 1. Fog for Mood */}
      <fog attach="fog" args={['#050505', 5, 20]} />

      {/* 2. Key Light (Warm, Top-Right) - The "Interrogation" light */}
      <spotLight 
        position={[5, 8, 5]} 
        angle={0.3} 
        penumbra={0.5} 
        intensity={150} 
        color="#ffaa77" 
        castShadow 
      />

      {/* 3. Rim Light (Cool, Back-Left) - Separates subject from background */}
      <spotLight 
        position={[-5, 5, -5]} 
        angle={0.5} 
        penumbra={1} 
        intensity={100} 
        color="#4c6ef5" 
      />

      {/* 4. Fill Light (Subtle Ambient) */}
      <ambientLight intensity={0.2} color="#1a1a2e" />

      {/* 5. Volumetric-ish Glow (Fake) */}
      <mesh position={[0, 2, -2]}>
         <sphereGeometry args={[4, 32, 32]} />
         <meshBasicMaterial color="#000" transparent opacity={0} side={THREE.BackSide} />
      </mesh>
    </>
  );
};

export const BackgroundScene: React.FC = () => {
  const mode = useAppStore((state) => state.backgroundMode);

  // Dynamic background color based on mode
  const bgColor = mode === 'light' ? '#e5e5e5' : mode === 'abstract' ? '#1a0b16' : '#050505';
  
  return (
    <div className="fixed inset-0 z-0 transition-colors duration-1000 ease-in-out" style={{ backgroundColor: bgColor }}>
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={45} />
        
        {/* Render Character */}
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
           <PeakyAvatar />
        </Float>

        {/* Lighting & Atmosphere */}
        <CinematicEnvironment />
        
        {/* Subtle Particles for Dust Mote effect (optional) */}
        {mode !== 'light' && (
           <group>
             {[...Array(50)].map((_, i) => (
               <mesh key={i} position={[
                 (Math.random() - 0.5) * 10,
                 (Math.random() - 0.5) * 10,
                 (Math.random() - 0.5) * 5
               ]}>
                 <sphereGeometry args={[0.01 + Math.random() * 0.02]} />
                 <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
               </mesh>
             ))}
           </group>
        )}

      </Canvas>
    </div>
  );
};
