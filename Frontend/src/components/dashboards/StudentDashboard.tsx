
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
    Users
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { classroomsService } from '../../services/classroomsService';

interface StudentDashboardProps {
    onBack?: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ onBack }) => {
    const { user } = useAuth();
    const [classes, setClasses] = React.useState<any[]>([]);
    const [upcomingTasks, setUpcomingTasks] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isJoinModalOpen, setIsJoinModalOpen] = React.useState(false);
    const [inviteCode, setInviteCode] = React.useState('');
    const [isJoining, setIsJoining] = React.useState(false);

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
                            className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white transition-all shadow-md self-start"
                        >
                            Go Back
                        </button>
                    )}
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-cyan-300 font-mono text-[10px] uppercase tracking-[0.3em] drop-shadow-sm">
                            <div className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/30">
                                <Star size={12} className="drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                            </div>
                            Student Learning Node
                        </div>
                        <h1 className="text-4xl font-display font-medium text-white tracking-tight drop-shadow-md">
                            Astra, <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-500">{user?.first_name || 'Innovator'}</span>
                        </h1>
                        <p className="text-white/60 font-sans text-sm drop-shadow-sm">You have {upcomingTasks.filter(t => t.status === 'Live').length} live session active right now.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 p-1.5 px-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest leading-none mb-1">Rank</span>
                            <span className="text-sm font-display font-bold text-cyan-300 leading-none uppercase italic">Level 14</span>
                        </div>
                        <div className="w-px h-8 bg-white/10 mx-2" />
                        <div className="flex flex-col items-start px-2">
                            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest leading-none mb-1">Experience</span>
                            <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <div className="h-full bg-gradient-to-r from-cyan-400 to-violet-500 w-[65%]" />
                                </div>
                                <span className="text-[10px] font-mono text-violet-300">65%</span>
                            </div>
                        </div>
                    </div>

                    <button className="p-4 rounded-2xl bg-black/40 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all relative group">
                        <Bell size={20} />
                        <div className="absolute top-3.5 right-4 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#0F172A] group-hover:scale-125 transition-transform" />
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
                            <h2 className="text-xl font-display font-medium text-white uppercase tracking-tight flex items-center gap-3 drop-shadow-sm">
                                <Users size={20} className="text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                                My Classrooms
                            </h2>
                            <button 
                                onClick={() => setIsJoinModalOpen(true)}
                                className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] font-mono uppercase tracking-widest hover:bg-cyan-500/20 transition-all"
                            >
                                Join New Class
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {classes.map((cls, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-6 rounded-[32px] bg-black/40 backdrop-blur-xl border border-white/10 hover:border-cyan-500/30 transition-all group cursor-pointer relative overflow-hidden"
                                >
                                    {cls.isLive && (
                                        <div className="absolute top-4 right-4 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[8px] font-mono uppercase tracking-[0.2em] animate-pulse">
                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                            Live Now
                                        </div>
                                    )}
                                    <div className="text-[10px] font-mono text-cyan-300/60 uppercase tracking-[0.3em] mb-2">{cls.name}</div>
                                    <h3 className="text-lg font-display font-medium text-white mb-4 tracking-tight drop-shadow-sm">{cls.teacher_name}'s Lab</h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-sans text-white/40 italic">{cls.assignments?.length || 0} tasks</span>
                                        <div className="w-8 h-8 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white/40 group-hover:text-cyan-300 group-hover:border-cyan-400/30 transition-all">
                                            <ArrowRight size={14} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* Progress & Analytics */}
                    <section className="p-8 rounded-[40px] bg-black/40 backdrop-blur-xl border border-white/10 space-y-8 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h2 className="text-xl font-display font-medium text-white uppercase tracking-tight drop-shadow-sm">Learning Progress</h2>
                                <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest leading-none">Subject Mastery & Engagement</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Total Time</span>
                                    <span className="text-lg font-display font-medium text-white leading-none">14.5 hrs</span>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Quizzes</span>
                                    <span className="text-lg font-display font-medium text-emerald-400 leading-none">88% Avg</span>
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
                            <div key={i} className="p-6 rounded-[28px] bg-black/40 border border-white/10 hover:bg-white/5 transition-all group cursor-pointer">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mb-4 group-hover:text-cyan-300 group-hover:border-cyan-400/30 transition-all">
                                    <tool.icon size={18} />
                                </div>
                                <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">{tool.count}</div>
                                <div className="text-sm font-sans font-medium text-white">{tool.label}</div>
                            </div>
                        ))}
                    </section>
                </div>

                {/* Right Column: Library & Sidebar */}
                <div className="lg:col-span-4 space-y-8">

                    {/* Simulation Assignments / Tasks */}
                    <div className="p-8 rounded-[40px] bg-black/40 backdrop-blur-xl border border-white/10 space-y-6 shadow-xl">
                        <h3 className="text-[10px] font-mono text-cyan-300 uppercase tracking-[0.3em] flex items-center gap-2 drop-shadow-sm">
                            <Play size={12} className="drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                            Active Assignments
                        </h3>
                        <div className="space-y-4">
                            {upcomingTasks.map((task, i) => (
                                <div key={i} className="group p-4 rounded-[20px] bg-black/30 border border-white/5 hover:border-white/20 hover:bg-black/50 transition-all cursor-pointer">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-[8px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 rounded-md border ${task.status === 'Live' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse' : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                                            }`}>
                                            {task.status}
                                        </span>
                                        <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Due {task.dueDate}</span>
                                    </div>
                                    <h4 className="text-sm font-sans font-medium text-white mb-0.5 group-hover:text-cyan-100 transition-colors">{task.title}</h4>
                                    <p className="text-[10px] text-white/40">{task.teacher_name}</p>
                                </div>
                            ))}
                        </div>
                        <button className="w-full py-4 rounded-3xl bg-gradient-to-r from-cyan-600/20 to-violet-600/20 border border-white/10 text-[9px] font-mono uppercase tracking-[0.3em] text-cyan-100 hover:border-cyan-400/40 transition-all shadow-inner">
                            View All Assignments
                        </button>
                    </div>

                    {/* Achievements / Gamification */}
                    <div className="p-8 rounded-[40px] bg-black/40 backdrop-blur-xl border border-white/10 space-y-8 shadow-lg overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-violet-500/10 pointer-events-none" />
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-mono text-violet-300 uppercase tracking-[0.3em] flex items-center gap-2 drop-shadow-sm">
                                <Trophy size={12} className="drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                                Achievements
                            </h3>
                            <span className="text-[9px] font-mono text-white/30 tracking-widest">12 / 40 UNLOCKED</span>
                        </div>

                        <div className="space-y-6">
                            {achievements.map((badge, i) => (
                                <div key={i} className="flex gap-4 items-start group/badge">
                                    <div className={`w-12 h-12 rounded-[18px] bg-black/40 border border-white/5 flex items-center justify-center ${badge.color} group-hover/badge:scale-110 transition-transform shadow-inner`}>
                                        <badge.icon size={22} className="drop-shadow-[0_0_8px_currentColor]" />
                                    </div>
                                    <div className="flex-1 space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-sans font-medium text-white leading-none">{badge.name}</span>
                                            <span className="text-[10px] font-mono text-white/30">{badge.progress}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-black/50 rounded-full overflow-hidden">
                                            <div className={`h-full ${badge.color.replace('text', 'bg')} w-[${badge.progress}%]`} style={{ width: `${badge.progress}%` }} />
                                        </div>
                                        <p className="text-[9px] font-sans text-white/40 leading-tight">{badge.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notice Board */}
                    <div className="p-8 rounded-[40px] bg-gradient-to-br from-[#0F172A] to-[#1E293B] border border-white/10 space-y-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <Bell size={100} />
                        </div>
                        <h3 className="text-[10px] font-mono text-cyan-300 uppercase tracking-[0.3em] relative z-10">Notice Board</h3>
                        <div className="space-y-4 relative z-10">
                            <div className="space-y-1">
                                <p className="text-xs text-white/70 font-sans leading-relaxed italic">
                                    "Don't forget to check the new Quantum Config simulation! It helps with the quiz."
                                </p>
                                <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest">- Dr. Wilson</span>
                            </div>
                            <div className="w-full h-px bg-white/5" />
                            <div className="space-y-1 opacity-50 hover:opacity-100 transition-opacity">
                                <p className="text-[11px] text-white/60 font-sans leading-relaxed">
                                    "Lab equipment orientation starts at 10 AM Monday."
                                </p>
                                <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">Admin</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Footer / Floating Quick Access */}
            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl z-50">
                <div className="flex items-center gap-1.5 px-4 pr-6 border-r border-white/10">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Active</span>
                </div>
                {['Dashboard', 'Labs', 'Library', 'Notes'].map((item) => (
                    <button key={item} className={`px-5 py-2.5 rounded-2xl text-[10px] font-mono uppercase tracking-widest transition-all ${item === 'Dashboard' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 shadow-inner' : 'text-white/40 hover:text-white hover:bg-white/5'
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
                        className="relative w-full max-w-md p-8 rounded-[40px] bg-[#0F172A] border border-white/10 shadow-2xl overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-violet-500/10 pointer-events-none" />
                        
                        <div className="relative z-10 space-y-6">
                            <div className="space-y-2 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-300 mx-auto mb-4">
                                    <Sparkles size={32} />
                                </div>
                                <h2 className="text-2xl font-display font-medium text-white">Join a Classroom</h2>
                                <p className="text-sm text-white/60">Enter the 6-digit code provided by your teacher to unlock your lab access.</p>
                            </div>

                            <form onSubmit={handleJoinClass} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] ml-2">Classroom Code</label>
                                    <input 
                                        autoFocus
                                        type="text" 
                                        placeholder="E.g. A7X8K1"
                                        value={inviteCode}
                                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                        maxLength={10}
                                        className="w-full px-6 py-4 rounded-2xl bg-black/40 border border-white/10 text-white placeholder:text-white/20 focus:border-cyan-500/50 outline-none transition-all text-center text-xl font-mono tracking-[0.5em]"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button 
                                        type="button"
                                        onClick={() => setIsJoinModalOpen(false)}
                                        className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 text-[10px] font-mono uppercase tracking-widest hover:bg-white/10 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={isJoining || inviteCode.length < 5}
                                        className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-[10px] font-mono uppercase tracking-widest shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:grayscale transition-all"
                                    >
                                        {isJoining ? 'Connecting...' : 'Join Class'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
