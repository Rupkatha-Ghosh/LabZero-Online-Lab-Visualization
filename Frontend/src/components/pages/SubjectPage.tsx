import React from 'react';
import { Subject, Topic } from '../../types/types';
import { ArrowLeft, ArrowRight, Beaker, Zap, Calculator, Dna } from 'lucide-react';
import { motion } from 'motion/react';
import { Language, translations } from '../../services/translations';
import { Skeleton } from 'boneyard-js/react';

interface SubjectPageProps {
  subject: Subject;
  onSelectTopic: (topic: Topic) => void;
  onBack: () => void;
  language: Language;
  onStartQuiz: () => void;
  quizLevel: 'basic' | 'intermediate' | 'difficult';
  onLevelChange: (level: 'basic' | 'intermediate' | 'difficult') => void;
  selectedClass?: string | null;
  skeletonDebug?: boolean;
}

const iconMap: Record<string, any> = {
  Beaker,
  Zap,
  Calculator,
  Dna,
};

const SubjectPage: React.FC<SubjectPageProps> = ({ 
  subject, 
  onSelectTopic, 
  onBack, 
  language,
  onStartQuiz,
  quizLevel,
  onLevelChange,
  selectedClass,
  skeletonDebug = false
}) => {
  const Icon = iconMap[subject.icon] || Beaker;
  const t = (key: string) => translations[key]?.[language] || key;
  const displayedTopics = selectedClass
    ? subject.topics.filter(topic => 
        !topic.targetClass || topic.targetClass.includes(selectedClass)
      )
    : subject.topics;
  return (
    <div className="relative min-h-full grainy pb-32">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex items-center justify-between mb-20">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className="flex items-center gap-3 text-slate-500 hover:text-white transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em]">{t('backToSubjects')}</span>
          </motion.button>

          {/* QUIZ QUICK ACTION */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:flex items-center gap-4 p-2 bg-white/[0.02] border border-white/5 rounded-2xl"
          >
            <div className="flex gap-1 px-2">
              {(['basic', 'intermediate', 'difficult'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => onLevelChange(lvl)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-mono uppercase tracking-widest transition-all ${
                    quizLevel === lvl 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <button
              onClick={onStartQuiz}
              className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-[10px] font-mono uppercase tracking-[0.2em] transition-all flex items-center gap-2"
            >
              <Zap size={14} className="fill-current" />
              {t('startQuiz') || 'Start Quiz'}
            </button>
          </motion.div>
        </div>

        <header className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-8"
          >
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center bg-white/[0.02] border border-white/5 text-primary shadow-2xl">
              <Icon size={48} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-6xl md:text-7xl font-display font-bold tracking-tighter text-white uppercase leading-none">
                {subject.name}
              </h2>
              <div className="flex items-center gap-3 mt-4">
                <div className="h-px w-8 bg-primary" />
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em]">Laboratory Modules / {displayedTopics.length} Units</p>
              </div>
            </div>
          </motion.div>

          {/* MOBILE QUIZ BUTTON */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onStartQuiz}
            className="md:hidden w-full p-4 bg-green-600 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-mono uppercase tracking-widest text-white shadow-lg shadow-green-600/20"
          >
            <Zap size={16} fill="white" />
            Launch Subject Assessment
          </motion.button>
        </header>

        <Skeleton name="subject-topics" loading={false}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {displayedTopics.map((topic, index) => (
            <motion.button
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelectTopic(topic)}
              className="group relative p-8 bg-[#020617] hover:bg-white/[0.02] border border-white/5 rounded-[32px] transition-all duration-500 text-left flex flex-col gap-8 overflow-hidden min-h-[320px]"
            >
              <div className="flex items-start justify-between">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:bg-primary group-hover:text-white transition-all duration-500 shrink-0">
                  <Icon size={28} strokeWidth={1.5} />
                </div>
                <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                  <ArrowRight size={16} className="text-primary transition-all duration-500 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[8px] font-mono text-primary uppercase tracking-[0.3em]">Module {index + 1}</span>
                  <div className="h-px w-4 bg-white/10" />
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-4 tracking-tight group-hover:text-primary transition-colors uppercase">{topic.name}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-light line-clamp-3">
                  {topic.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-4 pt-6 border-t border-white/5">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="w-6 h-6 rounded-full border border-[#020617] bg-slate-800" />
                    ))}
                  </div>
                  <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">Active Learners</span>
                </div>
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-700 group-hover:text-primary/70 transition-colors">Launch Module</span>
              </div>

              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              </div>
            </motion.button>
          ))}
        </div>
        </Skeleton>
      </div>
    </div>
  );
};

export default SubjectPage;
