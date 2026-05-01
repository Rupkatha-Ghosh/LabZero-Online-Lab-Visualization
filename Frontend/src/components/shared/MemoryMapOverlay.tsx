import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { X, Brain, ChevronRight, ArrowLeft, Lightbulb, Link as LinkIcon, Sparkles, BookOpen, Layers, Target } from 'lucide-react';
import { SUBJECTS } from '../../utils/constants';
import { Subject, Topic } from '../../types/types';

interface MemoryMapOverlayProps {
  onClose: () => void;
  initialSubject?: Subject | null;
  subjects: Subject[];
}

interface MapNode {
  id: string;
  label: string;
  type: 'core' | 'main' | 'sub';
  description?: string;
  children?: MapNode[];
}

const COLOR_MAP: Record<string, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const MemoryMapOverlay: React.FC<MemoryMapOverlayProps> = ({ onClose, initialSubject, subjects }) => {
  const [step, setStep] = useState<'subject' | 'chapter' | 'map'>(initialSubject ? 'chapter' : 'subject');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(initialSubject || null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    setStep('chapter');
  };

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    setStep('map');
  };

  const handleBack = () => {
    if (step === 'map') setStep('chapter');
    else if (step === 'chapter') setStep('subject');
  };

  const mapData = useMemo(() => {
    if (!selectedTopic) return null;

    const lines = selectedTopic.theory.split('\n');
    const nodes: MapNode[] = [];
    let currentMain: MapNode | null = null;

    nodes.push({ id: 'root', label: selectedTopic.name, type: 'core', children: [] });

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('## ')) {
        const label = trimmed.replace('## ', '');
        currentMain = { id: `main-${index}`, label, type: 'main', children: [] };
        nodes[0].children?.push(currentMain);
      } else if (trimmed.startsWith('- **') && currentMain) {
        const parts = trimmed.replace('- **', '').split('**:');
        const label = parts[0];
        const description = parts[1]?.trim();
        currentMain.children?.push({ id: `sub-${index}`, label, type: 'sub', description });
      } else if (trimmed.startsWith('### ') && currentMain) {
        const label = trimmed.replace('### ', '');
        currentMain.children?.push({ id: `sub-${index}`, label, type: 'sub' });
      }
    });

    if (nodes[0].children?.length === 0) {
      nodes[0].children?.push({
        id: 'gen-1',
        label: 'Key Concepts',
        type: 'main',
        children: [{ id: 'sub-gen-1', label: 'Fundamental Principles', type: 'sub' }]
      });
    }

    return nodes[0];
  }, [selectedTopic]);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-8 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#020617]/98 backdrop-blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full h-full bg-white/[0.01] border border-white/5 rounded-[48px] flex flex-col overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]"
      >
        {/* Background Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [-20, 20],
                x: [-10, 10],
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
              className="absolute w-1 h-1 bg-white rounded-full blur-sm"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        {/* Header */}
        <div className="p-8 md:p-10 flex items-center justify-between border-b border-white/5 bg-white/[0.02] z-20">
          <div className="flex items-center gap-6">
            {step !== 'subject' && (
              <button
                onClick={handleBack}
                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all group"
              >
                <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Brain className="text-purple-400" size={24} />
                </div>
                <h2 className="text-3xl font-display font-bold text-white tracking-tight">
                  Mind Map
                </h2>
                <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono text-indigo-400 uppercase tracking-widest ml-2">
                  v2.0 Professional
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-px w-6 bg-slate-700" />
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em]">
                  {step === 'subject' && 'Explore Diverse Fields'}
                  {step === 'chapter' && `${selectedSubject?.name} Modules`}
                  {step === 'map' && `Visual Architecture: ${selectedTopic?.name}`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {step === 'map' && (
              <div className="hidden lg:flex items-center gap-6 mr-8 px-6 py-2 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  Core Module
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  Key Concepts
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-slate-500" />
                  Technical Details
                </div>
              </div>
            )}
            <button
              onClick={onClose}
              className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all"
            >
              <X size={28} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar relative z-10">
          <AnimatePresence mode="wait">
            {step === 'subject' && (
              <motion.div
                key="subject-selection"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              >
                {subjects.map((subject, idx) => {
                  const colorClasses = COLOR_MAP[subject.color] || COLOR_MAP.purple;
                  return (
                    <button
                      key={subject.id}
                      onClick={() => handleSubjectSelect(subject)}
                      className="group p-10 rounded-[40px] bg-white/[0.02] border border-white/5 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-700 text-left relative overflow-hidden flex flex-col h-[320px]"
                    >
                      <div className={`w-20 h-20 rounded-3xl ${colorClasses.split(' ')[0]} flex items-center justify-center ${colorClasses.split(' ')[1]} mb-8 group-hover:scale-110 transition-transform duration-500`}>
                        <Brain size={40} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors uppercase">{subject.name}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                          Master {subject.name.toLowerCase()} through interactive visual architectures.
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{subject.topics?.length || 0} Chapters</span>
                        <ChevronRight className="text-slate-700 group-hover:text-purple-500 transition-colors" />
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            )}

            {step === 'chapter' && selectedSubject && (
              <motion.div
                key="chapter-selection"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {selectedSubject.topics.map((topic, idx) => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicSelect(topic)}
                    className="group p-8 rounded-[32px] bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all duration-500 text-left relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:bg-indigo-500 group-hover:text-white transition-all font-mono font-bold">
                        {String(idx + 1).padStart(2, '0')}
                      </div>
                      <Sparkles size={16} className="text-slate-800 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors mb-3 uppercase tracking-tight">{topic.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-6">{topic.description}</p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-indigo-500/70 group-hover:text-indigo-400 transition-colors uppercase tracking-widest">
                      Explore Map <ChevronRight size={14} />
                    </div>
                  </button>
                ))}
              </motion.div>
            )}

            {step === 'map' && mapData && (
              <motion.div
                key="map-visualization"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="h-full w-full min-h-[600px] flex items-center justify-center"
              >
                <VisualMap node={mapData} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

const VisualMap: React.FC<{ node: MapNode }> = ({ node }) => {
  const childCount = node.children?.length || 1;
  const radius = childCount > 5 ? 360 : 300;

  return (
    <div className="relative w-full h-full flex items-center justify-center p-20 overflow-visible scale-90 md:scale-100">
      {/* Root Node */}
      <motion.div
        layoutId="root-node"
        className="relative z-30 p-8 md:p-12 rounded-[48px] bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 shadow-[0_0_80px_rgba(139,92,246,0.5)] border border-white/20 text-center group cursor-pointer"
        whileHover={{ scale: 1.05 }}
      >
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6 backdrop-blur-xl border border-white/30 shadow-inner group-hover:animate-pulse">
          <Brain size={44} className="text-white" />
        </div>
        <h4 className="text-3xl md:text-4xl font-display font-black text-white tracking-tighter uppercase leading-none">{node.label}</h4>
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="h-px w-4 bg-white/40" />
          <div className="text-[10px] font-mono text-white/80 tracking-[0.4em] uppercase font-bold">Scientific Core</div>
          <div className="h-px w-4 bg-white/40" />
        </div>
      </motion.div>

      {/* Connection Lines & Child Nodes */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {node.children?.map((child, idx) => {
          const angle = (idx / childCount) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <React.Fragment key={child.id}>
              {/* Line with animated dash */}
              <svg className="absolute inset-0 w-full h-full overflow-visible z-10">
                <motion.line
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.4 }}
                  transition={{ duration: 1.5, delay: idx * 0.15 }}
                  x1="50%"
                  y1="50%"
                  x2={`${50 + (x / 1000) * 100}%`}
                  y2={`${50 + (y / 1000) * 100}%`}
                  stroke="url(#lineGrad)"
                  strokeWidth="3"
                  strokeDasharray="12 6"
                />
                <defs>
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Concept Node */}
              <motion.div
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{ opacity: 1, scale: 1, x, y }}
                transition={{
                  delay: idx * 0.15 + 0.5,
                  type: 'spring',
                  stiffness: 70,
                  damping: 12
                }}
                whileHover={{ scale: 1.1, zIndex: 40 }}
                className="absolute pointer-events-auto group/node"
              >
                <div className="p-7 rounded-[32px] bg-[#0f172a]/95 border border-white/10 backdrop-blur-3xl hover:border-purple-500/60 transition-all cursor-pointer min-w-[240px] shadow-2xl relative overflow-hidden">
                  {/* Glowing background */}
                  <div className="absolute -top-10 -left-10 w-24 h-24 bg-purple-600/20 rounded-full blur-3xl opacity-0 group-hover/node:opacity-100 transition-opacity" />

                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover/node:bg-purple-500 group-hover/node:text-white transition-all duration-500">
                      <Target size={20} />
                    </div>
                    <h5 className="text-lg font-bold text-white group-hover/node:text-purple-400 transition-colors uppercase tracking-tight">{child.label}</h5>
                  </div>

                  {/* Technical Sub-points */}
                  <div className="space-y-2 relative z-10">
                    {child.children?.map((sub, sIdx) => (
                      <motion.div
                        key={sub.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.15 + sIdx * 0.1 + 0.8 }}
                        className="group/sub relative"
                      >
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-indigo-500/40 transition-all">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            <span className="text-[11px] font-bold text-slate-200 group-hover/sub:text-indigo-300 transition-colors uppercase">{sub.label}</span>
                          </div>
                          {sub.description && (
                            <p className="text-[9px] text-slate-500 leading-normal pl-3.5 group-hover/sub:text-slate-400 transition-colors">{sub.description}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Decorative corner */}
                  <div className="absolute bottom-2 right-2 text-white/5 group-hover/node:text-purple-500/20 transition-colors">
                    <Layers size={32} />
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Global Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-blue-600/10 rounded-full blur-[150px]"
        />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-[#020617]/80" />
      </div>
    </div>
  );
};

export default MemoryMapOverlay;
