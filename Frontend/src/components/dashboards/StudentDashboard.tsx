
import React from 'react';
import {
    BookOpen,
    Clock,
    Trophy,
    Target,
    Play,
    FileText,
    Download,
    Bookmark,
    Bell,
    Star,
    Zap,
    ArrowRight,
    Sparkles,
    Search,
    Users,
    X,
    ExternalLink,
    Video,
    ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { classroomsService } from '../../services/classroomsService';

interface StudentDashboardProps {
    onBack?: () => void;
    onLaunchLab?: (topicId: string | number) => void;
    onStartMeeting?: (classroom: any) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ onBack, onLaunchLab, onStartMeeting }) => {
    const { user } = useAuth();
    const [classes, setClasses] = React.useState<any[]>([]);
    const [upcomingTasks, setUpcomingTasks] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isJoinModalOpen, setIsJoinModalOpen] = React.useState(false);
    const [inviteCode, setInviteCode] = React.useState('');
    const [isJoining, setIsJoining] = React.useState(false);
    const [selectedClass, setSelectedClass] = React.useState<any | null>(null);
    const [isOnlineClassMenuOpen, setIsOnlineClassMenuOpen] = React.useState(false);

    React.useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [classData, assignmentData] = await Promise.all([
                classroomsService.getClassrooms(),
                classroomsService.getAssignments()
            ]);
            setClasses(classData);
            setUpcomingTasks(assignmentData);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteCode) return;
        try {
            setIsJoining(true);
            await classroomsService.joinClassroom(inviteCode);
            setIsJoinModalOpen(false);
            setInviteCode('');
            fetchData(); // Refresh data
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to join class.");
        } finally {
            setIsJoining(false);
        }
    };

    const achievements = [
        { name: 'Master Chemist', description: 'Complete all bonding labs', progress: 100, icon: Sparkles, color: 'text-amber-300' },
        { name: 'Quantum Leap', description: 'Score 90% in Quantum Intro', progress: 100, icon: Zap, color: 'text-cyan-300' },
        { name: 'Lab Regular', description: '10 hours in simulations', progress: 75, icon: Clock, color: 'text-violet-300' },
    ];


    /*
    const recentLabs = [
        { name: 'Atomic Dipole Field', category: 'Physics', time: '2h ago' },
        { name: 'Molecule Builder', category: 'Chemistry', time: 'Yesterday' },
        { name: 'DNA Transcription', category: 'Biology', time: '3 days ago' },
    ];
    */

    /*
    const classes = [
        { teacher: 'Mr. Smith', subject: 'Physics Lab', items: 12, isLive: true },
        { teacher: 'Dr. Wilson', subject: 'Advanced Chem', items: 8, isLive: false },
    ];
    */

    return (
        <div className="h-full overflow-y-auto bg-transparent p-8 space-y-12 pb-32 relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-7xl mx-auto relative z-10 w-full">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-3 bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-xl hover:bg-[var(--bg-panel)]/80 text-[var(--text-primary)] transition-all shadow-md self-start"
                        >
                            Go Back
                        </button>
                    )}
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-[var(--color-cyan)] font-mono text-[10px] uppercase tracking-[0.3em] drop-shadow-sm">
                            <div className="p-1.5 rounded-lg bg-[var(--color-cyan)]/20 border border-[var(--color-cyan)]/30">
                                <Star size={12} className="drop-shadow-[0_0_8px_rgba(var(--color-cyan-rgb),0.8)]" />
                            </div>
                            Student Learning Node
                        </div>
                        <h1 className="text-4xl font-display font-medium text-[var(--text-primary)] tracking-tight drop-shadow-md">
                            Astra, <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-violet)]">{user?.first_name || 'Innovator'}</span>
                        </h1>
                        <p className="text-[var(--text-muted)] font-sans text-sm drop-shadow-sm">You have {upcomingTasks.filter(t => t.status === 'Live').length} live session active right now.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 p-1.5 px-4 bg-[var(--bg-panel)] backdrop-blur-md border border-[var(--border-glass)] rounded-2xl shadow-lg">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Rank</span>
                            <span className="text-sm font-display font-bold text-[var(--color-cyan)] leading-none uppercase italic">Level 14</span>
                        </div>
                        <div className="w-px h-8 bg-[var(--border-glass)] mx-2" />
                        <div className="flex flex-col items-start px-2">
                            <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Experience</span>
                            <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 bg-[var(--bg-deep)] rounded-full overflow-hidden border border-[var(--border-glass)]">
                                    <div className="h-full bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-violet)] w-[65%]" />
                                </div>
                                <span className="text-[10px] font-mono text-[var(--color-violet)]">65%</span>
                            </div>
                        </div>
                    </div>

                    <button className="p-4 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-glass)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel)]/80 transition-all relative group shadow-lg">
                        <Bell size={20} />
                        <div className="absolute top-3.5 right-4 w-2 h-2 bg-rose-500 rounded-full border-2 border-[var(--bg-deep)] group-hover:scale-125 transition-transform" />
                    </button>
                </div>
            </header>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto relative z-10 w-full">

                {/* Left Column: Progress & Assignments */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Active Classrooms */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-display font-medium text-[var(--text-primary)] uppercase tracking-tight flex items-center gap-3 drop-shadow-sm">
                                <Users size={20} className="text-[var(--color-cyan)] drop-shadow-[0_0_8px_rgba(var(--color-cyan-rgb),0.5)]" />
                                My Classrooms
                            </h2>
                            <div className="flex items-center gap-3">
                                {onStartMeeting && (
                                    <div className="relative z-[60]">
                                        <button
                                            onClick={() => setIsOnlineClassMenuOpen((current) => !current)}
                                            className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-500 transition-all hover:bg-emerald-500/20"
                                        >
                                            <Video size={14} />
                                            Online Class
                                            <ChevronDown size={14} className={`transition-transform ${isOnlineClassMenuOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        <AnimatePresence>
                                            {isOnlineClassMenuOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                                    className="absolute right-0 top-12 z-[120] w-80 overflow-hidden rounded-3xl border border-[var(--border-glass)] bg-[var(--bg-deep)] shadow-2xl"
                                                >
                                                    <div className="border-b border-[var(--border-glass)] px-5 py-4">
                                                        <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-emerald-400">Join online class</p>
                                                        <p className="mt-1 text-xs text-[var(--text-muted)]">Pick one of your classrooms.</p>
                                                    </div>
                                                    <div className="max-h-72 overflow-y-auto p-2">
                                                        {classes.length > 0 ? classes.map((cls) => (
                                                            <button
                                                                key={cls.id}
                                                                onClick={() => {
                                                                    setIsOnlineClassMenuOpen(false);
                                                                    onStartMeeting(cls);
                                                                }}
                                                                className="flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition-all hover:bg-white/5"
                                                            >
                                                                <div className="min-w-0">
                                                                    <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{cls.name}</p>
                                                                    <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
                                                                        {cls.teacher_name ? `${cls.teacher_name}'s Lab` : 'Classroom'}
                                                                    </p>
                                                                </div>
                                                                <Video size={16} className="shrink-0 text-emerald-400" />
                                                            </button>
                                                        )) : (
                                                            <div className="px-4 py-8 text-center text-xs text-[var(--text-muted)]">
                                                                Join a classroom before entering an online class.
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                                <button 
                                    onClick={() => setIsJoinModalOpen(true)}
                                    className="px-4 py-2 rounded-xl bg-[var(--color-cyan)]/10 border border-cyan-500/30 dark:border-[var(--color-cyan)]/20 text-cyan-600 dark:text-[var(--color-cyan)] text-[10px] font-mono uppercase tracking-widest hover:bg-[var(--color-cyan)]/20 transition-all font-bold shadow-sm"
                                >
                                    Join New Class
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {classes.map((cls, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    onClick={() => setSelectedClass(cls)}
                                    className="p-6 rounded-[32px] bg-[var(--bg-panel)] backdrop-blur-xl border border-[var(--border-glass)] hover:border-[var(--color-cyan)]/30 transition-all group cursor-pointer relative overflow-hidden shadow-lg"
                                >
                                    {cls.isLive && (
                                        <div className="absolute top-4 right-4 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[8px] font-mono uppercase tracking-[0.2em] animate-pulse">
                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                            Live Now
                                        </div>
                                    )}
                                    <div className="text-[10px] font-mono text-[var(--color-cyan)]/60 uppercase tracking-[0.3em] mb-2">{cls.name}</div>
                                    <h3 className="text-lg font-display font-medium text-[var(--text-primary)] mb-4 tracking-tight drop-shadow-sm">{cls.teacher_name}'s Lab</h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-sans text-[var(--text-muted)] italic">{cls.assignments?.length || 0} tasks</span>
                                        <div className="flex items-center gap-2">
                                            {onStartMeeting && (
                                                <button
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        onStartMeeting(cls);
                                                    }}
                                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 transition-all hover:bg-emerald-500 hover:text-white"
                                                >
                                                    <Video size={14} />
                                                </button>
                                            )}
                                            <div className="w-8 h-8 rounded-full bg-[var(--bg-panel)] border border-[var(--border-glass)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--color-cyan)] group-hover:border-[var(--color-cyan)]/30 transition-all">
                                                <ArrowRight size={14} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* Progress & Analytics */}
                    <section className="p-8 rounded-[40px] bg-[var(--bg-panel)] backdrop-blur-xl border border-[var(--border-glass)] space-y-8 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h2 className="text-xl font-display font-medium text-[var(--text-primary)] uppercase tracking-tight drop-shadow-sm">Learning Progress</h2>
                                <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest leading-none">Subject Mastery & Engagement</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Total Time</span>
                                    <span className="text-lg font-display font-medium text-[var(--text-primary)] leading-none">14.5 hrs</span>
                                </div>
                                <div className="w-px h-8 bg-[var(--border-glass)]" />
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Quizzes</span>
                                    <span className="text-lg font-display font-medium text-emerald-500 leading-none">88% Avg</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {[
                                { subject: 'Chemistry', progress: 75, color: 'bg-cyan-400' },
                                { subject: 'Physics', progress: 42, color: 'bg-violet-400' },
                                { subject: 'Biology', progress: 90, color: 'bg-emerald-400' },
                            ].map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-[11px] font-mono text-white/60 uppercase tracking-widest">
                                        <span>{item.subject}</span>
                                        <span>{item.progress}% Mastery</span>
                                    </div>
                                    <div className="h-2 w-full bg-black/50 border border-white/5 rounded-full overflow-hidden shadow-inner">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.progress}%` }}
                                            className={`h-full ${item.color} shadow-[0_0_12px_rgba(34,211,238,0.4)]`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Tool shortcuts */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: 'Recent Notes', icon: FileText, count: '12 SAVED' },
                            { label: 'Bookmarks', icon: Bookmark, count: '5 REVISION' },
                            { label: 'Quiz Prep', icon: Target, count: 'READY' }
                        ].map((tool, i) => (
                            <div key={i} className="p-6 rounded-[28px] bg-[var(--bg-panel)] border border-[var(--border-glass)] hover:bg-[var(--bg-panel)]/80 transition-all group cursor-pointer shadow-lg">
                                <div className="w-10 h-10 rounded-xl bg-[var(--bg-deep)] border border-[var(--border-glass)] flex items-center justify-center text-[var(--text-muted)] mb-4 group-hover:text-[var(--color-cyan)] group-hover:border-[var(--color-cyan)]/30 transition-all">
                                    <tool.icon size={18} />
                                </div>
                                <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-1">{tool.count}</div>
                                <div className="text-sm font-sans font-medium text-[var(--text-primary)]">{tool.label}</div>
                            </div>
                        ))}
                    </section>
                </div>

                {/* Right Column: Library & Sidebar */}
                <div className="lg:col-span-4 space-y-8">

                    {/* Simulation Assignments / Tasks */}
                    <div className="p-8 rounded-[40px] bg-[var(--bg-panel)] backdrop-blur-xl border border-[var(--border-glass)] space-y-6 shadow-xl">
                        <h3 className="text-[10px] font-mono text-[var(--color-cyan)] uppercase tracking-[0.3em] flex items-center gap-2 drop-shadow-sm font-bold">
                            <Play size={12} className="drop-shadow-[0_0_8px_rgba(var(--color-cyan-rgb),0.5)]" />
                            Active Assignments
                        </h3>
                        <div className="space-y-4">
                            {upcomingTasks.map((task, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => {
                                        const targetClass = classes.find(c => c.id === task.classroom);
                                        if (targetClass) setSelectedClass(targetClass);
                                    }}
                                    className="group p-4 rounded-[20px] bg-[var(--bg-deep)] border border-[var(--border-glass)] hover:border-[var(--color-cyan)]/20 hover:bg-[var(--bg-panel)] transition-all cursor-pointer"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-[8px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 rounded-md border ${task.status === 'Live' ? 'bg-rose-500/20 text-rose-500 border-rose-500/30 animate-pulse' : 'bg-[var(--color-cyan)]/10 text-[var(--color-cyan)] border-[var(--color-cyan)]/20'
                                            }`}>
                                            {task.status}
                                        </span>
                                        <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Due {task.dueDate}</span>
                                    </div>
                                    <h4 className="text-sm font-sans font-medium text-[var(--text-primary)] mb-0.5 group-hover:text-[var(--color-cyan)] transition-colors">{task.title}</h4>
                                    <p className="text-[10px] text-[var(--text-muted)]">{task.teacher_name}</p>
                                </div>
                            ))}
                        </div>
                        <button className="w-full py-4 rounded-3xl bg-gradient-to-r from-[var(--color-cyan)]/20 to-[var(--color-violet)]/20 border border-[var(--border-glass)] text-[9px] font-mono uppercase tracking-[0.3em] text-[var(--text-primary)] hover:border-[var(--color-cyan)]/40 transition-all shadow-inner font-bold">
                            View All Assignments
                        </button>
                    </div>

                    {/* Achievements / Gamification */}
                    <div className="p-8 rounded-[40px] bg-[var(--bg-panel)] backdrop-blur-xl border border-[var(--border-glass)] space-y-8 shadow-lg overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--color-violet)]/10 pointer-events-none" />
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-mono text-[var(--color-violet)] uppercase tracking-[0.3em] flex items-center gap-2 drop-shadow-sm font-bold">
                                <Trophy size={12} className="drop-shadow-[0_0_8px_rgba(var(--color-violet-rgb),0.5)]" />
                                Achievements
                            </h3>
                            <span className="text-[9px] font-mono text-[var(--text-muted)] tracking-widest">12 / 40 UNLOCKED</span>
                        </div>

                        <div className="space-y-6">
                            {achievements.map((badge, i) => (
                                <div key={i} className="flex gap-4 items-start group/badge">
                                    <div className={`w-12 h-12 rounded-[18px] bg-[var(--bg-panel)] border border-[var(--border-glass)] flex items-center justify-center ${badge.color} group-hover/badge:scale-110 transition-transform shadow-inner`}>
                                        <badge.icon size={22} className="drop-shadow-[0_0_8px_currentColor]" />
                                    </div>
                                    <div className="flex-1 space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-sans font-medium text-[var(--text-primary)] leading-none">{badge.name}</span>
                                            <span className="text-[10px] font-mono text-[var(--text-muted)]">{badge.progress}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-[var(--bg-deep)] rounded-full overflow-hidden">
                                            <div className={`h-full ${badge.color.replace('text', 'bg')} w-[${badge.progress}%]`} style={{ width: `${badge.progress}%` }} />
                                        </div>
                                        <p className="text-[9px] font-sans text-[var(--text-muted)] leading-tight">{badge.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notice Board */}
                    <div className="p-8 rounded-[40px] bg-[var(--bg-panel)] border border-[var(--border-glass)] space-y-6 relative overflow-hidden group shadow-lg">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <Bell size={100} />
                        </div>
                        <h3 className="text-[10px] font-mono text-[var(--color-cyan)] uppercase tracking-[0.3em] relative z-10 font-bold">Notice Board</h3>
                        <div className="space-y-4 relative z-10">
                            <div className="space-y-1">
                                <p className="text-xs text-[var(--text-primary)]/70 font-sans leading-relaxed italic">
                                    "Don't forget to check the new Quantum Config simulation! It helps with the quiz."
                                </p>
                                <span className="text-[9px] font-mono text-[var(--color-cyan)] uppercase tracking-widest">- Dr. Wilson</span>
                            </div>
                            <div className="w-full h-px bg-[var(--border-glass)]" />
                            <div className="space-y-1 opacity-50 hover:opacity-100 transition-opacity">
                                <p className="text-[11px] text-[var(--text-muted)] font-sans leading-relaxed">
                                    "Lab equipment orientation starts at 10 AM Monday."
                                </p>
                                <span className="text-[8px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Admin</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Footer / Floating Quick Access */}
            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-[var(--bg-panel)] backdrop-blur-2xl border border-[var(--border-glass)] rounded-3xl shadow-2xl z-50">
                <div className="flex items-center gap-1.5 px-4 pr-6 border-r border-[var(--border-glass)]">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Active</span>
                </div>
                {['Dashboard', 'Labs', 'Library', 'Notes'].map((item) => (
                    <button key={item} className={`px-5 py-2.5 rounded-2xl text-[10px] font-mono uppercase tracking-widest transition-all ${item === 'Dashboard' ? 'bg-[var(--color-cyan)]/20 text-[var(--color-cyan)] border border-[var(--color-cyan)]/20 shadow-inner' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel)]/80'
                        }`}>
                        {item}
                    </button>
                ))}
            </div>

            {/* Join Classroom Modal */}
            {isJoinModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsJoinModalOpen(false)}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative w-full max-w-md p-8 rounded-[40px] bg-[var(--bg-deep)] border border-[var(--border-glass)] shadow-2xl overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-cyan)]/10 via-transparent to-[var(--color-violet)]/10 pointer-events-none" />
                        
                        <div className="relative z-10 space-y-6">
                            <div className="space-y-2 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-[var(--color-cyan)]/10 border border-[var(--color-cyan)]/20 flex items-center justify-center text-[var(--color-cyan)] mx-auto mb-4">
                                    <Sparkles size={32} />
                                </div>
                                <h2 className="text-2xl font-display font-medium text-[var(--text-primary)]">Join a Classroom</h2>
                                <p className="text-sm text-[var(--text-muted)]">Enter the 6-digit code provided by your teacher to unlock your lab access.</p>
                            </div>

                            <form onSubmit={handleJoinClass} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-[0.2em] ml-2 font-bold">Classroom Code</label>
                                    <input 
                                        autoFocus
                                        type="text" 
                                        placeholder="E.g. A7X8K1"
                                        value={inviteCode}
                                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                        maxLength={10}
                                        className="w-full px-6 py-4 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-glass)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/30 focus:border-[var(--color-cyan)]/50 outline-none transition-all text-center text-xl font-mono tracking-[0.5em]"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button 
                                        type="button"
                                        onClick={() => setIsJoinModalOpen(false)}
                                        className="flex-1 py-4 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-glass)] text-[var(--text-muted)] text-[10px] font-mono uppercase tracking-widest hover:bg-[var(--bg-panel)]/80 transition-all font-bold"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={isJoining || inviteCode.length < 5}
                                        className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-violet)] text-white text-[10px] font-mono uppercase tracking-widest shadow-lg shadow-[var(--color-cyan)]/20 disabled:opacity-50 disabled:grayscale transition-all font-bold"
                                    >
                                        {isJoining ? 'Connecting...' : 'Join Class'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
            {/* Classroom Detail Overlay */}
            <AnimatePresence>
                {selectedClass && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedClass(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full h-full max-w-5xl bg-[var(--bg-deep)] border border-[var(--border-glass)] shadow-2xl overflow-hidden flex flex-col md:rounded-[40px]"
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
                            
                            {/* Overlay Header */}
                            <div className="p-8 border-b border-[var(--border-glass)] flex items-center justify-between relative z-10 bg-[var(--bg-panel)]/50">
                                <div className="flex items-center gap-6">
                                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border shadow-lg ${
                                        selectedClass.is_live ? 'bg-[var(--color-cyan)]/20 text-[var(--color-cyan)] border-[var(--color-cyan)]/30' : 'bg-[var(--bg-deep)] text-[var(--text-muted)] border-[var(--border-glass)]'
                                    }`}>
                                        <Play size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-display font-bold text-[var(--text-primary)] tracking-tight">{selectedClass.name}</h2>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">Instructor: {selectedClass.teacher_name}</span>
                                            {selectedClass.is_live && (
                                                <span className="flex items-center gap-1.5 text-[9px] font-mono text-[var(--color-cyan)] uppercase tracking-widest animate-pulse font-bold">
                                                    ● Session Live
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedClass(null)}
                                    className="p-3 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-glass)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all shadow-sm"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Overlay Body */}
                            <div className="flex-1 overflow-y-auto p-8 relative z-10">
                                <div className="max-w-4xl mx-auto space-y-12">
                                    {onStartMeeting && (
                                        <section className="rounded-[32px] border border-emerald-500/20 bg-emerald-500/10 p-6">
                                            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                                                <div>
                                                    <h3 className="flex items-center gap-2 text-sm font-mono uppercase tracking-[0.24em] text-emerald-400">
                                                        <Video size={16} />
                                                        Online Class
                                                    </h3>
                                                    <p className="mt-2 text-sm text-[var(--text-muted)]">Enter the live class room for this classroom.</p>
                                                </div>
                                                <button
                                                    onClick={() => onStartMeeting(selectedClass)}
                                                    className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-emerald-400"
                                                >
                                                    <Video size={16} />
                                                    Join Online Class
                                                </button>
                                            </div>
                                        </section>
                                    )}
                                    {/* Assignments Section */}
                                    <section className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-mono text-[var(--text-muted)] uppercase tracking-[0.3em] flex items-center gap-2">
                                                <FileText size={16} className="text-[var(--color-cyan)]" />
                                                Assignments & Tasks
                                            </h3>
                                        </div>

                                        <div className="grid gap-4">
                                            {selectedClass.assignments && selectedClass.assignments.length > 0 ? (
                                                selectedClass.assignments.map((task: any, i: number) => (
                                                    <motion.div
                                                        key={task.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.1 }}
                                                        className="p-6 rounded-3xl bg-[var(--bg-panel)]/40 border border-[var(--border-glass)] hover:border-[var(--color-cyan)]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                                                    >
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-3">
                                                                <h4 className="text-base font-display font-medium text-[var(--text-primary)]">{task.title}</h4>
                                                                {task.due_date && (
                                                                    <span className="text-[9px] font-mono text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded-full border border-rose-400/20">
                                                                        Due: {new Date(task.due_date).toLocaleDateString()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-xl">
                                                                {task.description || "No description provided."}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {task.file_url && (
                                                                <a 
                                                                    href={task.file_url} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-mono uppercase tracking-widest hover:bg-white/10 transition-all"
                                                                >
                                                                    <Download size={14} /> Material
                                                                </a>
                                                            )}
                                                            {task.topic && (
                                                                <button 
                                                                    onClick={() => onLaunchLab?.(task.topic)}
                                                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-cyan)] text-black text-[10px] font-mono uppercase tracking-widest font-bold hover:brightness-110 transition-all shadow-lg shadow-[var(--color-cyan)]/20"
                                                                >
                                                                    <Play size={14} /> Launch Lab
                                                                </button>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                ))
                                            ) : (
                                                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                                        <FileText size={32} strokeWidth={1} />
                                                    </div>
                                                    <p className="text-xs font-mono uppercase tracking-widest">No assignments found for this class.</p>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudentDashboard;
