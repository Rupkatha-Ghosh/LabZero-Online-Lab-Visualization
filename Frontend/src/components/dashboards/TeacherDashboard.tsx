import React from 'react';
import axios from 'axios';
import { uploadAssignmentFile, deleteAssignmentFile } from '../../utils/supabaseClient';
import {
  Users,
  BookOpen,
  Clock,
  BarChart,
  Calendar,
  MessageSquare,
  Plus,
  Play,
  Upload,
  MoreVertical,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Award,
  Trash2,
  Search,
  X,
  FileText,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { Skeleton } from 'boneyard-js/react';
import { classroomsService } from '../../services/classroomsService';
import { getSubjects } from '../../services/subjectsService';

interface TeacherDashboardProps {
  onBack?: () => void;
  skeletonDebug?: boolean;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [classes, setClasses] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [newClassName, setNewClassName] = React.useState('');
  const [isCreating, setIsCreating] = React.useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = React.useState(false);
  const [newAssignment, setNewAssignment] = React.useState({
    title: '',
    description: '',
    topic: '',
    due_date: '',
    file: null as File | null,
    classroom: ''
  });
  const [selectedClass, setSelectedClass] = React.useState<any | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeMenuId, setActiveMenuId] = React.useState<number | null>(null);
  const [activeTab, setActiveTab] = React.useState<'students' | 'assignments'>('students');
  const [topics, setTopics] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetchClasses();
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const subjects = await getSubjects();
      const allTopics = subjects.flatMap(s => s.topics || []);
      setTopics(allTopics);
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await classroomsService.getClassrooms();
      setClasses(data);
    } catch (error) {
      console.error("Error fetching teacher classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName) return;
    try {
      setIsCreating(true);
      await classroomsService.createClassroom(newClassName);
      setIsCreateModalOpen(false);
      setNewClassName('');
      fetchClasses(); // Refresh list
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.response?.data?.detail || "Failed to create classroom.";
      alert(errorMsg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteClass = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? All assignments and student links for this class will be lost.`)) {
      return;
    }
    try {
      await classroomsService.deleteClassroom(id);
      alert("Classroom deleted.");
      fetchClasses(); // Refresh list
    } catch (error) {
      alert("Failed to delete classroom.");
    }
  };

  const handleDeleteAssignment = async (assignmentId: number) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    try {
      // Find the assignment to get its file_url
      const taskToDelete = selectedClass?.assignments?.find((a: any) => a.id === assignmentId);
      if (taskToDelete?.file_url) {
        await deleteAssignmentFile(taskToDelete.file_url);
      }

      const token = localStorage.getItem('labzero_token');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'}/classrooms/assignments/${assignmentId}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchClasses();
      const updatedClasses = await classroomsService.getClassrooms();
      setClasses(updatedClasses);
      if (selectedClass) {
        const updatedSelected = updatedClasses.find((c: any) => c.id === selectedClass.id);
        if (updatedSelected) setSelectedClass(updatedSelected);
      }
      setActiveMenuId(null);
    } catch (error) {
      alert("Failed to delete assignment.");
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    // Use the classroom ID from the modal state or the selectedClass
    const targetClassroomId = newAssignment.classroom || selectedClass?.id;
    if (!newAssignment.title || !targetClassroomId) {
      alert("Please select a classroom and enter a title.");
      return;
    }
    
    try {
      setIsCreating(true);
      
      let finalFileUrl = '';
      if (newAssignment.file) {
        finalFileUrl = await uploadAssignmentFile(newAssignment.file, targetClassroomId);
      }

      const payload = {
        classroom: targetClassroomId,
        title: newAssignment.title,
        description: newAssignment.description,
        topic: newAssignment.topic || null,
        due_date: newAssignment.due_date || null,
        file_url: finalFileUrl
      };

      const token = localStorage.getItem('labzero_token');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'}/classrooms/assignments/`, payload, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setIsAssignmentModalOpen(false);
      setNewAssignment({ title: '', description: '', topic: '', due_date: '', file: null, classroom: '' });
      fetchClasses();
      
      const updatedClasses = await classroomsService.getClassrooms();
      setClasses(updatedClasses);
      if (selectedClass) {
        const updatedSelected = updatedClasses.find((c: any) => c.id === selectedClass.id);
        if (updatedSelected) setSelectedClass(updatedSelected);
      }

      alert("Assignment created successfully!");
    } catch (error: any) {
      console.error("Assignment creation error:", error);
      alert(`Failed to create assignment: ${error.message || 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  const stats = [
    { label: 'Total Students', value: (Array.isArray(classes) ? classes.reduce((acc, curr) => acc + (curr.students_count || 0), 0) : 0).toString(), icon: Users, color: 'text-cyan-300', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    { label: 'Active Courses', value: (Array.isArray(classes) ? classes.length : 0).toString(), icon: BookOpen, color: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Avg. Progress', value: '84%', icon: TrendingUp, color: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { label: 'Engagement', value: '92', icon: Award, color: 'text-violet-300', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  ];

  return (
    <div className="h-full overflow-y-auto bg-transparent p-8 space-y-12 pb-32 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-7xl mx-auto relative z-10 w-full">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white transition-all shadow-md mt-6 md:mt-0 self-start"
            >
              Go Back
            </button>
          )}
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-cyan-300 font-mono text-[10px] uppercase tracking-[0.3em] drop-shadow-sm">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/30">
                <Sparkles size={12} className="drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              </div>
              Professional Dashboard
            </div>
            <h1 className="text-4xl font-display font-medium text-white tracking-tight drop-shadow-md">
              Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-500">{user?.first_name}</span>
            </h1>
            <p className="text-white/60 font-sans text-sm drop-shadow-sm">Monitor your classes and student engagement today.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 rounded-2xl bg-black/40 border border-white/10 text-white/80 text-xs font-medium hover:bg-white/10 hover:text-white transition-all shadow-inner hover:border-white/20"
          >
            Create Class
          </button>
          <button 
            onClick={() => {
              // Pre-fill classroom if one is selected
              setNewAssignment(prev => ({ ...prev, classroom: selectedClass?.id || '' }));
              setIsAssignmentModalOpen(true);
            }}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-xs font-medium hover:from-cyan-400 hover:to-violet-500 shadow-[0_4px_20px_rgba(34,211,238,0.3)] border border-white/20 transition-all flex items-center gap-2 group"
          >
            <Plus size={16} className="drop-shadow-sm group-hover:rotate-90 transition-transform" />
            <span className="drop-shadow-sm">New Assignment</span>
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <Skeleton name="teacher-stats" loading={false}>
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto relative z-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-[32px] bg-black/40 border border-white/10 backdrop-blur-xl group hover:border-white/20 hover:bg-black/60 transition-all shadow-lg"
            >
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.border} border ${stat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner`}>
                <stat.icon size={24} className="drop-shadow-md" />
              </div>
              <div className="text-3xl font-display font-medium text-white mb-1 drop-shadow-sm group-hover:text-cyan-300 transition-colors">{stat.value}</div>
              <div className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] leading-none">{stat.label}</div>
            </motion.div>
          ))}
        </section>
      </Skeleton>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto relative z-10">
        {/* Main Content: Upcoming Classes */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-medium text-white uppercase tracking-tight flex items-center gap-3 drop-shadow-sm">
              <Calendar size={20} className="text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
              Schedule Today
            </h2>
            <button className="text-[10px] font-mono text-white/40 hover:text-cyan-300 uppercase tracking-[0.2em] transition-all drop-shadow-sm">
              View Calendar
            </button>
          </div>

          <div>
            <Skeleton name="teacher-classes" loading={loading}>
              <div className="space-y-4">
                {Array.isArray(classes) && classes.map((item, i) => (
                  <div key={item.id || i} className="space-y-2">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      onClick={() => setSelectedClass(item)}
                      className="group p-6 rounded-[28px] bg-[var(--bg-panel)] backdrop-blur-md border border-[var(--border-glass)] hover:border-[var(--color-cyan)]/30 hover:bg-[var(--color-cyan)]/5 transition-all flex items-center justify-between shadow-lg cursor-pointer"
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner ${item.is_live ? 'bg-[var(--color-cyan)]/20 text-[var(--color-cyan)] border-[var(--color-cyan)]/30 animate-pulse shadow-[0_0_15px_rgba(var(--color-cyan-rgb),0.2)]' : 'bg-[var(--bg-deep)] text-[var(--text-muted)] border-[var(--border-glass)]'
                          }`}>
                          <Play size={20} className={item.is_live ? 'drop-shadow-[0_0_8px_rgba(var(--color-cyan-rgb),0.8)]' : ''} />
                        </div>
                        <div>
                          <h3 className="text-sm font-sans font-medium text-[var(--text-primary)] mb-1 group-hover:text-[var(--color-cyan)] transition-colors drop-shadow-sm">{item.name}</h3>
                          <div className="flex items-center gap-4 text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
                            <span className="flex items-center gap-1.5 text-[var(--color-cyan)]/80 font-bold"><Sparkles size={12} /> Invite Code: {item.invite_code}</span>
                            <span className="flex items-center gap-1.5"><Users size={12} /> {item.students_count} Students</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-[9px] font-mono uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border ${item.is_live ? 'bg-[var(--color-cyan)]/10 text-[var(--color-cyan)] border-[var(--color-cyan)]/20 shadow-inner' : 'bg-[var(--bg-deep)] text-[var(--text-muted)] border-[var(--border-glass)] shadow-inner'
                          }`}>
                          {item.is_live ? 'Live' : 'Inactive'}
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-glass)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-all">
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </Skeleton>
          </div>
        </div>

        {/* Sidebar: Announcements & Tasks */}
        <div className="lg:col-span-4 space-y-8">
          <div className="p-8 rounded-[40px] bg-gradient-to-br from-cyan-600/90 to-violet-800/90 backdrop-blur-2xl text-white relative overflow-hidden group shadow-[0_8px_32px_rgba(34,211,238,0.2)] border border-white/20">
            <div className="absolute -right-8 -bottom-8 opacity-20 group-hover:scale-110 transition-transform duration-1000 mix-blend-overlay">
              <Sparkles size={200} />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-100 drop-shadow-sm">Gesture Control</span>
                <span className="px-3 py-1 rounded-lg bg-black/30 border border-white/20 text-[8px] font-mono uppercase tracking-widest shadow-inner drop-shadow-sm">Active</span>
              </div>
              <h3 className="text-2xl font-display font-medium tracking-tight leading-tight drop-shadow-md">
                Ready for Immersive Teaching
              </h3>
              <p className="text-sm font-sans text-cyan-50 leading-relaxed drop-shadow-sm">
                Use advanced hand gestures to manipulate models and navigate materials during your session.
              </p>
              <button className="w-full py-4 rounded-[20px] bg-white text-slate-900 text-[10px] font-mono uppercase tracking-[0.2em] hover:bg-cyan-50 transition-all shadow-[0_4px_15px_rgba(255,255,255,0.4)]">
                Launch Presentation
              </button>
            </div>
          </div>

          <div className="p-8 rounded-[40px] bg-black/40 backdrop-blur-xl border border-white/10 space-y-6 shadow-lg">
            <h3 className="text-[10px] font-mono text-cyan-300 uppercase tracking-[0.3em] flex items-center gap-2 drop-shadow-sm">
              <MessageSquare size={12} className="drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
              Recent Inquiries
            </h3>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center text-white/40 shrink-0 group-hover:text-cyan-300 group-hover:border-cyan-400/30 transition-all shadow-inner">
                    <Users size={16} className="group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  </div>
                  <div>
                    <p className="text-xs font-sans text-white/70 leading-snug group-hover:text-white transition-colors drop-shadow-sm">
                      Student #0{i} asked about Electron Affinity in Section B...
                    </p>
                    <span className="text-[9px] font-mono text-cyan-300/50 uppercase tracking-widest mt-1.5 inline-block drop-shadow-sm">10 min ago</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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
              className="relative w-full h-full max-w-6xl bg-[var(--bg-deep)] border border-[var(--border-glass)] shadow-2xl overflow-hidden flex flex-col md:rounded-[40px]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
              
              {/* Overlay Header */}
              <div className="p-8 border-b border-[var(--border-glass)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 bg-[var(--bg-panel)]/50">
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border shadow-lg ${
                    selectedClass.is_live ? 'bg-[var(--color-cyan)]/20 text-[var(--color-cyan)] border-[var(--color-cyan)]/30' : 'bg-[var(--bg-deep)] text-[var(--text-muted)] border-[var(--border-glass)]'
                  }`}>
                    <Play size={28} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-display font-bold text-[var(--text-primary)] tracking-tight">{selectedClass.name}</h2>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-[10px] font-mono text-[var(--color-cyan)] uppercase tracking-[0.2em] font-bold">Invite: {selectedClass.invite_code}</span>
                      <div className="w-1 h-1 rounded-full bg-[var(--border-glass)]" />
                      <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">{selectedClass.students_count} Students Enrolled</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleDeleteClass(selectedClass.id, selectedClass.name)}
                    className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                    title="Delete Class"
                  >
                    <Trash2 size={20} />
                  </button>
                  <button 
                    onClick={() => setSelectedClass(null)}
                    className="p-3 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-glass)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all shadow-sm"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Overlay Body */}
              <div className="flex-1 overflow-hidden flex flex-col relative z-10">
                {/* Tabs & Search */}
                <div className="px-8 py-6 bg-[var(--bg-panel)]/30 border-b border-[var(--border-glass)] flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex p-1 bg-[var(--bg-deep)] rounded-2xl border border-[var(--border-glass)] w-fit">
                    {[
                      { id: 'students', label: 'Students', icon: Users },
                      { id: 'assignments', label: 'Assignments', icon: FileText },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all ${
                          activeTab === tab.id ? 'bg-[var(--color-cyan)]/20 text-[var(--color-cyan)] shadow-inner' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <tab.icon size={14} />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative group max-w-md w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--color-cyan)] transition-colors" size={18} />
                    <input 
                      type="text"
                      placeholder={`Search ${activeTab}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-[var(--bg-deep)] border border-[var(--border-glass)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/30 focus:border-[var(--color-cyan)]/50 outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-8">
                  {activeTab === 'students' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(selectedClass.students || [])
                        .filter((s: any) => 
                          s.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((student: any) => (
                          <div key={student.id} className="p-5 rounded-3xl bg-[var(--bg-panel)] border border-[var(--border-glass)] hover:border-[var(--color-cyan)]/30 transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-[var(--border-glass)] flex items-center justify-center text-indigo-400 font-display font-bold text-lg shadow-inner group-hover:scale-110 transition-transform">
                                {student.first_name?.[0] || student.username[0]}
                              </div>
                              <div>
                                <div className="text-sm font-sans font-medium text-[var(--text-primary)]">{student.first_name} {student.last_name}</div>
                                <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">@{student.username}</div>
                              </div>
                            </div>
                            <button className="p-2 rounded-xl text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100">
                              <Trash2 size={16} />
                            </button>
                          </div>
                      ))}
                      {(!selectedClass.students || selectedClass.students.length === 0) && (
                        <div className="col-span-full py-20 text-center space-y-4">
                          <div className="w-16 h-16 rounded-3xl bg-[var(--bg-panel)] border border-[var(--border-glass)] flex items-center justify-center text-[var(--text-muted)] mx-auto">
                            <Users size={32} strokeWidth={1} />
                          </div>
                          <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">No students found</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'assignments' && (
                    <div className="space-y-4">
                      {selectedClass.assignments && selectedClass.assignments.map((task: any) => (
                        <div key={task.id} className="p-6 rounded-3xl bg-black/20 border border-white/5 hover:border-white/10 transition-all flex items-center justify-between group relative">
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
                              <FileText size={20} />
                            </div>
                            <div>
                              <h4 className="text-sm font-sans font-medium text-white mb-1">{task.title}</h4>
                              <div className="flex items-center gap-4 text-[10px] font-mono text-white/40 uppercase tracking-widest">
                                <span>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}</span>
                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                <span className="text-cyan-400/60 font-bold">{task.topic_name || 'General'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="relative">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === task.id ? null : task.id);
                              }}
                              className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all"
                            >
                              <MoreVertical size={18} />
                            </button>
                            
                            <AnimatePresence>
                              {activeMenuId === task.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                  className="absolute right-0 top-12 w-40 bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl shadow-2xl z-50 overflow-hidden"
                                >
                                  <button 
                                    onClick={() => handleDeleteAssignment(task.id)}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:bg-rose-500/10 transition-all text-xs font-mono uppercase tracking-widest"
                                  >
                                    <Trash2 size={14} /> Delete
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      ))}
                      {(!selectedClass.assignments || selectedClass.assignments.length === 0) && (
                        <div className="py-20 text-center space-y-4">
                          <div className="w-16 h-16 rounded-3xl bg-[var(--bg-panel)] border border-[var(--border-glass)] flex items-center justify-center text-[var(--text-muted)] mx-auto">
                            <Plus size={32} strokeWidth={1} />
                          </div>
                          <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">No assignments created yet</p>
                          <button 
                            onClick={() => {
                              setNewAssignment(prev => ({ ...prev, classroom: selectedClass.id }));
                              setIsAssignmentModalOpen(true);
                            }}
                            className="px-6 py-2.5 rounded-xl bg-[var(--color-cyan)]/10 border border-[var(--color-cyan)]/20 text-[var(--color-cyan)] text-[10px] font-mono uppercase tracking-widest hover:bg-[var(--color-cyan)]/20 transition-all"
                          >
                            Create First Task
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Classroom Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative w-full max-w-md p-8 rounded-[40px] bg-[var(--bg-deep)] border border-[var(--border-glass)] shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/10 pointer-events-none" />
              
              <div className="relative z-10 space-y-6">
                <div className="space-y-2 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-300 mx-auto mb-4">
                    <Plus size={32} />
                  </div>
                  <h2 className="text-2xl font-display font-medium text-[var(--text-primary)]">Create a Classroom</h2>
                  <p className="text-sm text-[var(--text-muted)]">Launch a new learning space where you can share labs and monitor your students.</p>
                </div>

                <form onSubmit={handleCreateClass} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-[0.2em] ml-2">Classroom Name</label>
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="E.g. Grade 11 Physics - Sec A"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-glass)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/30 focus:border-[var(--color-cyan)]/50 outline-none transition-all shadow-inner"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button 
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="flex-1 py-4 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-glass)] text-[var(--text-muted)] text-[10px] font-mono uppercase tracking-widest hover:bg-[var(--bg-deep)] transition-all shadow-sm"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isCreating || !newClassName}
                      className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[var(--color-violet)] to-[var(--color-cyan)] text-white text-[10px] font-mono uppercase tracking-widest shadow-lg disabled:opacity-50 disabled:grayscale transition-all"
                    >
                      {isCreating ? 'Creating...' : 'Launch Class'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* New Assignment Modal */}
      <AnimatePresence>
        {isAssignmentModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAssignmentModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative w-full max-w-2xl p-8 rounded-[40px] bg-[var(--bg-deep)] border border-[var(--border-glass)] shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-violet-500/10 pointer-events-none" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <Plus size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-display font-medium text-[var(--text-primary)]">New Assignment</h2>
                      <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">For {selectedClass?.name}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setIsAssignmentModalOpen(false);
                      setNewAssignment({ title: '', description: '', topic: '', due_date: '', file: null, classroom: '' });
                    }}
                    className="p-2 rounded-xl hover:bg-[var(--bg-panel)] text-[var(--text-muted)] transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleCreateAssignment} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest ml-2">Target Classroom</label>
                    <div className="relative">
                      <select 
                        required
                        value={newAssignment.classroom}
                        onChange={(e) => setNewAssignment({...newAssignment, classroom: e.target.value})}
                        className="w-full px-6 py-3.5 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-glass)] text-sm text-[var(--text-primary)] focus:border-[var(--color-cyan)]/50 outline-none transition-all appearance-none"
                      >
                        <option value="">Select a Classroom</option>
                        {classes.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-[var(--text-muted)] pointer-events-none" size={16} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest ml-2">Assignment Title</label>
                      <input 
                        required
                        type="text" 
                        placeholder="E.g. Hydrogen Spectroscopy Lab"
                        value={newAssignment.title}
                        onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                        className="w-full px-6 py-3.5 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-glass)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/30 focus:border-[var(--color-cyan)]/50 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest ml-2">Due Date</label>
                      <input 
                        type="datetime-local"
                        value={newAssignment.due_date}
                        onChange={(e) => setNewAssignment({...newAssignment, due_date: e.target.value})}
                        className="w-full px-6 py-3.5 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-glass)] text-sm text-[var(--text-primary)] focus:border-[var(--color-cyan)]/50 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest ml-2">Related Lab Topic</label>
                    <div className="relative">
                      <select 
                        value={newAssignment.topic}
                        onChange={(e) => setNewAssignment({...newAssignment, topic: e.target.value})}
                        className="w-full px-6 py-3.5 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-glass)] text-sm text-[var(--text-primary)] focus:border-[var(--color-cyan)]/50 outline-none transition-all appearance-none"
                      >
                        <option value="">Select a Lab (Optional)</option>
                        {topics.map((t: any) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-[var(--text-muted)] pointer-events-none" size={16} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest ml-2">Instructions</label>
                    <textarea 
                      placeholder="Enter assignment details or instructions..."
                      value={newAssignment.description}
                      onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                      rows={3}
                      className="w-full px-6 py-4 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-glass)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/30 focus:border-[var(--color-cyan)]/50 outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest ml-2">Attachment (PDF/Doc)</label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        onChange={(e) => setNewAssignment({...newAssignment, file: e.target.files?.[0] || null})}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full px-6 py-4 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-glass)] border-dashed group-hover:border-[var(--color-cyan)]/50 transition-all flex items-center gap-4">
                        <Upload size={20} className="text-[var(--text-muted)]" />
                        <span className="text-sm text-[var(--text-muted)]">
                          {newAssignment.file ? newAssignment.file.name : 'Upload instruction file...'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button 
                      type="button"
                      onClick={() => {
                        setIsAssignmentModalOpen(false);
                        setNewAssignment({ title: '', description: '', topic: '', due_date: '', file: null, classroom: '' });
                      }}
                      className="flex-1 py-4 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-glass)] text-[var(--text-muted)] text-[10px] font-mono uppercase tracking-widest hover:bg-[var(--bg-deep)] transition-all shadow-sm"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isCreating || !newAssignment.title}
                      className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-violet)] text-white text-[10px] font-mono uppercase tracking-widest shadow-lg disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-2"
                    >
                      {isCreating ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : 'Assign Task'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherDashboard;
