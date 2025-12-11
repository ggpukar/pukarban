import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Mail, Gamepad2, Settings, Sun, Moon, Zap, Sparkles } from 'lucide-react';
import Background3D from './components/Background3D';
import NepaliWatch from './components/NepaliWatch';
import LoadingScreen from './components/LoadingScreen';
import { TicTacToe, Snake, Game2048 } from './components/Games';
import Tools from './components/Tools';
import GalleryCarousel from './components/GalleryCarousel';
import AboutSection from './components/AboutSection';
import { NAV_ITEMS, SOCIAL_LINKS } from './constants';
import { ThemeMode } from './types';

const App: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeGame, setActiveGame] = useState<'tictactoe' | 'snake' | '2048' | null>(null);
  const [theme, setTheme] = useState<ThemeMode>('dawn');
  const [loading, setLoading] = useState(true);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMessage, setFormMessage] = useState('');

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const recipient = 'contact@banprabin00@gmail.com';
    const subject = `Portfolio Contact from ${formName}`;
    const body = `Name: ${formName}\nEmail: ${formEmail}\n\nMessage:\n${formMessage}`;
    
    // Open Gmail compose window in a new tab
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank');
  };

  const ThemeSwitcher = () => (
    <div className="flex gap-2 bg-black/30 p-1 rounded-full backdrop-blur-md border border-white/10">
      <button onClick={() => setTheme('dawn')} className={`p-2 rounded-full transition-all ${theme === 'dawn' ? 'bg-gold text-black shadow-lg' : 'text-gray-400 hover:text-white'}`} title="Mountain Dawn">
        <Sun size={18} />
      </button>
      <button onClick={() => setTheme('tihar')} className={`p-2 rounded-full transition-all ${theme === 'tihar' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`} title="Tihar Lights">
        <Sparkles size={18} />
      </button>
      <button onClick={() => setTheme('neon')} className={`p-2 rounded-full transition-all ${theme === 'neon' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`} title="Kathmandu Neon">
        <Zap size={18} />
      </button>
    </div>
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative min-h-screen font-sans text-white overflow-x-hidden scroll-smooth selection:bg-nepalRed selection:text-white">
      {/* 3D Background with Theme */}
      <Background3D theme={theme} />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-black tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-nepalRed to-nepalBlue flex items-center justify-center text-xs">PB</div>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">PRABIN.</span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex gap-8 items-center">
            {NAV_ITEMS.map((item) => (
              <a key={item.label} href={item.href} className="text-sm font-medium hover:text-gold transition-colors uppercase tracking-widest relative group">
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold transition-all group-hover:w-full"></span>
              </a>
            ))}
            <div className="w-px h-6 bg-white/20 mx-2"></div>
            <ThemeSwitcher />
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <ThemeSwitcher />
            <button className="text-white" onClick={toggleMenu}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-gray-900/95 backdrop-blur-xl border-t border-white/10 overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-4">
                {NAV_ITEMS.map((item) => (
                  <a 
                    key={item.label} 
                    href={item.href} 
                    className="text-lg font-medium py-2 border-b border-white/5 hover:text-gold hover:pl-2 transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Sections Container */}
      <div className="relative z-10">
        
        {/* HOME SECTION */}
        <section id="home" className="min-h-screen flex flex-col md:flex-row items-center justify-center p-6 pt-32 gap-12 max-w-7xl mx-auto relative">
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left z-20">
            <div className="relative mb-8 group">
               {/* Rotating Ring Animation */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-gold/30 rounded-full animate-[spin_10s_linear_infinite] group-hover:border-gold/60 transition-colors"></div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border border-nepalRed/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
               
               <h1 className="text-6xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 drop-shadow-2xl relative z-10">
                 Prabin
                 <br />
                 <span className="text-stroke-white text-transparent">Ban</span>
               </h1>
            </div>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-lg mb-10 leading-relaxed font-light">
              Designing immersive <span className="text-nepalRed font-bold">3D Experiences</span> inspired by the heights of <span className="text-nepalBlue font-bold">Nepal</span>.
            </p>
            
            <div className="flex gap-4">
              {SOCIAL_LINKS.map((social) => (
                <a 
                  key={social.label} 
                  href={social.url} 
                  className="p-4 glass-panel rounded-full hover:bg-white/10 hover:text-gold hover:scale-110 hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          
          <div className="flex-1 flex justify-center items-center scale-75 md:scale-100 relative">
            <div className="absolute inset-0 bg-gold/10 blur-[100px] rounded-full animate-pulse"></div>
            <NepaliWatch />
          </div>
        </section>

        {/* ABOUT SECTION */}
        <AboutSection />

        {/* GALLERY SECTION (CAROUSEL) */}
        <section id="gallery" className="min-h-screen p-6 py-24 flex flex-col justify-center overflow-hidden">
          <div className="max-w-7xl mx-auto w-full">
            <div className="text-center mb-16">
              <span className="text-nepalRed font-bold tracking-widest uppercase text-sm">Portfolio</span>
              <h2 className="text-4xl md:text-6xl font-bold mt-2 text-white drop-shadow-lg">Visual Journey</h2>
            </div>
            <GalleryCarousel />
          </div>
        </section>

        {/* GAMES SECTION */}
        <section id="games" className="min-h-screen p-6 py-24 flex flex-col items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/50 to-black/0 pointer-events-none"></div>
          
          <div className="relative z-10 max-w-7xl w-full">
            <div className="text-center mb-16">
               <span className="text-gold font-bold tracking-widest uppercase text-sm">Arcade</span>
               <h2 className="text-4xl md:text-6xl font-bold mt-2 text-white">Play Zone</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
              {[
                { id: 'tictactoe', name: 'Tic Tac Toe', desc: 'Strategic Duel', bg: 'from-red-900/40 to-red-900/10', icon: 'X' },
                { id: 'snake', name: 'Snake Xenzia', desc: 'Retro Classic', bg: 'from-green-900/40 to-green-900/10', icon: 'S' },
                { id: '2048', name: '2048', desc: 'Brain Teaser', bg: 'from-yellow-900/40 to-yellow-900/10', icon: '2' },
              ].map((game) => (
                <motion.button
                  key={game.id}
                  onClick={() => setActiveGame(game.id as any)}
                  whileHover={{ scale: 1.05, y: -10 }}
                  whileTap={{ scale: 0.95 }}
                  className={`group glass-panel p-1 rounded-3xl relative overflow-hidden transition-all duration-500`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${game.bg} opacity-50 group-hover:opacity-100 transition-opacity`}></div>
                  <div className="bg-black/40 backdrop-blur-sm p-8 rounded-[22px] h-full flex flex-col items-center text-center relative z-10 border border-white/5 group-hover:border-white/20">
                    <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mb-6 shadow-inner text-4xl font-black text-white group-hover:scale-110 transition-transform duration-500">
                      {game.icon}
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2">{game.name}</h3>
                    <p className="text-gray-400 mb-8">{game.desc}</p>
                    <span className="mt-auto px-8 py-3 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest group-hover:bg-white text-white group-hover:text-black transition-all">Start Game</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Game Modals */}
          {activeGame === 'tictactoe' && <TicTacToe onClose={() => setActiveGame(null)} />}
          {activeGame === 'snake' && <Snake onClose={() => setActiveGame(null)} />}
          {activeGame === '2048' && <Game2048 onClose={() => setActiveGame(null)} />}
        </section>

        {/* TOOLS SECTION */}
        <section id="tools" className="min-h-screen p-6 py-24 max-w-7xl mx-auto flex flex-col justify-center">
          <div className="text-center mb-16">
            <span className="text-nepalBlue font-bold tracking-widest uppercase text-sm">Utilities</span>
            <h2 className="text-4xl md:text-6xl font-bold mt-2 text-white">Digital Toolkit</h2>
          </div>
          <Tools />
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="min-h-[80vh] p-6 py-24 flex items-center justify-center relative">
          <div className="glass-panel max-w-3xl w-full p-8 md:p-16 rounded-[3rem] shadow-2xl border border-white/10 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-nepalRed/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gold/10 rounded-full blur-3xl"></div>

            <div className="text-center mb-12 relative z-10">
              <div className="inline-block p-4 rounded-full bg-white/5 mb-6">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-5xl font-bold text-white mb-4">Let's Connect</h2>
              <p className="text-gray-400">Project inquiry or just saying Namaste?</p>
            </div>

            <form className="space-y-6 relative z-10" onSubmit={handleContactSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <input 
                    type="text" 
                    required 
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="peer w-full bg-black/30 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-nepalRed transition-colors text-white placeholder-transparent" 
                    placeholder="Name" 
                    id="name" 
                  />
                  <label htmlFor="name" className="absolute left-4 -top-3 text-xs text-gray-400 bg-gray-900 px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-4 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-nepalRed">Name</label>
                </div>
                <div className="group relative">
                  <input 
                    type="email" 
                    required 
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="peer w-full bg-black/30 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-nepalRed transition-colors text-white placeholder-transparent" 
                    placeholder="Email" 
                    id="email" 
                  />
                  <label htmlFor="email" className="absolute left-4 -top-3 text-xs text-gray-400 bg-gray-900 px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-4 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-nepalRed">Email</label>
                </div>
              </div>
              <div className="group relative">
                <textarea 
                  rows={4} 
                  required 
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  className="peer w-full bg-black/30 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-nepalRed transition-colors text-white placeholder-transparent" 
                  placeholder="Message" 
                  id="message"
                ></textarea>
                <label htmlFor="message" className="absolute left-4 -top-3 text-xs text-gray-400 bg-gray-900 px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-4 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-nepalRed">Message</label>
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gradient-to-r from-nepalRed to-red-800 text-white font-bold py-5 rounded-xl shadow-lg hover:shadow-red-900/30 transition-all uppercase tracking-widest text-sm"
              >
                Send Message
              </motion.button>
            </form>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 text-center text-gray-500 text-sm border-t border-white/5 bg-black/90 backdrop-blur-xl">
          <div className="flex justify-center gap-6 mb-8">
            {SOCIAL_LINKS.map((link) => (
              <a key={link.label} href={link.url} className="hover:text-gold transition-colors">{link.icon}</a>
            ))}
          </div>
          <p>© {new Date().getFullYear()} Prabin Ban. Made with ❤️ and React in Nepal.</p>
        </footer>

      </div>
    </div>
  );
};

export default App;