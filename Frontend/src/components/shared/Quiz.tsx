import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Zap, Target, TrendingUp, BarChart3, ChevronRight } from 'lucide-react';

interface Question {
  question: string;
  options: string[];
  answer: string;
  topic?: string;
}

interface Props {
  questions: Question[];
  onExit: () => void;
}

const QuizPage: React.FC<Props> = ({ questions, onExit }) => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [level, setLevel] = useState<"basic" | "intermediate" | "difficult">("basic");
  const [correctStreak, setCorrectStreak] = useState(0);
  const [wrongTopics, setWrongTopics] = useState<Record<string, number>>({});

  const question = questions[current];

  const handleOptionClick = (option: string) => {
    if (answered) return;

    setSelected(option);
    setAnswered(true);

    const isCorrect = option === question.answer;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setCorrectStreak((prev) => prev + 1);

      if (correctStreak + 1 >= 2 && level === "basic") {
        setLevel("intermediate");
      }
      if (correctStreak + 1 >= 4 && level === "intermediate") {
        setLevel("difficult");
      }
    } else {
      setCorrectStreak(0);
      const topic = question.topic || "general";
      setWrongTopics((prev) => ({
        ...prev,
        [topic]: (prev[topic] || 0) + 1
      }));
    }
  };

  const handleNext = () => {
    setSelected(null);
    setAnswered(false);

    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      setShowResult(true);
    }
  };

  const progress = ((current + 1) / questions.length) * 100;

  if (showResult) {
    const accuracy = ((score / questions.length) * 100).toFixed(1);
    const weakAreas = Object.entries(wrongTopics)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return (
      <div className="fixed inset-0 z-[200] bg-[#020617] flex items-center justify-center p-6 overflow-y-auto grainy">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Main Score Display */}
          <div className="bg-[#020617] border border-white/5 rounded-[40px] p-12 flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 blur-[100px] pointer-events-none" />
            <motion.div 
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 1, type: "spring" }}
              className="w-48 h-48 rounded-full border-4 border-white/5 flex flex-col items-center justify-center relative mb-10"
            >
              <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-500 mb-2">Accuracy</div>
              <div className="text-7xl font-display font-bold text-white tracking-tighter">{accuracy}%</div>
            </motion.div>
            
            <h1 className="text-4xl font-display font-bold text-white mb-4 uppercase tracking-tight">Session Analysis</h1>
            <p className="text-slate-500 text-sm font-light max-w-xs mb-10 leading-relaxed font-mono">Module evaluation complete. Neural patterns processed for proficiency mapping.</p>
            
            <div className="grid grid-cols-3 gap-8 w-full border-t border-white/5 pt-10">
              <div className="text-center">
                <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">Score</div>
                <div className="text-2xl font-bold text-green-400">{score}/{questions.length}</div>
              </div>
              <div className="text-center border-x border-white/5 px-4">
                <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">Level</div>
                <div className="text-2xl font-bold text-indigo-400 uppercase">{level}</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">Streak</div>
                <div className="text-2xl font-bold text-amber-400">{correctStreak}</div>
              </div>
            </div>
          </div>

          {/* Detailed Analytics */}
          <div className="space-y-6">
            <div className="bg-[#020617] border border-white/5 rounded-[32px] p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                  <AlertCircle size={20} />
                </div>
                <h2 className="text-lg font-display font-bold text-white uppercase tracking-tight">Proficiency Gaps</h2>
              </div>
              
              <div className="space-y-4">
                {weakAreas.length === 0 ? (
                  <div className="p-6 border border-green-500/20 bg-green-500/5 rounded-2xl flex items-center gap-4">
                    <CheckCircle2 className="text-green-400" />
                    <div>
                      <p className="text-sm font-bold text-green-400 uppercase">Flawless execution</p>
                      <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-widest uppercase tracking-widest">No cognitive gaps identified</p>
                    </div>
                  </div>
                ) : (
                  weakAreas.map(([topic, count]) => (
                    <div key={topic} className="p-4 bg-white/5 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <BarChart3 size={16} className="text-rose-400" />
                        <span className="text-sm font-mono text-slate-300 uppercase tracking-widest">{topic}</span>
                      </div>
                      <span className="text-xs font-mono text-rose-500">{count} errors</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-[#020617] border border-white/5 rounded-[32px] p-8 flex flex-col text-center">
              <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] mb-8 leading-relaxed italic opacity-50">
                Continue module exploration to strengthen identified neurological connections.
              </h3>
              <button
                onClick={onExit}
                className="w-full py-5 bg-primary hover:bg-primary/80 text-white rounded-2xl text-xs font-mono uppercase tracking-[0.3em] transition-all shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.3)] flex items-center justify-center gap-3 group"
              >
                <span>Terminate Session</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-[#020617] text-white flex flex-col p-8 overflow-hidden grainy">
      {/* Header telemetry */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <button
            onClick={onExit}
            className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-rose-500 hover:border-rose-500/30 transition-all group"
          >
            <X size={20} className="group-hover:rotate-90 transition-transform" />
          </button>
          <div>
            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.3em] mb-1">Module ID</div>
            <div className="text-xs font-mono text-white tracking-widest">ASM-{level.toUpperCase()}-092</div>
          </div>
        </div>

        <div className="flex items-center gap-8">
           <div className="text-right hidden md:block">
            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.2em] mb-1">Neural Load</div>
            <div className="text-sm font-mono text-indigo-400 font-bold uppercase tracking-widest">Adaptive: {level}</div>
          </div>
          <div className="h-10 w-px bg-white/10 hidden md:block" />
          <div className="flex items-center gap-3 px-6 py-2 bg-white/[0.02] border border-white/5 rounded-full">
            <TrendingUp size={14} className="text-primary" />
            <span className="text-xs font-mono text-white uppercase tracking-widest">{score} Correct</span>
          </div>
        </div>
      </div>

      {/* Progress Track */}
      <div className="max-w-3xl mx-auto w-full mb-20 relative">
        <div className="h-1 bg-white/5 rounded-full overflow-hidden flex items-center">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-primary to-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
          />
        </div>
        <div className="absolute -top-6 right-0 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
          Node {current + 1} / {questions.length}
        </div>
      </div>

      {/* Question Zone */}
      <main className="flex-1 flex items-start justify-center overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            className="w-full max-w-2xl bg-white/[0.01] border border-white/5 backdrop-blur-2xl p-10 md:p-16 rounded-[48px] relative group"
          >
            <div className="absolute -top-4 left-10 px-4 py-2 bg-[#020617] border border-white/10 rounded-xl">
               <span className="text-[10px] font-mono text-primary uppercase tracking-[0.3em]">Query Logic</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-display font-medium text-white mb-12 tracking-tight leading-snug">
              {question.question}
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {question.options.map((option, i) => {
                const isCorrect = option === question.answer;
                const isSelected = selected === option;

                let variant = "default";
                if (answered) {
                  if (isSelected && isCorrect) variant = "correct";
                  else if (isSelected && !isCorrect) variant = "wrong";
                  else if (isCorrect) variant = "correct";
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleOptionClick(option)}
                    disabled={answered}
                    className={`w-full text-left p-6 rounded-3xl text-sm font-light transition-all duration-300 flex items-center justify-between group/opt ${
                      answered 
                        ? variant === "correct" 
                          ? "bg-green-500/20 border-green-500/40 text-green-400"
                          : variant === "wrong"
                            ? "bg-rose-500/20 border-rose-500/40 text-rose-400 opacity-100"
                            : "opacity-40 border-white/5"
                        : "bg-white/[0.02] border border-white/5 hover:border-primary/50 hover:bg-primary/5 text-slate-300 hover:text-white"
                    }`}
                  >
                    <span className="flex-1">{option}</span>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                       answered 
                        ? variant === "correct"
                          ? "bg-green-500 border-green-400"
                          : variant === "wrong"
                            ? "bg-rose-500 border-rose-400"
                            : "border-white/10"
                        : "border-white/10 group-hover/opt:border-primary/50"
                    }`}>
                      {answered && variant === "correct" && <CheckCircle2 size={12} className="text-white" />}
                      {answered && variant === "wrong" && <X size={12} className="text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {answered && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleNext}
                className="mt-12 w-full py-5 bg-white text-black hover:bg-slate-200 rounded-[28px] text-[10px] font-mono uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 font-bold"
              >
                <span>Synchronize Next Node</span>
                <ChevronRight size={16} />
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default QuizPage;
