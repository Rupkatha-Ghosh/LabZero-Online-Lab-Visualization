import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, Moon, Globe, Brain, BookOpen, Download, 
  MessageSquare, Star, X, ChevronRight, Settings2,
  Heart, Sparkles, Camera, Smartphone, Eye,
  ChevronDown, ChevronUp, CheckCircle, Info
} from 'lucide-react';
import QRCodePairing from './QRCodePairing';

interface SettingsMenuProps {
  onClose: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  language: string;
  onLanguageChange: (lang: any) => void;
  onOpenMindMap: () => void;
  onOpenGlossary: () => void;
  onInstallApp?: () => void;
  isInstallable?: boolean;
  cameraSource: "local" | "remote";
  onCameraSourceChange: (source: "local" | "remote") => void;
  phoneSenderUrl: string;
  copyStatus: "idle" | "copied";
  onCopyPhoneLink: () => void;
  colorBlindMode: boolean;
  onToggleColorBlind: () => void;
  user: any;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({
  onClose,
  theme,
  onToggleTheme,
  language,
  onLanguageChange,
  onOpenMindMap,
  onOpenGlossary,
  onInstallApp,
  isInstallable,
  cameraSource,
  onCameraSourceChange,
  phoneSenderUrl,
  copyStatus,
  onCopyPhoneLink,
  colorBlindMode,
  onToggleColorBlind,
  user
}) => {
  const isDark = theme === 'dark';
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);

  // Detect if already installed/standalone
  const [isStandalone, setIsStandalone] = useState(false);
  
  // Collapse states
  const [isCameraExpanded, setIsCameraExpanded] = useState(false);
  const [isFeedbackExpanded, setIsFeedbackExpanded] = useState(false);

  // Feedback states
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSendFeedback = async () => {
    if (!user) {
      alert("Please login to send feedback");
      return;
    }
    if (rating === 0) {
      alert("Please select a star rating");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const token = localStorage.getItem('labzero_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/feedback/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating,
          comment
        })
      });

      if (response.ok) {
        setSubmitStatus('success');
        setComment('');
        setRating(0);
        setTimeout(() => setSubmitStatus('idle'), 3000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error("Feedback submission failed:", error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                               (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };
    checkStandalone();
    window.addEventListener('resize', checkStandalone);
    return () => window.removeEventListener('resize', checkStandalone);
  }, []);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 10);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState);
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState, cameraSource]);

  const handleScrollClick = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      top: canScrollDown ? 250 : -250,
      behavior: 'smooth'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="fixed bottom-32 right-6 z-[120] w-[340px] overflow-hidden"
    >
      <div className={`relative backdrop-blur-2xl rounded-[32px] border shadow-2xl p-6 transition-colors duration-500 ${
        isDark 
          ? 'bg-slate-900/90 border-indigo-500/20 shadow-indigo-500/10' 
          : 'bg-white/90 border-indigo-100 shadow-indigo-500/5'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
              <Settings2 size={18} />
            </div>
            <div className="flex items-center gap-3">
              <h3 className={`font-display font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>Control Center</h3>
              {(canScrollDown || canScrollUp) && (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleScrollClick}
                  className={`px-2.5 py-1 rounded-lg border text-[8px] font-mono uppercase tracking-[0.2em] transition-all flex items-center gap-1.5 ${
                    isDark 
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20' 
                      : 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'
                  }`}
                >
                  {canScrollDown ? 'Scroll Down' : 'Scroll Up'}
                  {canScrollDown ? <ChevronDown size={10} /> : <ChevronUp size={10} />}
                </motion.button>
              )}
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
          >
            <X size={18} />
          </motion.button>
        </div>

        {/* --- SCROLLABLE CONTENT --- */}
        <div 
          ref={scrollRef}
          className="max-h-[min(500px,calc(100vh-280px))] overflow-y-auto p-1 scrollbar-hide space-y-6"
        >
          {/* --- GRID SYSTEM --- */}
          <div className="grid grid-cols-2 gap-4 mb-6 mt-1">
            
            {/* Theme Toggle Tile */}
            <motion.button 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onToggleTheme}
              className={`p-4 rounded-[24px] border flex flex-col items-start gap-3 transition-all duration-300 group ${
                isDark 
                  ? 'bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20 hover:bg-indigo-500/20' 
                  : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100 hover:bg-indigo-100 hover:shadow-xl hover:shadow-indigo-100/50'
              }`}
            >
              <div className={`p-2 rounded-lg transition-colors ${
                isDark ? 'bg-amber-400/20 text-amber-400' : 'bg-amber-100 text-amber-600'
              }`}>
                {isDark ? <Moon size={16} /> : <Sun size={16} />}
              </div>
              <div className="text-left">
                <p className={`text-[10px] font-bold uppercase tracking-widest opacity-50 ${isDark ? 'text-white' : 'text-slate-900'}`}>Theme</p>
                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{isDark ? 'Dark' : 'Light'}</p>
              </div>
            </motion.button>

            {/* Language Selector Tile */}
            <div className={`relative p-4 rounded-[24px] border flex flex-col items-start gap-3 transition-all ${
              isDark 
                ? 'bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20' 
                : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100'
            }`}>
              <div className={`p-2 rounded-lg ${
                isDark ? 'bg-emerald-400/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
              }`}>
                <Globe size={16} />
              </div>
              <div className="text-left w-full">
                <p className={`text-[10px] font-bold uppercase tracking-widest opacity-50 ${isDark ? 'text-white' : 'text-slate-900'}`}>Language</p>
                <select 
                  value={language}
                  onChange={(e) => onLanguageChange(e.target.value)}
                  className={`w-full bg-transparent text-sm font-semibold outline-none appearance-none cursor-pointer ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  <option value="en" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>English</option>
                  <option value="hi" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Hindi</option>
                  <option value="bn" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Bengali</option>
                </select>
                <ChevronDown 
                  size={10} 
                  className={`absolute right-4 bottom-5 pointer-events-none opacity-50 ${isDark ? 'text-white' : 'text-slate-900'}`} 
                />
              </div>
            </div>

            {/* Learning Tools (MindMap) */}
            <motion.button 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenMindMap}
              className={`p-4 rounded-[24px] border flex flex-col items-start gap-3 transition-all group ${
                isDark 
                  ? 'bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20 hover:bg-indigo-500/20' 
                  : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100 hover:bg-indigo-100 hover:shadow-xl hover:shadow-indigo-100/50'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                isDark ? 'bg-purple-400/20 text-purple-400' : 'bg-purple-100 text-purple-600'
              }`}>
                <Brain size={16} />
              </div>
              <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>MindMap</p>
            </motion.button>

            {/* Learning Tools (Glossary) */}
            <motion.button 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenGlossary}
              className={`p-4 rounded-[24px] border flex flex-col items-start gap-3 transition-all group ${
                isDark 
                  ? 'bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20 hover:bg-indigo-500/20' 
                  : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100 hover:bg-indigo-100 hover:shadow-xl hover:shadow-indigo-100/50'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                isDark ? 'bg-rose-400/20 text-rose-400' : 'bg-rose-100 text-rose-600'
              }`}>
                <BookOpen size={16} />
              </div>
              <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Glossary</p>
            </motion.button>
          </div>

          {/* Gesture Camera Control (Restored) */}
          <div className={`p-5 rounded-[28px] border transition-all ${
            isDark 
              ? 'bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20' 
              : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100 shadow-sm shadow-indigo-100/50'
          }`}>
            <motion.button 
              onClick={() => setIsCameraExpanded(!isCameraExpanded)}
              className="w-full flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl transition-all ${
                  isDark ? 'bg-indigo-400/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'
                } group-hover:scale-110`}>
                  {cameraSource === 'local' ? <Camera size={18} /> : <Smartphone size={18} />}
                </div>
                <div className="text-left">
                  <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Gesture Camera</p>
                  <p className={`text-[10px] font-medium opacity-50 uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {isCameraExpanded ? (cameraSource === 'local' ? 'Local Webcam' : 'Phone Connection') : 'Source Settings'}
                  </p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: isCameraExpanded ? 180 : 0 }}
                className={isDark ? 'text-slate-500' : 'text-slate-400'}
              >
                <ChevronDown size={18} />
              </motion.div>
            </motion.button>
            
            <AnimatePresence>
              {isCameraExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-4"
                >
                  <div className="pt-4 flex items-center justify-between border-t border-slate-500/10">
                    <p className={`text-[10px] font-bold uppercase tracking-widest opacity-50 ${isDark ? 'text-white' : 'text-slate-900'}`}>Select Source</p>
                    <div className={`flex p-1 rounded-xl ${isDark ? 'bg-black/20' : 'bg-slate-200/50'}`}>
                      <button 
                        onClick={() => onCameraSourceChange('local')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                          cameraSource === 'local' 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                            : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 font-medium'
                        }`}
                      >
                        Local
                      </button>
                      <button 
                        onClick={() => onCameraSourceChange('remote')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                          cameraSource === 'remote' 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                            : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 font-medium'
                        }`}
                      >
                        Phone
                      </button>
                    </div>
                  </div>

                  {cameraSource === 'remote' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-2"
                    >
                      <QRCodePairing 
                        pairingUrl={phoneSenderUrl}
                        copyStatus={copyStatus}
                        onCopy={onCopyPhoneLink}
                      />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accessibility Section (Restored) */}
          <div className={`p-5 rounded-[28px] border flex items-center justify-between mb-4 transition-all ${
            isDark 
              ? 'bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20' 
              : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${
                isDark ? 'bg-emerald-400/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
              }`}>
                <Eye size={18} />
              </div>
              <div>
                <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Colorblind Mode</p>
                <p className={`text-[10px] font-medium opacity-50 uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {colorBlindMode ? 'Active' : 'Off'}
                </p>
              </div>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onToggleColorBlind}
              className={`w-12 h-6 rounded-full relative transition-all ${
                colorBlindMode 
                  ? 'bg-indigo-600' 
                  : isDark ? 'bg-white/10' : 'bg-slate-300'
              }`}
            >
              <motion.div 
                animate={{ x: colorBlindMode ? 24 : 4 }}
                className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
              />
            </motion.button>
          </div>

          {/* App Install / Status (Always visible now) */}
          <div className="w-full">
            {isStandalone ? (
              <div className={`p-4 rounded-[24px] border flex items-center justify-between ${
                isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500 text-white">
                    <CheckCircle size={16} />
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>LabZero Installed</p>
                    <p className={`text-[10px] opacity-60 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Running in App mode</p>
                  </div>
                </div>
              </div>
            ) : isInstallable ? (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onInstallApp}
                className={`w-full p-4 rounded-[24px] border flex items-center justify-between transition-all group ${
                  isDark ? 'bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20' : 'bg-indigo-50 border-indigo-100 hover:bg-indigo-100 hover:shadow-lg hover:shadow-indigo-100/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-indigo-500 text-white' : 'bg-indigo-600 text-white'}`}>
                    <Download size={16} />
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Install LabZero</p>
                    <p className={`text-[10px] opacity-60 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Experience it offline</p>
                  </div>
                </div>
                <ChevronRight size={16} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
              </motion.button>
            ) : (
              <div className={`p-4 rounded-[24px] border flex items-center justify-between transition-all ${
                isDark 
                  ? 'bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20' 
                  : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-500'}`}>
                    <Info size={16} />
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>PWA Support</p>
                    <p className={`text-[10px] opacity-60 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Available on mobile/Chrome</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* --- FEEDBACK SECTION --- */}
          <div className={`p-5 rounded-[28px] border transition-all ${
            isDark 
              ? 'bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20' 
              : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100'
          }`}>
            <motion.button 
              onClick={() => setIsFeedbackExpanded(!isFeedbackExpanded)}
              className="w-full flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-indigo-500 group-hover:animate-pulse" />
                <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>Quick Feedback</p>
              </div>
              <motion.div
                animate={{ rotate: isFeedbackExpanded ? 180 : 0 }}
                className={isDark ? 'text-slate-500' : 'text-slate-400'}
              >
                <ChevronDown size={18} />
              </motion.div>
            </motion.button>
            
            <AnimatePresence>
              {isFeedbackExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-2 border-t border-slate-500/10">
                    <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>How would you rate your learning experience?</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <motion.button 
                          key={s} 
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.8 }}
                          onClick={() => setRating(s)}
                          className={`p-1.5 rounded-lg transition-all active:scale-95 ${
                            rating >= s 
                              ? 'text-amber-400 bg-amber-400/10' 
                              : isDark ? 'text-slate-600 hover:bg-white/5' : 'text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          <Star size={18} fill={rating >= s ? "currentColor" : "none"} />
                        </motion.button>
                      ))}
                    </div>

                    <textarea 
                      placeholder={user ? "Any suggestions?" : "Login to share suggestions..."}
                      disabled={!user || isSubmitting}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className={`w-full p-4 rounded-2xl border text-xs min-h-[80px] outline-none transition-all resize-none ${
                        isDark 
                          ? 'bg-black/20 border-white/5 text-white placeholder:text-slate-600 focus:border-indigo-500/50' 
                          : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500/50'
                      } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />

                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={!user || isSubmitting}
                      onClick={handleSendFeedback}
                      className={`w-full mt-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${
                        submitStatus === 'success' 
                          ? 'bg-emerald-600 text-white' 
                          : submitStatus === 'error'
                          ? 'bg-rose-600 text-white'
                          : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20'
                      } ${(!user || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : submitStatus === 'success' ? (
                        <><CheckCircle size={14} /> Sent!</>
                      ) : submitStatus === 'error' ? (
                        <>Error!</>
                      ) : (
                        <><Heart size={14} /> Send with Love</>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsMenu;
