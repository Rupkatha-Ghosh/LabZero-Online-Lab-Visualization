import React from 'react';
import axios from 'axios';
import { uploadAssignmentFile, deleteAssignmentFile } from '../../utils/supabaseClient';
import {
  Users,
  BookOpen,
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
  Video,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { Skeleton } from 'boneyard-js/react';
import { classroomsService } from '../../services/classroomsService';
import { getSubjects } from '../../services/subjectsService';

interface TeacherDashboardProps {
  onBack?: () => void;
  onStartMeeting?: (classroom: any) => void;
  skeletonDebug?: boolean;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onBack, onStartMeeting }) => {
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
  const [isOnlineClassMenuOpen, setIsOnlineClassMenuOpen] = React.useState(false);

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
    { label: 'Total Students', value: (Array.isArray(classes) ? classes.reduce((acc, curr) => acc + (curr.students_count || 0), 0) : 0).toString(), icon: Users, color: 'text-sky-700', bg: 'bg-sky-100', border: 'border-sky-200', glow: 'from-sky-500/10' },
    { label: 'Active Courses', value: (Array.isArray(classes) ? classes.length : 0).toString(), icon: BookOpen, color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200', glow: 'from-emerald-500/10' },
    { label: 'Avg. Progress', value: '84%', icon: TrendingUp, color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-200', glow: 'from-amber-500/10' },
    { label: 'Engagement', value: '92', icon: Award, color: 'text-violet-700', bg: 'bg-violet-100', border: 'border-violet-200', glow: 'from-violet-500/10' },
  ];

  return (
    <div className="teacher-dashboard h-full overflow-y-auto bg-[#f6f8fb] p-8 space-y-12 pb-32 relative text-slate-900">
      <div className="teacher-dashboard-bg absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_30rem),radial-gradient(circle_at_top_right,_rgba(124,58,237,0.13),_transparent_28rem),linear-gradient(180deg,_#f8fbff_0%,_#eef6f4_100%)] pointer-events-none" />
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-7xl mx-auto relative z-[60] w-full">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="teacher-secondary-button p-3 bg-white/85 border border-slate-200 rounded-xl hover:bg-white text-slate-700 transition-all shadow-sm mt-6 md:mt-0 self-start"
            >
              Go Back
            </button>
          )}
          <div className="space-y-2">
            <div className="teacher-kicker flex items-center gap-3 text-sky-700 font-mono text-[10px] uppercase tracking-[0.3em]">
              <div className="teacher-kicker-icon p-1.5 rounded-lg bg-sky-100 border border-sky-200 text-sky-700 shadow-sm">
                <Sparkles size={12} />
              </div>
              Professional Dashboard
            </div>
            <h1 className="teacher-heading text-4xl font-display font-medium text-slate-950 tracking-tight">
              Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-600 via-teal-600 to-violet-600">{user?.first_name}</span>
            </h1>
            <p className="teacher-muted text-slate-600 font-sans text-sm">Monitor your classes and student engagement today.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {onStartMeeting && (
            <div className="relative">
              <button
                onClick={() => setIsOnlineClassMenuOpen((current) => !current)}
                className="flex items-center gap-2 rounded-2xl bg-sky-600 px-6 py-3 text-xs font-semibold text-white shadow-[0_12px_30px_rgba(2,132,199,0.22)] transition-all hover:bg-sky-500"
              >
                <Video size={16} />
                <span>Online Class</span>
                <ChevronDown size={16} className={`transition-transform ${isOnlineClassMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isOnlineClassMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    className="absolute right-0 top-14 z-[120] w-80 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
                  >
                    <div className="border-b border-slate-100 px-5 py-4">
                      <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-sky-700">Start a live class</p>
                      <p className="mt-1 text-xs text-slate-500">Choose the classroom you want to open.</p>
                    </div>
                    <div className="max-h-72 overflow-y-auto p-2">
                      {classes.length > 0 ? classes.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setIsOnlineClassMenuOpen(false);
                            onStartMeeting(item);
                          }}
                          className="flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition-all hover:bg-sky-50"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
                            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                              Invite: {item.invite_code || 'N/A'} · {item.students_count || 0} students
                            </p>
                          </div>
                          <Video size={16} className="shrink-0 text-sky-600" />
                        </button>
                      )) : (
                        <div className="px-4 py-8 text-center text-xs text-slate-500">
                          Create a classroom before starting an online class.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="teacher-secondary-button px-6 py-3 rounded-2xl bg-white/90 border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 hover:text-slate-950 transition-all shadow-sm hover:border-sky-200"
          >
            Create Class
          </button>
          <button 
            onClick={() => {
              // Pre-fill classroom if one is selected
              setNewAssignment(prev => ({ ...prev, classroom: selectedClass?.id || '' }));
              setIsAssignmentModalOpen(true);
            }}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-violet-600 text-white text-xs font-semibold hover:from-sky-500 hover:to-violet-500 shadow-[0_12px_30px_rgba(2,132,199,0.22)] border border-white/50 transition-all flex items-center gap-2 group"
          >
            <Plus size={16} className="group-hover:rotate-90 transition-transform" />
            <span>New Assignment</span>
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
              className={`teacher-stat-card p-8 rounded-[32px] bg-white/90 border border-white shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl group hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(15,23,42,0.12)] transition-all relative overflow-hidden`}
            >
              <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${stat.glow} to-transparent pointer-events-none`} />
              <div className={`teacher-stat-icon w-12 h-12 rounded-2xl ${stat.bg} ${stat.border} border ${stat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner`}>
                <stat.icon size={24} />
              </div>
              <div className="teacher-stat-value text-3xl font-display font-semibold text-slate-950 mb-1 relative">{stat.value}</div>
              <div className="teacher-stat-label text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] leading-none relative">{stat.label}</div>
            </motion.div>
          ))}
        </section>
      </Skeleton>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto relative z-10">
        {/* Main Content: Upcoming Classes */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="teacher-section-title text-xl font-display font-semibold text-slate-900 uppercase tracking-tight flex items-center gap-3">
              <Calendar size={20} className="text-sky-600" />
              Schedule Today
            </h2>
            <button className="teacher-muted-link text-[10px] font-mono text-slate-500 hover:text-sky-700 uppercase tracking-[0.2em] transition-all font-semibold">
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
                      className="teacher-class-row group p-6 rounded-[28px] bg-white/90 backdrop-blur-md border border-slate-200/80 hover:border-sky-300 hover:bg-sky-50/70 transition-all flex items-center justify-between shadow-[0_12px_35px_rgba(15,23,42,0.07)] cursor-pointer"
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner ${item.is_live ? 'bg-sky-100 text-sky-700 border-sky-200 animate-pulse shadow-[0_0_15px_rgba(14,165,233,0.18)]' : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                          <Play size={20} />
                        </div>
                        <div>
                          <h3 className="teacher-class-title text-sm font-sans font-semibold text-slate-900 mb-1 group-hover:text-sky-700 transition-colors">{item.name}</h3>
                          <div className="teacher-class-meta flex items-center gap-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5 text-teal-700 font-bold"><Sparkles size={12} /> Invite Code: {item.invite_code}</span>
                            <span className="flex items-center gap-1.5"><Users size={12} /> {item.students_count} Students</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {onStartMeeting && (
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              onStartMeeting(item);
                            }}
                            className="hidden items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-[9px] font-mono uppercase tracking-[0.18em] text-white shadow-lg shadow-sky-600/20 transition-all hover:bg-sky-500 md:flex"
                          >
                            <Video size={14} />
                            Start
                          </button>
                        )}
                        <span className={`text-[9px] font-mono uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border ${item.is_live ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-inner' : 'bg-slate-100 text-slate-500 border-slate-200 shadow-inner'
                          }`}>
                          {item.is_live ? 'Live' : 'Inactive'}
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-sky-700 group-hover:border-sky-200 transition-all shadow-sm">
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
          <div className="teacher-feature-card p-8 rounded-[40px] bg-gradient-to-br from-sky-600 via-teal-600 to-violet-700 backdrop-blur-2xl text-white relative overflow-hidden group shadow-[0_18px_50px_rgba(14,116,144,0.24)] border border-white/40">
            <div className="absolute -right-8 -bottom-8 opacity-20 group-hover:scale-110 transition-transform duration-1000">
              <Sparkles size={200} />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-sky-50">Gesture Control</span>
                <span className="px-3 py-1 rounded-lg bg-white/15 border border-white/25 text-[8px] font-mono uppercase tracking-widest shadow-inner">Active</span>
              </div>
              <h3 className="text-2xl font-display font-semibold tracking-tight leading-tight">
                Ready for Immersive Teaching
              </h3>
              <p className="text-sm font-sans text-sky-50 leading-relaxed">
                Use advanced hand gestures to manipulate models and navigate materials during your session.
              </p>
              <button className="w-full py-4 rounded-[20px] bg-white text-slate-900 text-[10px] font-mono uppercase tracking-[0.2em] hover:bg-sky-50 transition-all shadow-[0_10px_24px_rgba(15,23,42,0.18)] font-semibold">
                Launch Presentation
              </button>
            </div>
          </div>

          <div className="teacher-inquiries-card p-8 rounded-[40px] bg-white/90 backdrop-blur-xl border border-slate-200/80 space-y-6 shadow-[0_16px_45px_rgba(15,23,42,0.08)]">
            <h3 className="text-[10px] font-mono text-violet-700 uppercase tracking-[0.3em] flex items-center gap-2 font-bold">
              <MessageSquare size={12} />
              Recent Inquiries
            </h3>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 shrink-0 group-hover:text-sky-700 group-hover:border-sky-200 transition-all shadow-inner">
                    <Users size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-sans text-slate-600 leading-snug group-hover:text-slate-950 transition-colors">
                      Student #0{i} asked about Electron Affinity in Section B...
                    </p>
                    <span className="text-[9px] font-mono text-teal-700/70 uppercase tracking-widest mt-1.5 inline-block">10 min ago</span>
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
              className="teacher-modal-scrim absolute inset-0 bg-slate-900/35 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="teacher-detail-panel relative w-full h-full max-w-6xl bg-[#f8fafc] border border-white shadow-2xl overflow-hidden flex flex-col md:rounded-[40px]"
            >
              <div className="teacher-detail-bg absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.15),_transparent_26rem),radial-gradient(circle_at_bottom_left,_rgba(124,58,237,0.09),_transparent_24rem)] pointer-events-none" />
              
              {/* Overlay Header */}
              <div className="teacher-detail-header p-8 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 bg-white/82 backdrop-blur-xl">
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border shadow-lg ${
                    selectedClass.is_live ? 'bg-sky-100 text-sky-700 border-sky-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    <Play size={28} />
                  </div>
                  <div>
                    <h2 className="teacher-heading text-3xl font-display font-bold text-slate-950 tracking-tight">{selectedClass.name}</h2>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-[10px] font-mono text-sky-700 uppercase tracking-[0.2em] font-bold">Invite: {selectedClass.invite_code}</span>
                      <div className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{selectedClass.students_count} Students Enrolled</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {onStartMeeting && (
                    <button
                      onClick={() => onStartMeeting(selectedClass)}
                      className="flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white shadow-lg shadow-sky-600/20 transition-all hover:bg-sky-500"
                    >
                      <Video size={18} />
                      Start Online Class
                    </button>
                  )}
                  <button 
                    onClick={() => handleDeleteClass(selectedClass.id, selectedClass.name)}
                    className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                    title="Delete Class"
                  >
                    <Trash2 size={20} />
                  </button>
                  <button 
                    onClick={() => setSelectedClass(null)}
                    className="teacher-secondary-button p-3 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition-all shadow-sm"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Overlay Body */}
              <div className="flex-1 overflow-hidden flex flex-col relative z-10">
                {/* Tabs & Search */}
                <div className="teacher-detail-toolbar px-8 py-6 bg-white/60 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="teacher-tabs flex p-1 bg-slate-100 rounded-2xl border border-slate-200 w-fit">
                    {[
                      { id: 'students', label: 'Students', icon: Users },
                      { id: 'assignments', label: 'Assignments', icon: FileText },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all ${
                          activeTab === tab.id ? 'bg-white text-sky-700 shadow-sm border border-sky-100' : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        <tab.icon size={14} />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative group max-w-md w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-600 transition-colors" size={18} />
                    <input 
                      type="text"
                      placeholder={`Search ${activeTab}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="teacher-input w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-300 outline-none transition-all shadow-inner"
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
                          <div key={student.id} className="teacher-list-card p-5 rounded-3xl bg-white/90 border border-slate-200 hover:border-sky-300 transition-all flex items-center justify-between group shadow-sm">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-50 to-violet-50 border border-slate-200 flex items-center justify-center text-violet-700 font-display font-bold text-lg shadow-inner group-hover:scale-110 transition-transform">
                                {student.first_name?.[0] || student.username[0]}
                              </div>
                              <div>
                                <div className="teacher-class-title text-sm font-sans font-medium text-slate-900">{student.first_name} {student.last_name}</div>
                                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">@{student.username}</div>
                              </div>
                            </div>
                            <button className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100">
                              <Trash2 size={16} />
                            </button>
                          </div>
                      ))}
                      {(!selectedClass.students || selectedClass.students.length === 0) && (
                        <div className="col-span-full py-20 text-center space-y-4">
                          <div className="w-16 h-16 rounded-3xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
                            <Users size={32} strokeWidth={1} />
                          </div>
                          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">No students found</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'assignments' && (
                    <div className="space-y-4">
                      {selectedClass.assignments && selectedClass.assignments.map((task: any) => (
                        <div key={task.id} className="teacher-list-card p-6 rounded-3xl bg-white/90 border border-slate-200 hover:border-sky-300 transition-all flex items-center justify-between group relative shadow-sm">
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700">
                              <FileText size={20} />
                            </div>
                            <div>
                              <h4 className="teacher-class-title text-sm font-sans font-semibold text-slate-900 mb-1">{task.title}</h4>
                              <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                                <span>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <span className="text-teal-700 font-bold">{task.topic_name || 'General'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="relative">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === task.id ? null : task.id);
                              }}
                              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all"
                            >
                              <MoreVertical size={18} />
                            </button>
                            
                            <AnimatePresence>
                              {activeMenuId === task.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                  className="absolute right-0 top-12 w-40 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
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
                          <div className="w-16 h-16 rounded-3xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
                            <Plus size={32} strokeWidth={1} />
                          </div>
                          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">No assignments created yet</p>
                          <button 
                            onClick={() => {
                              setNewAssignment(prev => ({ ...prev, classroom: selectedClass.id }));
                              setIsAssignmentModalOpen(true);
                            }}
                            className="px-6 py-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 text-[10px] font-mono uppercase tracking-widest hover:bg-sky-100 transition-all"
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
              className="teacher-modal-scrim absolute inset-0 bg-slate-900/35 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="teacher-form-modal relative w-full max-w-md p-8 rounded-[40px] bg-white border border-white shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-100/70 via-transparent to-sky-100/70 pointer-events-none" />
              
              <div className="relative z-10 space-y-6">
                <div className="space-y-2 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-700 mx-auto mb-4">
                    <Plus size={32} />
                  </div>
                  <h2 className="teacher-heading text-2xl font-display font-semibold text-slate-950">Create a Classroom</h2>
                  <p className="teacher-muted text-sm text-slate-600">Launch a new learning space where you can share labs and monitor your students.</p>
                </div>

                <form onSubmit={handleCreateClass} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] ml-2">Classroom Name</label>
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="E.g. Grade 11 Physics - Sec A"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      className="teacher-input w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-sky-300 outline-none transition-all shadow-inner"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button 
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="teacher-secondary-button flex-1 py-4 rounded-2xl bg-white border border-slate-200 text-slate-600 text-[10px] font-mono uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isCreating || !newClassName}
                      className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-sky-600 text-white text-[10px] font-mono uppercase tracking-widest shadow-lg disabled:opacity-50 disabled:grayscale transition-all"
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
              className="teacher-modal-scrim absolute inset-0 bg-slate-900/35 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="teacher-form-modal relative w-full max-w-2xl p-8 rounded-[40px] bg-white border border-white shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-sky-100/70 via-transparent to-violet-100/70 pointer-events-none" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700">
                      <Plus size={24} />
                    </div>
                    <div>
                      <h2 className="teacher-heading text-xl font-display font-semibold text-slate-950">New Assignment</h2>
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">For {selectedClass?.name}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setIsAssignmentModalOpen(false);
                      setNewAssignment({ title: '', description: '', topic: '', due_date: '', file: null, classroom: '' });
                    }}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleCreateAssignment} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-2">Target Classroom</label>
                    <div className="relative">
                      <select 
                        required
                        value={newAssignment.classroom}
                        onChange={(e) => setNewAssignment({...newAssignment, classroom: e.target.value})}
                        className="teacher-input w-full px-6 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:border-sky-300 outline-none transition-all appearance-none"
                      >
                        <option value="">Select a Classroom</option>
                        {classes.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={16} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-2">Assignment Title</label>
                      <input 
                        required
                        type="text" 
                        placeholder="E.g. Hydrogen Spectroscopy Lab"
                        value={newAssignment.title}
                        onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                        className="teacher-input w-full px-6 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-300 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-2">Due Date</label>
                      <input 
                        type="datetime-local"
                        value={newAssignment.due_date}
                        onChange={(e) => setNewAssignment({...newAssignment, due_date: e.target.value})}
                        className="teacher-input w-full px-6 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:border-sky-300 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-2">Related Lab Topic</label>
                    <div className="relative">
                      <select 
                        value={newAssignment.topic}
                        onChange={(e) => setNewAssignment({...newAssignment, topic: e.target.value})}
                        className="teacher-input w-full px-6 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:border-sky-300 outline-none transition-all appearance-none"
                      >
                        <option value="">Select a Lab (Optional)</option>
                        {topics.map((t: any) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={16} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-2">Instructions</label>
                    <textarea 
                      placeholder="Enter assignment details or instructions..."
                      value={newAssignment.description}
                      onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                      rows={3}
                      className="teacher-input w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-300 outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-2">Attachment (PDF/Doc)</label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        onChange={(e) => setNewAssignment({...newAssignment, file: e.target.files?.[0] || null})}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="teacher-input w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 border-dashed group-hover:border-sky-300 transition-all flex items-center gap-4">
                        <Upload size={20} className="text-slate-500" />
                        <span className="text-sm text-slate-600">
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
                      className="teacher-secondary-button flex-1 py-4 rounded-2xl bg-white border border-slate-200 text-slate-600 text-[10px] font-mono uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isCreating || !newAssignment.title}
                      className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-sky-600 to-violet-600 text-white text-[10px] font-mono uppercase tracking-widest shadow-lg disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-2"
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
