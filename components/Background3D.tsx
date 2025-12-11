import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Cloud, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { ThemeMode } from '../types';

/* --- MOUNTAINS COMPONENT --- */
const Mountains = ({ theme }: { theme: ThemeMode }) => {
  const mesh = useRef<THREE.Mesh>(null);
  
  const geometry = useMemo(() => {
    const geo = new THREE.ConeGeometry(5, 4, 4);
    geo.translate(0, 2, 0);
    return geo;
  }, []);

  const getMaterialProps = () => {
    switch(theme) {
      case 'tihar': return { color: '#4c1d95', emissive: '#1e1b4b', emissiveIntensity: 0.2 };
      case 'neon': return { color: '#0f172a', emissive: '#0ea5e9', emissiveIntensity: 0.4, wireframe: true };
      case 'dawn': default: return { color: '#e2e8f0', roughness: 0.8, metalness: 0.1 };
    }
  };

  return (
    <group position={[0, -5, -15]}>
      {/* Main Peak */}
      <mesh geometry={geometry} position={[0, 0, 0]} scale={[3, 3, 3]}>
        <meshStandardMaterial {...getMaterialProps()} flatShading />
      </mesh>
      {/* Side Peaks */}
      <mesh geometry={geometry} position={[-6, -1, -2]} scale={[2, 2, 2]}>
        <meshStandardMaterial {...getMaterialProps()} flatShading />
      </mesh>
      <mesh geometry={geometry} position={[6, -1, -2]} scale={[2, 2, 2]}>
        <meshStandardMaterial {...getMaterialProps()} flatShading />
      </mesh>
    </group>
  );
};

/* --- STUPA COMPONENT --- */
const Stupa = ({ theme, position, scale = 1 }: { theme: ThemeMode, position: [number, number, number], scale?: number }) => {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
        // Subtle floating/breathing animation
        group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
        
        // Rotation for Neon theme
        if (theme === 'neon') {
             group.current.rotation.y += 0.005;
        }
    }
  });

  const getMaterial = (color: string, emissive?: string) => {
      if (theme === 'neon') {
          return <meshStandardMaterial color={color} emissive={emissive || color} emissiveIntensity={0.6} wireframe />;
      }
      if (theme === 'tihar') {
          return <meshStandardMaterial color={color} emissive={emissive || color} emissiveIntensity={0.3} roughness={0.2} />;
      }
      // Dawn / Default
      return <meshStandardMaterial color={color} roughness={0.5} />;
  }

  return (
    <group ref={group} position={position} scale={[scale, scale, scale]}>
      {/* Base Dome (Garba) */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        {getMaterial(theme === 'dawn' ? '#FFFFFF' : theme === 'neon' ? '#0ea5e9' : '#e2e8f0', '#ffffff')}
      </mesh>
      
      {/* Harmika (Eyes Cube) */}
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[0.7, 0.6, 0.7]} />
        {getMaterial(theme === 'dawn' ? '#FFD700' : theme === 'neon' ? '#d946ef' : '#fbbf24', '#d97706')}
      </mesh>
      
      {/* Spire (Trayodashi) */}
      <mesh position={[0, 2.4, 0]}>
        <cylinderGeometry args={[0.1, 0.5, 2.2, 16]} />
        {getMaterial(theme === 'dawn' ? '#FFD700' : theme === 'neon' ? '#d946ef' : '#fbbf24', '#d97706')}
      </mesh>
      
      {/* Spire Rings (Abstracted) */}
      {Array.from({length: 5}).map((_, i) => (
          <mesh key={i} position={[0, 1.6 + (i * 0.35), 0]}>
              <torusGeometry args={[0.45 - (i * 0.08), 0.03, 8, 24]} />
              {getMaterial(theme === 'dawn' ? '#B8860B' : theme === 'neon' ? '#ffffff' : '#f59e0b')}
          </mesh>
      ))}

       {/* Top Canopy (Gajur) */}
       <mesh position={[0, 3.6, 0]}>
          <cylinderGeometry args={[0.05, 0.2, 0.5, 16]} />
          {getMaterial(theme === 'dawn' ? '#B8860B' : theme === 'neon' ? '#ffffff' : '#f59e0b')}
       </mesh>
    </group>
  );
};

/* --- DYNAMIC PRAYER FLAG COMPONENT --- */
interface SingleFlagProps {
  position: [number, number, number];
  color: string;
  rotationOffset: number;
}

const SingleFlag: React.FC<SingleFlagProps> = ({ position, color, rotationOffset }) => {
    const ref = useRef<THREE.Mesh>(null);
    const randomPhase = useMemo(() => Math.random() * 100, []);
    
    useFrame((state) => {
        if(ref.current) {
            const t = state.clock.elapsedTime;
            // Wind fluttering simulation: combination of sine waves
            const wind = Math.sin(t * 8 + randomPhase) * 0.3 + Math.sin(t * 15 + randomPhase) * 0.1;
            ref.current.rotation.x = wind * 0.5;
            ref.current.rotation.z = rotationOffset + (wind * 0.2);
        }
    });

    return (
        <mesh ref={ref} position={position} rotation={[0, 0, rotationOffset]}>
            <planeGeometry args={[0.4, 0.5]} />
            <meshStandardMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.9} />
        </mesh>
    )
}

const PrayerFlagLine = ({ start, end }: { start: [number, number, number], end: [number, number, number] }) => {
    // Calculate points along a catenary curve (hanging chain)
    const points = useMemo(() => {
        const p: THREE.Vector3[] = [];
        const steps = 12;
        const vStart = new THREE.Vector3(...start);
        const vEnd = new THREE.Vector3(...end);
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = THREE.MathUtils.lerp(vStart.x, vEnd.x, t);
            const z = THREE.MathUtils.lerp(vStart.z, vEnd.z, t);
            // Parabolic dip for gravity effect
            let y = THREE.MathUtils.lerp(vStart.y, vEnd.y, t);
            y -= Math.sin(t * Math.PI) * 1.5; // Sag amount
            p.push(new THREE.Vector3(x, y, z));
        }
        return p;
    }, [start, end]);

    const colors = ['#003893', '#FFFFFF', '#DC143C', '#00FF00', '#FFFF00']; // Blue, White, Red, Green, Yellow

    return (
        <group>
             {/* The Rope */}
             <line>
                <bufferGeometry attach="geometry" onUpdate={self => self.setFromPoints(points)} />
                <lineBasicMaterial attach="material" color="#888" linewidth={1} />
             </line>
             
             {/* The Flags */}
             {points.map((pt, i) => {
                 if (i === 0 || i >= points.length - 1) return null; 
                 // Calculate angle for the flag to hang naturally from the rope
                 const prev = points[i-1];
                 const next = points[i+1];
                 const angle = Math.atan2(next.y - prev.y, next.x - prev.x);
                 
                 return (
                     <SingleFlag 
                        key={i} 
                        position={[pt.x, pt.y - 0.25, pt.z]} 
                        color={colors[i % colors.length]} 
                        rotationOffset={angle}
                     />
                 )
             })}
        </group>
    )
}

/* --- MAIN BACKGROUND COMPONENT --- */

interface Background3DProps {
  theme: ThemeMode;
}

const Background3D: React.FC<Background3DProps> = ({ theme }) => {
  const getEnvironment = () => {
    switch(theme) {
      case 'tihar':
        return {
          fogColor: '#1e1b4b',
          lightColor: '#fbbf24', // Amber
          ambientIntensity: 0.2,
          starColor: '#fbbf24'
        };
      case 'neon':
        return {
          fogColor: '#020617',
          lightColor: '#d946ef', // Fuchsia
          ambientIntensity: 0.1,
          starColor: '#0ea5e9'
        };
      case 'dawn':
      default:
        return {
          fogColor: '#bae6fd',
          lightColor: '#FFD700',
          ambientIntensity: 0.6,
          starColor: '#ffffff'
        };
    }
  };

  const env = getEnvironment();

  return (
    <div className="fixed inset-0 z-0 pointer-events-none transition-colors duration-1000">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <ambientLight intensity={env.ambientIntensity} />
        <pointLight position={[10, 10, 10]} intensity={1} color={env.lightColor} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {theme === 'tihar' && (
          <Sparkles count={150} scale={15} size={5} speed={0.4} opacity={0.6} color="#fbbf24" position={[0, 0, -5]} />
        )}
        
        {/* Floating Clouds */}
        <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
          {theme !== 'neon' && (
            <>
              <Cloud opacity={0.6} speed={0.2} width={15} depth={2} segments={20} position={[-8, 3, -12]} color="#e2e8f0" />
              <Cloud opacity={0.4} speed={0.2} width={10} depth={1.5} segments={20} position={[8, -2, -10]} color="#cbd5e1" />
            </>
          )}
        </Float>
        
        {/* Landscape Elements */}
        <Mountains theme={theme} />
        
        {/* Stupa added to the right side */}
        <Stupa theme={theme} position={[5, -2, -6]} scale={0.8} />

        {/* Prayer Flags connecting mountains and Stupa */}
        <PrayerFlagLine start={[-6, 3, -15]} end={[0, 4, -15]} /> {/* Left peak to Main peak */}
        <PrayerFlagLine start={[0, 4, -15]} end={[5, 1, -6]} />   {/* Main peak to Stupa */}
        <PrayerFlagLine start={[-8, -1, -5]} end={[-6, 3, -15]} /> {/* Offscreen to Left peak */}

        <fog attach="fog" args={[env.fogColor, 5, 40]} />
      </Canvas>
      {/* Overlay gradient for better text readability based on theme */}
      <div className={`absolute inset-0 bg-gradient-to-b ${theme === 'dawn' ? 'from-sky-900/10' : 'from-black/40'} to-transparent`} />
    </div>
  );
};

export default Background3D;