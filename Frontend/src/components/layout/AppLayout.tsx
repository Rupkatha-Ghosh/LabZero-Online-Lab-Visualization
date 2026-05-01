import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Home, User, Settings, Sparkles } from 'lucide-react';
import { ViewState } from '../../types/types';

interface AppLayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onBack?: () => void;
  onHome?: () => void;
  title?: string;
  subtitle?: string;
  user?: any;
}

const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  onBack, 
  onHome, 
  title, 
  subtitle,
  currentView
}) => {
  return (
    <div className="h-screen flex flex-col bg-[#020617] text-slate-200 selection:bg-indigo-500/30 overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100 contrast-150" />
      </div>

      {/* Header Bar */}
      <header className="sticky top-0 z-[100] w-full border-b border-white/5 bg-[#020617]/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            {onBack && currentView !== ViewState.LANDING && (
              <button 
                onClick={onBack}
                className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all group"
              >
                <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>
            )}
            
            <div className="flex items-center gap-2 cursor-pointer group" onClick={onHome}>
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                <Sparkles size={16} />
              </div>
              <span className="font-display font-bold text-lg tracking-tight uppercase italic text-white">LabZero</span>
            </div>

            {title && (
              <>
                <div className="h-4 w-px bg-white/10 hidden md:block" />
                <div className="hidden md:flex flex-col">
                  <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest leading-none mb-1">{subtitle}</span>
                  <span className="text-sm font-bold text-white tracking-tight leading-none">{title}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
             {/* Small utility icons or profile could go here */}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full flex-1 overflow-y-auto scroll-smooth">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="min-h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AppLayout;
