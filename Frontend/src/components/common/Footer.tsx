import React from 'react';
import { Logo } from './Logo';

const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 mt-20 pt-32 pb-12 px-12 bg-gradient-to-t from-[var(--bg-deep)] to-transparent border-t border-[var(--border-glass)]">
      <div className="max-w-[2000px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
        <div className="md:col-span-5 space-y-8">
          <div className="flex items-center gap-4">
            <Logo size="lg" />
          </div>
          <p className="text-lg text-[var(--text-muted)] leading-relaxed font-bold tracking-tight brightness-[1.2] contrast-[1.1]">
            Architecting the next generation of scientific education through real-time quantum simulations and neural collaboration interfaces.
          </p>
          <div className="flex gap-6 relative z-[200] pointer-events-auto">
            {['twitter', 'github', 'discord', 'linkedin'].map(social => (
              <a key={social} href="#" className="w-12 h-12 rounded-2xl bg-[var(--bg-panel)] flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--color-primary)] hover:text-white transition-all border border-[var(--border-glass)] group">
                <i className={`fab fa-${social} transition-transform group-hover:scale-110`}></i>
              </a>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <h5 className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-[0.4em]">Product</h5>
          <div className="flex flex-col gap-4">
            {['Simulations', 'Curriculum', 'Certification', 'Pricing'].map(link => (
              <a key={link} href="#" className="text-sm font-bold text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-all tracking-tight">{link}</a>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <h5 className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-[0.4em]">Company</h5>
          <div className="flex flex-col gap-4">
            {['About Us', 'Careers', 'Brand Guide', 'Legal'].map(link => (
              <a key={link} href="#" className="text-sm font-bold text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-all tracking-tight">{link}</a>
            ))}
          </div>
        </div>

        <div className="md:col-span-3 space-y-8">
          <h5 className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-[0.4em]">Transmission</h5>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed font-black uppercase tracking-widest">Subscribe to the latest updates in LabZero.</p>
          <div className="flex gap-2">
            <input type="text" placeholder="EMAIL ADDRESS" className="flex-1 bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl px-6 py-4 text-xs font-black text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] placeholder:text-[var(--text-muted)]/40 uppercase tracking-widest" />
            <button className="w-16 h-16 bg-[var(--color-primary)] rounded-2xl flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all shadow-xl">
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[2000px] mx-auto pt-12 border-t border-[var(--border-glass)] flex flex-col md:flex-row justify-between items-center gap-8">
        <p className="text-[10px] font-bold text-[var(--text-muted)]/60 uppercase tracking-[0.4em]">© 2024 LABZERO. ALL RIGHTS RESERVED IN SUB-QUANTUM DIMENSIONS.</p>
        <div className="flex items-center gap-8">
          <span className="text-[10px] font-black text-[var(--color-primary)] tracking-[0.4em] uppercase animate-pulse">Uptime: 99.99%</span>
          <div className="flex gap-8">
            <a href="#" className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.4em] hover:text-[var(--color-primary)] transition-all">Privacy</a>
            <a href="#" className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.4em] hover:text-[var(--color-primary)] transition-all">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
