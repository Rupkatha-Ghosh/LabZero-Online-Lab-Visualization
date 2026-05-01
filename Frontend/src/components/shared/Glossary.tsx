
import React, { useState, useEffect } from 'react';
import { glossaryService } from '../../services/glossaryService';
import { GlossaryTerm, SubjectId } from '../../types/types';
import { Search, Book, X, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GlossaryProps {
  onClose: () => void;
  language: string;
}

const Glossary: React.FC<GlossaryProps> = ({ onClose, language }) => {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await glossaryService.init();
      const allTerms = await glossaryService.getAll();
      setTerms(allTerms);
      setIsLoading(false);
    };
    init();
  }, []);

  const filteredTerms = terms.filter(t => {
    const matchesSearch = t.term.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.definition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || t.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8"
    >
      <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl h-[80vh] bg-slate-950 border border-white/10 rounded-[40px] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Book size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-white uppercase tracking-tight">Science Glossary</h2>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Offline Knowledge Base</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full hover:bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 bg-white/[0.01]">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Search terms or definitions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {(['all', ...Object.values(SubjectId)] as const).map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-6 py-3 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all whitespace-nowrap ${
                  selectedSubject === sub 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 border-primary' 
                    : 'bg-white/5 text-slate-500 border border-white/10 hover:text-white hover:bg-white/10'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Terms List */}
        <div className="flex-1 overflow-y-auto p-8 space-y-4 scrollbar-hide">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] font-mono uppercase">Syncing Local DB...</span>
            </div>
          ) : filteredTerms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTerms.map((t) => (
                <motion.div
                  layout
                  key={t.id}
                  className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-primary/30 hover:bg-white/[0.04] transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-display font-bold text-white group-hover:text-primary transition-colors">{t.term}</h3>
                    <span className="px-2 py-1 rounded-md bg-white/5 text-[8px] font-mono text-slate-500 uppercase tracking-widest">{t.subject}</span>
                  </div>
                  <p className="text-sm text-slate-400 font-light leading-relaxed">
                    {t.definition}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-600 py-20">
              <Search size={48} strokeWidth={1} className="mb-4 opacity-20" />
              <p className="text-[10px] font-mono uppercase tracking-[0.3em]">No matching terms found in local storage</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-white/[0.02] border-t border-white/5 flex justify-between items-center">
          <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">
            Source: OmniScience Global Textbook
          </span>
          <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">
            {filteredTerms.length} Terms Available Offline
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default Glossary;
