
import React from 'react';
import { Home, Book, User as UserIcon, Settings, Database } from 'lucide-react';
import { ViewState, User } from '../../types/types';

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
  language,
  user,
  theme = 'dark'
}) => {
  const inactiveClass = theme === 'light'
    ? 'text-slate-500 hover:text-slate-950 hover:bg-slate-100'
    : 'text-slate-500 hover:text-white hover:bg-white/5';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[150] px-3 pb-4 md:hidden">
      <div className={`backdrop-blur-2xl rounded-[32px] p-1.5 flex items-center justify-between ${
        theme === 'light'
          ? 'bg-white/92 border border-slate-200 shadow-[0_-10px_34px_rgba(15,23,42,0.14)]'
          : 'bg-[#020617]/80 border border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]'
      }`}>
        <button 
          onClick={() => onNavigate(ViewState.LANDING)}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${
            currentView === ViewState.LANDING ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : inactiveClass
          }`}
        >
          <Home size={18} />
          <span className="text-[7px] font-mono mt-1">HOME</span>
        </button>

        {user && (user.role === 'teacher' || user.role === 'institute') && (
          <button 
            onClick={() => onNavigate(ViewState.DASHBOARD)}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${
              currentView === ViewState.DASHBOARD ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : inactiveClass
            }`}
          >
            <Book size={18} />
            <span className="text-[7px] font-mono mt-1">DASH</span>
          </button>
        )}

        <button 
          onClick={onOpenGlossary}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${
            showGlossary ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : inactiveClass
          }`}
        >
          <Book size={18} />
          <span className="text-[7px] font-mono mt-1">BOOK</span>
        </button>

        <button 
          onClick={onOpenProfile}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${
            showAuth ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : inactiveClass
          }`}
        >
          <UserIcon size={18} />
          <span className="text-[7px] font-mono mt-1">USER</span>
        </button>

        {user && (user.is_staff || user.is_superuser) && (
          <button 
            onClick={() => onNavigate(ViewState.ADMIN)}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${
              currentView === ViewState.ADMIN ? 'bg-slate-700 text-white shadow-lg shadow-slate-700/30' : inactiveClass
            }`}
          >
            <Database size={18} />
            <span className="text-[7px] font-mono mt-1">ADMIN</span>
          </button>
        )}

        <button 
          onClick={onOpenSettings}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${
            showSettings ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : inactiveClass
          }`}
        >
          <Settings size={18} className={showSettings ? 'rotate-90 transition-transform duration-500' : ''} />
          <span className="text-[7px] font-mono mt-1">SET</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNav;
