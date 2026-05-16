
import React from 'react';
import { Home, Book, User as UserIcon, Settings, Database, GraduationCap } from 'lucide-react';
import { ViewState, User } from '../../types/types';
import { motion, AnimatePresence } from 'motion/react';

interface BottomNavProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onOpenGlossary: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  showSettings?: boolean;
  showAITutor?: boolean;
  showGlossary?: boolean;
  showAuth?: boolean;
  language: string;
  user: User | null;
  theme?: 'dark' | 'light';
}

const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onNavigate,
  onOpenGlossary,
  onOpenSettings,
  onOpenProfile,
  showSettings,
  showGlossary,
  showAuth,
  user,
  theme = 'dark'
}) => {
  const isLight = theme === 'light';

  const navItems = [
    { id: 'home', icon: Home, label: 'Home', action: () => onNavigate(ViewState.LANDING), active: currentView === ViewState.LANDING, color: 'bg-indigo-500' },
    ...(user ? [
      { id: 'dash', icon: GraduationCap, label: 'Dash', action: () => onNavigate(ViewState.DASHBOARD), active: currentView === ViewState.DASHBOARD, color: 'bg-sky-500' }
    ] : []),
    { id: 'book', icon: Book, label: 'Glossary', action: onOpenGlossary, active: showGlossary, color: 'bg-amber-500' },
    { id: 'user', icon: UserIcon, label: 'Profile', action: onOpenProfile, active: showAuth, color: 'bg-emerald-500' },
    ...(user && (user.is_staff || user.is_superuser) ? [
      { id: 'admin', icon: Database, label: 'Admin', action: () => onNavigate(ViewState.ADMIN), active: currentView === ViewState.ADMIN, color: 'bg-rose-500' }
    ] : []),
    { id: 'settings', icon: Settings, label: 'Settings', action: onOpenSettings, active: showSettings, color: 'bg-slate-600' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[150] px-4 pb-6 md:hidden">
      <div className={`relative backdrop-blur-3xl rounded-[28px] p-2 flex items-center justify-around gap-1 ${
        isLight
          ? 'bg-white/80 border border-slate-200/50 shadow-[0_8px_32px_rgba(15,23,42,0.12)]'
          : 'bg-[#0F172A]/80 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
      }`}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={item.action}
            className="relative flex flex-col items-center justify-center w-12 h-12 transition-all outline-none group"
          >
            {/* Active Highlight Background */}
            <AnimatePresence>
              {item.active && (
                <motion.div
                  layoutId="activeNav"
                  className={`absolute inset-0 rounded-2xl ${item.color} shadow-lg shadow-black/10`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </AnimatePresence>

            {/* Icon & Label */}
            <div className={`relative z-10 flex flex-col items-center justify-center transition-colors duration-300 ${
              item.active 
                ? 'text-white' 
                : isLight ? 'text-slate-400 group-hover:text-slate-600' : 'text-slate-500 group-hover:text-slate-300'
            }`}>
              <item.icon size={20} strokeWidth={item.active ? 2.5 : 2} />
              <span className={`text-[8px] font-bold mt-1 tracking-tight transition-opacity ${item.active ? 'opacity-100' : 'opacity-60'}`}>
                {item.label.toUpperCase()}
              </span>
            </div>

            {/* Tap Feedback Effect */}
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="absolute inset-0 rounded-2xl pointer-events-none"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
