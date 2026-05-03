import React from 'react';
import { Logo } from './Logo';

const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 mt-20 pt-32 pb-12 px-12 bg-gradient-to-t from-slate-950 to-transparent">
      <div className="max-w-[2000px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
        <div className="md:col-span-5 space-y-8">
          <div className="flex items-center gap-4">
            <Logo size="lg" lightText={true} />
          </div>
          <p className="text-lg text-slate-400 dark:text-white/40 leading-relaxed font-bold tracking-tight">
            Architecting the next generation of scientific education through real-time quantum simulations and neural collaboration interfaces.
          </p>
          <div className="flex gap-6 relative z-[200] pointer-events-auto">
            {['twitter', 'github', 'discord', 'linkedin'].map(social => (
              <a key={social} href="#" className="w-12 h-12 rounded-2xl bg-slate-400/5 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/40 hover:bg-blue-600 hover:text-white hover:text-opacity-100 transition-all border border-slate-400/10 dark:border-white/5 group">
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

        <div className="md:col-span-3 space-y-8">
          <h5 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 opacity-80 uppercase tracking-[0.4em] text-primary">Transmission</h5>
          <p className="text-xs text-slate-400 dark:text-white/40 leading-relaxed font-black uppercase tracking-widest">Subscribe to the latest updates in LabZero.</p>
          <div className="flex gap-2">
            <input type="text" placeholder="EMAIL ADDRESS" className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-black text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-white/40 uppercase tracking-widest" />
            <button className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-950 hover:scale-105 active:scale-95 transition-all shadow-xl">
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[2000px] mx-auto pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
        <p className="text-[10px] font-normal text-white/55 uppercase tracking-[0.4em]">© 2024 LABZERO. ALL RIGHTS RESERVED IN SUB-QUANTUM DIMENSIONS.</p>
        <div className="flex items-center gap-8">
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
