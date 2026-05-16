import React from 'react';
import { Logo } from './Logo';

const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 mt-20 pt-20 sm:pt-32 pb-28 md:pb-12 px-6 sm:px-12 bg-gradient-to-t from-slate-950 to-transparent">
      <div className="max-w-[2000px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-10 md:gap-16 mb-20">
        <div className="sm:col-span-2 md:col-span-5 space-y-8">
          <div className="flex items-center gap-4">
            <Logo size="lg" lightText={true} />
          </div>
          <p className="text-base sm:text-lg text-slate-400 dark:text-white/40 leading-relaxed font-bold tracking-tight max-w-md">
            Architecting the next generation of scientific education through real-time quantum simulations and neural collaboration interfaces.
          </p>
          <div className="flex gap-4 sm:gap-6 relative z-[200] pointer-events-auto">
            {['twitter', 'github', 'discord', 'linkedin'].map(social => (
              <a key={social} href="#" className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-400/5 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/40 hover:bg-blue-600 hover:text-white hover:text-opacity-100 transition-all border border-slate-400/10 dark:border-white/5 group">
                <i className={`fab fa-${social} transition-transform group-hover:scale-110`}></i>
              </a>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <h5 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 opacity-80 uppercase tracking-[0.4em] text-primary">Product</h5>
          <div className="flex flex-col gap-4">
            {['Simulations', 'Curriculum', 'Certification', 'Pricing'].map(link => (
              <a key={link} href="#" className="text-sm font-bold text-slate-400 dark:text-white/40 hover:text-blue-600 hover:text-opacity-100 transition-all tracking-tight">{link}</a>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <h5 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 opacity-80 uppercase tracking-[0.4em] text-primary">Company</h5>
          <div className="flex flex-col gap-4">
            {['About Us', 'Careers', 'Brand Guide', 'Legal'].map(link => (
              <a key={link} href="#" className="text-sm font-bold text-slate-400 dark:text-white/40 hover:text-blue-600 hover:text-opacity-100 transition-all tracking-tight">{link}</a>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2 md:col-span-3 space-y-8">
          <h5 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 opacity-80 uppercase tracking-[0.4em] text-primary">Transmission</h5>
          <p className="text-xs text-slate-400 dark:text-white/40 leading-relaxed font-black uppercase tracking-widest">Subscribe to the latest updates in LabZero.</p>
          <div className="flex gap-2">
            <input type="text" placeholder="EMAIL ADDRESS" className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 sm:px-6 py-4 text-[10px] sm:text-xs font-black text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-white/40 uppercase tracking-widest" />
            <button className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-2xl flex items-center justify-center text-slate-950 hover:scale-105 active:scale-95 transition-all shadow-xl shrink-0">
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[2000px] mx-auto pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
        <p className="text-[9px] sm:text-[10px] font-normal text-white/55 uppercase tracking-[0.2em] sm:tracking-[0.4em]">© 2024 LABZERO. ALL RIGHTS RESERVED IN SUB-QUANTUM DIMENSIONS.</p>
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          <span className="text-[10px] font-black text-primary tracking-[0.4em] uppercase animate-pulse">Uptime: 99.99%</span>
          <div className="flex gap-8">
            <a href="#" className="text-[10px] font-normal text-slate-400 dark:text-white/45 uppercase tracking-[0.4em] hover:text-blue-600 hover:text-opacity-100 transition-all">Privacy</a>
            <a href="#" className="text-[10px] font-normal text-slate-400 dark:text-white/45 uppercase tracking-[0.4em] hover:text-blue-600 hover:text-opacity-100 transition-all">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
