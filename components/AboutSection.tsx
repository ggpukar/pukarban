import React from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Float, OrbitControls, MeshDistortMaterial, Text, Stars } from '@react-three/drei';
import { Code2, Palette, Terminal, Cpu, Mountain, Heart } from 'lucide-react';

/* --- 3D COMPONENTS --- */

interface SkillOrbProps {
  text: string;
  position: [number, number, number];
  color: string;
}

const SkillOrb: React.FC<SkillOrbProps> = ({ text, position, color }) => {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <group position={position}>
        <mesh>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
        </mesh>
        <Text
          position={[0, 0.7, 0]}
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="bottom"
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {text}
        </Text>
      </group>
    </Float>
  );
};

const SkillGalaxy = () => {
  const skills = [
    { name: "React", pos: [-2, 1, 0], color: "#61DAFB" },
    { name: "Three.js", pos: [2, 1.5, 1], color: "#FFFFFF" },
    { name: "TypeScript", pos: [-1, -2, 1], color: "#3178C6" },
    { name: "Tailwind", pos: [2, -1, -1], color: "#38B2AC" },
    { name: "Node.js", pos: [0, 2.5, -1], color: "#339933" },
    { name: "UI/UX", pos: [0, -2.5, 0], color: "#FF69B4" },
    { name: "Python", pos: [-2.5, 0, -1.5], color: "#FFE873" },
    { name: "Framer", pos: [2.5, 0, 1.5], color: "#0055FF" },
  ];

  return (
    <group>
      {/* Central Core representing Prabin's creative spirit */}
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.2}>
        <mesh scale={[1.5, 1.5, 1.5]}>
          <icosahedronGeometry args={[1, 1]} />
          <MeshDistortMaterial color="#DC143C" speed={3} distort={0.5} radius={1} roughness={0.2} metalness={0.5} />
        </mesh>
      </Float>

      {/* Orbiting Skills */}
      <group rotation={[0, 0, Math.PI / 8]}>
         {skills.map((skill, i) => (
            <SkillOrb key={i} text={skill.name} position={skill.pos as [number, number, number]} color={skill.color} />
         ))}
      </group>

      <Stars radius={20} depth={10} count={1000} factor={2} saturation={0} fade speed={1} />
    </group>
  );
};

/* --- MAIN COMPONENT --- */

const AboutSection: React.FC = () => {
  return (
    <section id="about" className="min-h-screen relative flex items-center justify-center py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full px-6 flex flex-col md:flex-row gap-12 items-center">
        
        {/* Left Column: Text Content */}
        <div className="flex-1 space-y-8 z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-12 h-1 bg-gradient-to-r from-nepalRed to-nepalBlue"></span>
              <span className="text-gold font-bold uppercase tracking-widest text-sm">The Developer</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              Crafting Digital <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-nepalRed to-gold">Himalayas</span>
            </h2>
            
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              Namaste! I am <strong className="text-white">Prabin Ban</strong>, a creative technologist hailing from the land of Everest. 
              My journey began not with code, but with a fascination for how stories are told through visual mediums.
            </p>
            
            <p className="text-lg text-gray-300 leading-relaxed">
              I specialize in bridging the gap between <span className="text-nepalBlue font-bold">traditional aesthetics</span> and <span className="text-nepalRed font-bold">modern performance</span>. 
              Using React and Three.js, I build immersive web experiences that don't just display information—they transport users to new worlds.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-start gap-3 hover:bg-white/10 transition-colors">
              <div className="bg-nepalRed/20 p-2 rounded-lg text-nepalRed"><Code2 size={20} /></div>
              <div>
                <h4 className="font-bold text-white">Clean Code</h4>
                <p className="text-xs text-gray-400">Scalable & Maintainable</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-start gap-3 hover:bg-white/10 transition-colors">
              <div className="bg-gold/20 p-2 rounded-lg text-gold"><Palette size={20} /></div>
              <div>
                <h4 className="font-bold text-white">Creative UI</h4>
                <p className="text-xs text-gray-400">Pixel-perfect Design</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-start gap-3 hover:bg-white/10 transition-colors">
              <div className="bg-blue-500/20 p-2 rounded-lg text-blue-500"><Terminal size={20} /></div>
              <div>
                <h4 className="font-bold text-white">Full Stack</h4>
                <p className="text-xs text-gray-400">End-to-End Solutions</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-start gap-3 hover:bg-white/10 transition-colors">
              <div className="bg-green-500/20 p-2 rounded-lg text-green-500"><Cpu size={20} /></div>
              <div>
                <h4 className="font-bold text-white">Performance</h4>
                <p className="text-xs text-gray-400">Optimized 3D Rendering</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pt-6 border-t border-white/10"
          >
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Philosophy</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">Simplicity</span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">Immersion</span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">Culture</span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">Innovation</span>
            </div>
          </motion.div>
        </div>

        {/* Right Column: 3D Interaction */}
        <div className="flex-1 h-[500px] w-full relative">
           <div className="absolute inset-0 bg-gradient-to-br from-nepalBlue/20 to-nepalRed/20 rounded-full blur-[100px] pointer-events-none"></div>
           <div className="w-full h-full relative z-10">
              <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#FFD700" />
                <pointLight position={[-10, -5, -5]} intensity={0.5} color="#003893" />
                <SkillGalaxy />
                <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
              </Canvas>
              
              {/* Overlay Label */}
              <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur border border-white/10 px-4 py-2 rounded-full text-xs text-gray-400 pointer-events-none">
                 <span className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-gold rounded-full animate-pulse"></div>
                   Interactive Skill Galaxy
                 </span>
              </div>
           </div>
        </div>

      </div>
    </section>
  );
};

export default AboutSection;