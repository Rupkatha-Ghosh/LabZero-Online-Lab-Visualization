import React from 'react';
import { Subject, Topic } from '../../types/types';
import { ArrowLeft, ArrowRight, Beaker, Zap, Calculator, Dna } from 'lucide-react';
import { motion } from 'motion/react';
import { Language, translations } from '../../services/translations';
import { Skeleton } from 'boneyard-js/react';
import { Subject3DCardModel } from './Subject3DModel.tsx';

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
  theme: 'dark' | 'light';
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
  theme,
  skeletonDebug = false
}) => {
  const Icon = iconMap[subject.icon] || Beaker;
  const t = (key: string) => translations[key]?.[language] || key;

  const displayedTopics = selectedClass
    ? subject.topics.filter(topic =>
      !topic.targetClass || topic.targetClass.includes(selectedClass)
    )
    : subject.topics;

  const isDark = theme === 'dark';

  return (
    <div className={`relative min-h-full overflow-hidden transition-colors duration-500 ${isDark ? 'bg-[#020617]' : 'bg-[#fafaf8]'}`}>
      {/* FULL PAGE 3D BACKGROUND */}
      <div className={`fixed inset-0 z-0 transition-opacity duration-700 ${isDark ? 'opacity-50' : 'opacity-70'}`}>
        <Subject3DCardModel
          subject={subject.name}
          modelUrl={subject.model_url}
          imageUrl={subject.image_url}
          theme={theme}
        />
      </div>

      {/* GRADIENT OVERLAY FOR READABILITY */}
      <div className={`fixed inset-0 z-[1] pointer-events-none transition-colors duration-700 ${isDark
        ? 'bg-gradient-to-b from-[#020617]/80 via-transparent to-[#020617]'
        : 'bg-gradient-to-b from-white/60 via-transparent to-white/40'
        }`} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 min-h-screen pb-40">
        <div className="flex items-center justify-between mb-20">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className={`flex items-center gap-3 transition-all group px-5 py-2.5 rounded-full border backdrop-blur-md shadow-sm ${isDark
              ? 'text-slate-400 hover:text-white bg-white/5 border-white/10'
              : 'text-slate-600 hover:text-slate-900 bg-white/40 border-slate-200'
              }`}
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] font-black">{t('backToSubjects')}</span>
          </motion.button>

          {/* QUIZ QUICK ACTION */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`hidden md:flex items-center gap-4 p-2 border rounded-2xl backdrop-blur-md shadow-sm ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/40 border-slate-200'
              }`}
          >
            <div className="flex gap-1 px-2">
              {(['basic', 'intermediate', 'difficult'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => onLevelChange(lvl)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-mono uppercase tracking-widest transition-all ${quizLevel === lvl
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-700'
                    }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <button
              onClick={onStartQuiz}
              className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-[10px] font-mono uppercase tracking-[0.2em] transition-all flex items-center gap-2 shadow-lg shadow-green-600/20"
            >
              <Zap size={14} className="fill-current" />
              {t('startQuiz') || 'Start Quiz'}
            </button>
          </motion.div>
        </div>

        <header className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <h2 className={`text-7xl md:text-9xl font-display font-bold tracking-tighter uppercase leading-none transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-900'
              }`}>
              {subject.name}
            </h2>
            <div className="flex items-center gap-4 mt-6">
              <div className="h-px w-12 bg-primary" />
              <p className={`text-[10px] font-mono uppercase tracking-[0.6em] font-black ${isDark ? 'text-indigo-400' : 'text-indigo-600'
                }`}>
                Laboratory Modules / {displayedTopics.length} Units
              </p>
            </div>
          </motion.div>
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
                className={`group relative p-8 border rounded-[40px] transition-all duration-500 text-left flex flex-col gap-8 overflow-hidden min-h-[340px] backdrop-blur-xl shadow-2xl ${isDark
                  ? 'bg-white/5 hover:bg-white/[0.08] border-white/10'
                  : 'bg-white/70 hover:bg-white/90 border-slate-200'
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shrink-0 ${isDark ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-400'
                    } group-hover:bg-primary group-hover:text-white`}>
                    <Icon size={28} strokeWidth={1.5} />
                  </div>
                  <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${isDark ? 'border-white/5' : 'border-slate-200'
                    } group-hover:border-primary/50`}>
                    <ArrowRight size={16} className="text-primary transition-all duration-500 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[8px] font-mono text-primary uppercase tracking-[0.3em]">Module {index + 1}</span>
                    <div className={`h-px w-4 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                  </div>
                  <h3 className={`text-2xl font-display font-bold mb-4 tracking-tight group-hover:text-primary transition-colors uppercase ${isDark ? 'text-white' : 'text-slate-900'
                    }`}>{topic.name}</h3>
                  <p className={`text-sm leading-relaxed font-light line-clamp-3 transition-colors ${isDark ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-600 group-hover:text-slate-800'
                    }`}>
                    {topic.description}
                  </p>
                </div>

                <div className={`flex items-center justify-between mt-4 pt-6 border-t ${isDark ? 'border-white/5' : 'border-slate-100'
                  }`}>
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {[1, 2].map((i) => (
                        <div key={i} className={`w-6 h-6 rounded-full border ${isDark ? 'border-[#020617] bg-slate-800' : 'border-white bg-slate-200'}`} />
                      ))}
                    </div>
                    <span className={`text-[8px] font-mono uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'
                      }`}>Active Learners</span>
                  </div>
                  <span className={`text-[9px] font-mono uppercase tracking-[0.2em] transition-colors ${isDark ? 'text-slate-700 group-hover:text-primary/70' : 'text-slate-400 group-hover:text-primary/70'
                    }`}>Launch Module</span>
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
