import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Facebook, Instagram } from 'lucide-react';

const TIMELINE = [
  { year: 'Present', title: 'BIT Student', desc: 'Currently enrolled in Bachelor of Information Technology at Aryan School of Engineering.' },
  { year: '2079 BS', title: '+2 Science', desc: 'Completed higher secondary education at Khwopa Secondary School with a 3.40 GPA.' },
  { year: '2077 BS', title: 'SEE Examination', desc: 'Completed Secondary Education Examination with a 3.45 GPA.' },
  { year: '2062 BS', title: 'The Beginning', desc: 'Born in the historic city of Bhaktapur, Nepal.' },
];

const SOCIAL_LINKS = [
  { icon: Github, href: 'https://github.com/ggpukar/pukarban', label: 'GitHub', color: 'hover:text-white' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn', color: 'hover:text-blue-400' },
  { icon: Facebook, href: 'https://www.facebook.com/pukar.ban.58', label: 'Facebook', color: 'hover:text-blue-600' },
  { icon: Instagram, href: 'https://www.instagram.com/whisp_eringwillowx0_0/', label: 'Instagram', color: 'hover:text-pink-500' },
];

export const AboutSection: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center py-20 px-4">
      <motion.h2 
        initial={{ y: -20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        className="text-4xl md:text-5xl font-bold mb-16 text-center"
      >
        My Journey
      </motion.h2>

      <div className="relative w-full max-w-3xl mb-20">
        {/* Center Line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-white/50 to-transparent" />

        {TIMELINE.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className={`relative flex items-center justify-between mb-12 w-full ${
              index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
            }`}
          >
            {/* Empty space for the other side */}
            <div className="hidden md:block w-5/12" />

            {/* Dot */}
            <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-4 border-black z-10 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />

            {/* Content */}
            <div className="ml-12 md:ml-0 w-full md:w-5/12 bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-white/30 transition-all hover:bg-white/10 group">
              <span className="text-blue-400 font-mono font-bold text-sm bg-blue-500/10 px-2 py-1 rounded mb-2 inline-block">{item.year}</span>
              <h3 className="text-xl font-bold mt-1 group-hover:text-blue-300 transition-colors">{item.title}</h3>
              <p className="text-gray-400 text-sm mt-2">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Social Links Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-6 bg-black/20 backdrop-blur-lg p-8 rounded-3xl border border-white/5"
      >
        <h3 className="text-xl font-bold text-gray-300">Connect With Me</h3>
        <div className="flex gap-6">
          {SOCIAL_LINKS.map((link, i) => (
            <a 
              key={i}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-3 bg-white/5 rounded-full text-gray-400 transition-all hover:scale-110 hover:bg-white/10 ${link.color}`}
              title={link.label}
            >
              <link.icon size={24} />
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  );
};