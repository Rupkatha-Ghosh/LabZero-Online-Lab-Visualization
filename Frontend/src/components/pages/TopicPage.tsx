import React, { useState, useEffect } from 'react';
import { Topic, TopicView, Resource } from '../../types/types';
import { ArrowLeft, BookOpen, Play, Sparkles, FileText, Trash2, Download, Presentation, GraduationCap, Volume2, VolumeX, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ResourceUpload from '../shared/ResourceUpload';
import ResourceViewer from '../shared/ResourceViewer';
import Classroom from '../shared/Classroom';
import { getResourcesByTopic, deleteResource } from '../../services/resourceService';
import { motion, AnimatePresence } from 'motion/react';
import { Language, translations } from '../../services/translations';
import { useAuth } from '../../context/AuthContext';
import { Skeleton } from 'boneyard-js/react';

interface TopicPageProps {
  topic: Topic;
  onBack: () => void;
  visualization: React.ReactNode;
  language: Language;
  onStartQuiz: () => void;
  onStartMeeting?: (topic: Topic) => void;
  skeletonDebug?: boolean;
}

const TopicPage: React.FC<TopicPageProps> = ({ topic, onBack, visualization, language, onStartQuiz, onStartMeeting }) => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<TopicView>(TopicView.THEORY);
  const t = (key: string) => translations[key]?.[language] || key;
  const [resources, setResources] = useState<Resource[]>([]);
  const [viewingResource, setViewingResource] = useState<Resource | null>(null);
  const [isReading, setIsReading] = useState(false);

  const fetchResources = async () => {
    try {
      const data = await getResourcesByTopic(topic.id);
      setResources(data.sort((a, b) => b.timestamp - a.timestamp));
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    }
  };

  useEffect(() => {
    fetchResources();
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [topic.id]);

  const toggleReadAloud = () => {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(topic.theory.replace(/[#*`]/g, ''));
      utterance.onend = () => setIsReading(false);
      utterance.onerror = () => setIsReading(false);
      window.speechSynthesis.speak(utterance);
      setIsReading(true);
    }
  };

  const handleDeleteResource = async (id: string) => {
    try {
      await deleteResource(id);
      fetchResources();
    } catch (err) {
      console.error('Failed to delete resource:', err);
    }
  };

  const handleDownloadResource = (resource: Resource) => {
    const link = document.createElement('a');
    link.href = resource.content;
    link.download = resource.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-deep)] grainy">
      {/* Topic Header */}
      <header className="sticky top-0 z-50 bg-[var(--bg-panel)]/90 backdrop-blur-2xl border-b border-[var(--border-glass)] px-8 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button
              onClick={onBack}
              className="group flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em]">{t('back')}</span>
            </button>

            <div className="h-8 w-px bg-[var(--border-glass)]" />

            <div>
              <h1 className="text-xl font-display font-bold tracking-tight text-[var(--text-primary)] uppercase">
                {topic.name}
              </h1>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-[0.3em]">
                  Module ID: {String(topic.id).split('_').join('-')}
                </span>
              </div>
            </div>
          </div>

          <nav className="flex items-center gap-1 p-1 bg-[var(--bg-deep)]/70 rounded-full border border-[var(--border-glass)] shadow-inner">
            {[
              { id: TopicView.THEORY, label: t('theory'), icon: BookOpen },
              { id: TopicView.VISUALIZATION, label: t('visualization'), icon: Play },
              { id: TopicView.CLASSROOM, label: t('classroom'), icon: GraduationCap },
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`relative flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-mono uppercase tracking-[0.2em] transition-all duration-300 ${activeView === view.id
                  ? 'text-[#fff]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
              >
                {activeView === view.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary rounded-full shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.4)]"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <view.icon size={14} className="relative z-10" />
                <span className="relative z-10">{view.label}</span>
              </button>
            ))}

            <div className="w-px h-6 bg-[var(--border-glass)] mx-2" />

            <button
              onClick={onStartQuiz}
              className="flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-mono uppercase tracking-[0.2em] bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white transition-all duration-300"
            >
              <Zap size={14} />
              <span>Take Quiz</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeView === TopicView.THEORY ? (
            <motion.div
              key="theory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full overflow-y-auto px-8 py-16"
            >
              <div className="max-w-7xl mx-auto space-y-20">
                {/* Theory Content */}
                <div className="space-y-12">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="h-px w-12 bg-primary" />
                      <h2 className="text-[10px] font-mono text-primary uppercase tracking-[0.4em]">{t('theoreticalFoundation')}</h2>
                    </div>
                    <button
                      onClick={toggleReadAloud}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 ${isReading
                        ? 'bg-rose-500/10 border-rose-500/50 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                    >
                      {isReading ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      <span className="text-[9px] font-mono uppercase tracking-widest">
                        {isReading ? t('stopReading') : t('readAloud')}
                      </span>
                    </button>
                  </div>
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/10 to-transparent" />
                    <div className="prose prose-invert max-w-none prose-headings:uppercase prose-headings:tracking-tighter prose-headings:font-display">
                      <ReactMarkdown>{topic.theory}</ReactMarkdown>
                    </div>
                  </div>
                </div>

                {/* Resources and Upload Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-20 border-t border-white/5">
                  <section className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <FileText size={20} />
                      </div>
                      <h2 className="text-xl font-display font-bold text-white uppercase tracking-tight">{t('referenceMaterials')}</h2>
                    </div>

                    <Skeleton name="topic-resources" loading={false}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {resources.map((resource) => (
                          <motion.div
                            key={resource.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="group p-6 rounded-[32px] bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all"
                          >
                            <div className="flex items-center gap-4 mb-6">
                              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <FileText size={20} />
                              </div>
                              <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-bold text-white truncate">{resource.name}</span>
                                <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">
                                  {new Date(resource.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                              {(user?.role === 'teacher' || user?.role === 'institute') && (
                                <button
                                  onClick={() => setViewingResource(resource)}
                                  className="flex-1 h-10 rounded-xl bg-primary text-[10px] font-mono uppercase tracking-widest text-white hover:bg-primary/80 transition-colors flex items-center justify-center gap-2"
                                >
                                  <Presentation size={14} />
                                  {t('present')}
                                </button>
                              )}
                              <button
                                onClick={() => handleDownloadResource(resource)}
                                className="w-10 h-10 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
                              >
                                <Download size={16} />
                              </button>
                              {(user?.role === 'teacher' || user?.role === 'institute') && (
                                <button
                                  onClick={() => handleDeleteResource(resource.id)}
                                  className="w-10 h-10 rounded-xl bg-white/5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all flex items-center justify-center"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </Skeleton>
                  </section>

                  <section className="space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                        <Download size={20} className="rotate-180" />
                      </div>
                      <h2 className="text-xl font-display font-bold text-white uppercase tracking-tight">{t('ingestModule')}</h2>
                    </div>
                    {(user?.role === 'teacher' || user?.role === 'institute') && (
                      <div className="glass-panel p-8 rounded-[40px] border border-white/5 bg-white/[0.02]">
                        <ResourceUpload topicId={topic.id} onUploadComplete={fetchResources} />
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </motion.div>
          ) : activeView === TopicView.VISUALIZATION ? (
            <motion.div
              key="viz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full overflow-y-auto p-4 md:p-8"
            >
              {visualization}
            </motion.div>
          ) : (
            <motion.div
              key="classroom"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <Classroom
                topic={topic}
                onPresent={(resource: any) => setViewingResource(resource)}
                onStartMeeting={onStartMeeting}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Resource Viewer Modal */}
      <AnimatePresence>
        {viewingResource && (
          <ResourceViewer
            resource={viewingResource}
            onClose={() => setViewingResource(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TopicPage;
