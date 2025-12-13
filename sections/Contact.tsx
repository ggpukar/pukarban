import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mail, Phone, MapPin, Github, Facebook, Instagram, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import emailjs from '@emailjs/browser';

// --- CONFIGURATION ---
// REPLACE THESE WITH YOUR ACTUAL EMAILJS KEYS FROM https://dashboard.emailjs.com/
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID'; // e.g., 'service_xyz'
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // e.g., 'template_abc'
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // e.g., 'user_12345'

// Social Links Data
const SOCIALS = [
  { 
    id: 'fb', 
    icon: Facebook, 
    href: 'https://www.facebook.com/pukar.ban.58', 
    color: 'hover:bg-[#1877F2] hover:border-[#1877F2]', 
    delay: 0.1 
  },
  { 
    id: 'ig', 
    icon: Instagram, 
    href: 'https://www.instagram.com/whisp_eringwillowx0_0/', 
    color: 'hover:bg-pink-600 hover:border-pink-600', 
    delay: 0.2 
  },
  { 
    id: 'gh', 
    icon: Github, 
    href: 'https://github.com/ggpukar/Prabin-Ban', 
    color: 'hover:bg-gray-800 hover:border-gray-800', 
    delay: 0.3 
  }
];

export const ContactSection: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'IDLE' | 'SENDING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');

  const validate = () => {
    if (!formData.name.trim()) return "Name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "Invalid email format";
    if (!formData.message.trim()) return "Message is required";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      setErrorMessage(error);
      return;
    }

    setStatus('SENDING');
    setErrorMessage('');

    try {
      if (EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID') {
        // SIMULATION MODE (If keys are not set)
        console.warn("EmailJS keys missing. Simulating success.");
        await new Promise(resolve => setTimeout(resolve, 2000));
        setStatus('SUCCESS');
        setFormData({ name: '', email: '', message: '' });
      } else {
        // REAL SENDING MODE
        if (formRef.current) {
            await emailjs.sendForm(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                formRef.current,
                EMAILJS_PUBLIC_KEY
            );
            setStatus('SUCCESS');
            setFormData({ name: '', email: '', message: '' });
        }
      }
    } catch (err: any) {
      console.error("EmailJS Error:", err);
      setStatus('ERROR');
      setErrorMessage("Failed to send message. Please try again later.");
    } finally {
        // Reset status after a delay so user sees the result
        setTimeout(() => {
            if (status !== 'SENDING') setStatus('IDLE');
        }, 5000);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 pt-24 relative overflow-hidden">
      {/* Decorative Background Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#DC143C]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* LEFT COLUMN: Info & Socials */}
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="space-y-12 text-center lg:text-left"
        >
          <div>
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
               <div className="h-1 w-12 bg-[#DC143C] rounded-full" />
               <span className="text-blue-400 font-bold tracking-widest uppercase text-sm">Contact</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
              Let's Create<br />Something <span className="text-stroke-white text-transparent">Great.</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
              Have a project in mind or just want to chat? Drop me a message. I'm available for freelance projects and collaborations.
            </p>
          </div>

          <div className="flex flex-col gap-6 items-center lg:items-start">
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 border border-blue-500/20">
                <Mail size={20} />
              </div>
              <span className="text-gray-300 group-hover:text-white transition-colors">banpukar00@gmail.com</span>
            </div>
            <div className="flex items-center gap-4 group cursor-pointer">
               <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 border border-emerald-500/20">
                <Phone size={20} />
              </div>
              <span className="text-gray-300 group-hover:text-white transition-colors">+977 9800000000</span>
            </div>
            <div className="flex items-center gap-4 group cursor-pointer">
               <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 group-hover:bg-red-500 group-hover:text-white transition-all duration-300 border border-red-500/20">
                <MapPin size={20} />
              </div>
              <span className="text-gray-300 group-hover:text-white transition-colors">Kathmandu, Nepal</span>
            </div>
          </div>

          {/* Slipped Landing Social Icons */}
          <div className="flex gap-6 justify-center lg:justify-start pt-4">
             {SOCIALS.map((social) => (
               <motion.a
                 key={social.id}
                 href={social.href}
                 target="_blank"
                 rel="noopener noreferrer"
                 initial={{ y: -50, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 15, 
                    delay: social.delay 
                 }}
                 whileHover={{ 
                    y: 8, 
                    rotate: -10, 
                    scale: 1.1,
                    transition: { type: "spring", stiffness: 300 } 
                 }}
                 className={`w-14 h-14 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center text-white transition-colors ${social.color}`}
               >
                 <social.icon size={24} />
               </motion.a>
             ))}
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Contact Form */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-[#DC143C] rounded-3xl blur-2xl opacity-20" />
            <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl">
                <h3 className="text-2xl font-bold mb-6 text-white">Send Message</h3>
                
                {status === 'SUCCESS' ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-12 text-center space-y-4"
                    >
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                            <CheckCircle size={40} />
                        </div>
                        <h4 className="text-2xl font-bold text-white">Message Sent!</h4>
                        <p className="text-gray-400">Thank you for reaching out. I'll get back to you shortly.</p>
                        <button onClick={() => setStatus('IDLE')} className="mt-4 text-blue-400 hover:text-white underline">Send Another</button>
                    </motion.div>
                ) : (
                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold ml-1">Name</label>
                                <input 
                                    name="user_name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold ml-1">Email</label>
                                <input 
                                    name="user_email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all"
                                    placeholder="hello@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold ml-1">Message</label>
                            <textarea 
                                name="message"
                                rows={4}
                                value={formData.message}
                                onChange={(e) => setFormData({...formData, message: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all resize-none"
                                placeholder="Tell me about your project..."
                            />
                        </div>

                        <AnimatePresence>
                            {errorMessage && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20"
                                >
                                    <AlertCircle size={16} /> {errorMessage}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button 
                            type="submit" 
                            disabled={status === 'SENDING'}
                            className="w-full bg-gradient-to-r from-blue-600 to-[#DC143C] py-4 rounded-xl font-bold text-white shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                        >
                            {status === 'SENDING' ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} /> Sending...
                                </>
                            ) : (
                                <>
                                    Send Message <Send size={20} />
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </motion.div>
      </div>
    </div>
  );
};
