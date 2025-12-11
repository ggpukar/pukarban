import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Float } from '@react-three/drei';
import * as THREE from 'three';

const GuideModel = () => {
    const group = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if(group.current) {
            // Gentle rotation to look around slightly
            group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
            // Slight breathing animation scale
            const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.01;
            group.current.scale.set(scale, scale, scale);
        }
    });

    return (
        <group ref={group} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
            {/* --- HEAD --- */}
            <mesh position={[0, 0.8, 0]}>
                <sphereGeometry args={[0.35, 32, 32]} />
                <meshStandardMaterial color="#eec09e" /> {/* Skin */}
            </mesh>
            
            {/* Facial Features (Simple) */}
            <mesh position={[0.1, 0.85, 0.3]} rotation={[0, 0, 0]}> {/* Eye R */}
                <sphereGeometry args={[0.03, 16, 16]} />
                <meshStandardMaterial color="#111" />
            </mesh>
            <mesh position={[-0.1, 0.85, 0.3]} rotation={[0, 0, 0]}> {/* Eye L */}
                <sphereGeometry args={[0.03, 16, 16]} />
                <meshStandardMaterial color="#111" />
            </mesh>
             <mesh position={[0, 0.78, 0.32]} rotation={[0, 0, 0]}> {/* Nose */}
                <sphereGeometry args={[0.03, 16, 16]} />
                <meshStandardMaterial color="#e0b090" />
            </mesh>


            {/* --- DHAKA TOPI (Stylized) --- */}
            <group position={[0, 1.05, 0]} rotation={[0.1, 0, -0.05]}>
                {/* Base Rim */}
                <mesh position={[0, 0, 0]}>
                    <cylinderGeometry args={[0.37, 0.37, 0.15, 32]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
                {/* Top Cone (asymmetric) */}
                <mesh position={[0, 0.25, 0.05]} rotation={[-0.2, 0, 0]}>
                     <cylinderGeometry args={[0.15, 0.36, 0.6, 32]} />
                     <meshStandardMaterial color="#333" />
                </mesh>
                {/* Pattern accents (simple geometric patterns) */}
                <mesh position={[0, 0.15, 0.02]} rotation={[-0.1, 0, 0]}>
                     <torusGeometry args={[0.28, 0.03, 16, 32]} />
                     <meshStandardMaterial color="#DC143C" />
                </mesh>
                <mesh position={[0, 0.3, 0.04]} rotation={[-0.15, 0, 0]}>
                     <torusGeometry args={[0.22, 0.03, 16, 32]} />
                     <meshStandardMaterial color="#22c55e" />
                </mesh>
                <mesh position={[0, 0.45, 0.06]} rotation={[-0.2, 0, 0]}>
                     <torusGeometry args={[0.15, 0.03, 16, 32]} />
                     <meshStandardMaterial color="#003893" />
                </mesh>
            </group>

            {/* --- BODY (Daura Suruwal - White) --- */}
            <mesh position={[0, 0, 0]}>
                 <cylinderGeometry args={[0.2, 0.45, 0.9, 32]} />
                 <meshStandardMaterial color="#f0f0f0" />
            </mesh>
            {/* Belt (Patuka) */}
             <mesh position={[0, -0.1, 0]}>
                 <torusGeometry args={[0.38, 0.05, 16, 32]} />
                 <meshStandardMaterial color="#ddd" />
            </mesh>

            {/* --- VEST (Istcoat - Black) --- */}
            <mesh position={[0, 0.1, 0]}>
                 <cylinderGeometry args={[0.23, 0.46, 0.55, 32]} />
                 <meshStandardMaterial color="#1a1a1a" />
            </mesh>

            {/* --- ARMS --- */}
            <group position={[-0.4, 0.25, 0]} rotation={[0, 0, 0.4]}>
                <mesh>
                    <capsuleGeometry args={[0.09, 0.5, 4, 8]} />
                    <meshStandardMaterial color="#f0f0f0" />
                </mesh>
                <mesh position={[0, -0.3, 0]}>
                     <sphereGeometry args={[0.11, 16, 16]} />
                     <meshStandardMaterial color="#eec09e" />
                </mesh>
            </group>
            
            <group position={[0.4, 0.25, 0]} rotation={[0, 0, -0.4]}>
                <mesh>
                    <capsuleGeometry args={[0.09, 0.5, 4, 8]} />
                    <meshStandardMaterial color="#f0f0f0" />
                </mesh>
                 <mesh position={[0, -0.3, 0]}>
                     <sphereGeometry args={[0.11, 16, 16]} />
                     <meshStandardMaterial color="#eec09e" />
                </mesh>
            </group>

            {/* --- SPEECH BUBBLE --- */}
            <Html position={[0.7, 1.4, 0]} center distanceFactor={7} style={{ pointerEvents: 'none' }}>
                 <div className={`
                    bg-white/95 backdrop-blur-md text-gray-900 px-4 py-2 rounded-2xl rounded-bl-none 
                    text-sm font-bold shadow-xl border-2 border-gold/50 
                    transition-all duration-500 ease-out flex flex-col items-center
                    ${hovered ? 'scale-110 opacity-100 translate-y-0' : 'scale-95 opacity-90 translate-y-1'}
                 `}>
                     <span className="whitespace-nowrap text-nepalRed font-black text-xs uppercase tracking-wider mb-0.5">Guide</span>
                     <span className="whitespace-nowrap flex items-center gap-1">Namaste! 🙏</span>
                 </div>
            </Html>
        </group>
    );
};

const GuideCharacter: React.FC = () => {
    return (
        <div className="w-[180px] h-[250px] relative">
            <Canvas camera={{ position: [0, 0.5, 4], fov: 35 }} gl={{ alpha: true }}>
                <ambientLight intensity={0.7} />
                <spotLight position={[5, 5, 5]} intensity={1} angle={0.5} penumbra={1} />
                <pointLight position={[-2, 0, 2]} intensity={0.5} color="#DC143C" />
                <Float rotationIntensity={0.2} floatIntensity={0.8} speed={1.5} floatingRange={[-0.1, 0.1]}>
                   <GuideModel />
                </Float>
            </Canvas>
        </div>
    );
};

export default GuideCharacter;
