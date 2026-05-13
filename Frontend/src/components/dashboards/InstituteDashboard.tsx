
import React from 'react';
import {
  Building2,
  Users,
  GraduationCap,
  BarChart3,
  ShieldCheck,
  Settings,
  MoreVertical,
  ArrowUpRight,
  Plus,
  Search,
  School,
  Database,
  PieChart,
  Target,
  Trophy,
  Flame,
  TrendingUp,
  Award,
  X,
  Download
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { Skeleton } from 'boneyard-js/react';

interface InstituteDashboardProps {
  onBack?: () => void;
  skeletonDebug?: boolean;
}

interface FacultyHighlight {
  name: string;
  department: string;
  classes: number;
  performance: number;
}

const InstituteDashboard: React.FC<InstituteDashboardProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [chartMode, setChartMode] = React.useState<'bar' | 'pie'>('bar');
  const [selectedUtilization, setSelectedUtilization] = React.useState<{ label: string; value: number } | null>(null);
  const [selectedFaculty, setSelectedFaculty] = React.useState<FacultyHighlight | null>(null);
  const [showAddFaculty, setShowAddFaculty] = React.useState(false);
  const [showManagementPortal, setShowManagementPortal] = React.useState(false);
  const [actionNotice, setActionNotice] = React.useState<string | null>(null);

  const metrics = [
    { label: 'Total Enrollment', value: '14,250', change: '+12%', icon: Users, color: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'bg-cyan-500/10' },
    { label: 'Faculty Count', value: '450', change: '+3', icon: School, color: 'text-violet-400', border: 'border-violet-500/20', bg: 'bg-violet-500/10' },
    { label: 'Resource Utilization', value: '88.5%', change: '+5.2%', icon: Database, color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10' },
    { label: 'System Health', value: '99.9%', change: 'Optimal', icon: ShieldCheck, color: 'text-fuchsia-400', border: 'border-fuchsia-500/20', bg: 'bg-fuchsia-500/10' },
  ];

  const facultyHighlights: FacultyHighlight[] = [
    { name: 'Dr. Sarah Wilson', department: 'Chemistry', classes: 24, performance: 98 },
    { name: 'Prof. James Miller', department: 'Physics', classes: 18, performance: 95 },
    { name: 'Dr. Elena Rodriguez', department: 'Mathematics', classes: 22, performance: 97 },
  ];

  const consistentStudents = [
    { rank: 1, name: 'Aarav Sharma', grade: 'Class 12', department: 'Physics', streak: 34, attendance: 98, labs: 42, consistency: 97, trend: '+8%' },
    { rank: 2, name: 'Maya Banerjee', grade: 'Class 11', department: 'Chemistry', streak: 29, attendance: 96, labs: 39, consistency: 94, trend: '+6%' },
    { rank: 3, name: 'Rohan Iyer', grade: 'Class 12', department: 'Mathematics', streak: 26, attendance: 95, labs: 37, consistency: 92, trend: '+5%' },
    { rank: 4, name: 'Sara Khan', grade: 'Class 11', department: 'Biology', streak: 21, attendance: 93, labs: 34, consistency: 89, trend: '+4%' },
    { rank: 5, name: 'Dev Patel', grade: 'Class 12', department: 'Chemistry', streak: 18, attendance: 91, labs: 31, consistency: 86, trend: '+3%' },
  ];

  const utilizationData = [
    { label: 'Chem', value: 40, color: 'from-cyan-400 to-sky-500' },
    { label: 'Phys', value: 70, color: 'from-emerald-400 to-teal-500' },
    { label: 'Math', value: 45, color: 'from-violet-400 to-indigo-500' },
    { label: 'Bio', value: 90, color: 'from-amber-300 to-orange-500' },
    { label: 'AI', value: 65, color: 'from-fuchsia-400 to-pink-500' },
    { label: 'VR', value: 80, color: 'from-cyan-300 to-violet-500' },
    { label: 'Mobile', value: 55, color: 'from-lime-300 to-emerald-500' },
    { label: 'Cloud', value: 95, color: 'from-sky-300 to-cyan-500' },
    { label: 'Storage', value: 75, color: 'from-rose-300 to-fuchsia-500' },
    { label: 'Labs', value: 85, color: 'from-indigo-300 to-blue-500' },
  ];

  const utilizationAverage = Math.round(
    utilizationData.reduce((total, item) => total + item.value, 0) / utilizationData.length
  );

  const filteredStudents = consistentStudents.filter((student) => {
    const searchable = `${student.name} ${student.grade} ${student.department}`.toLowerCase();
    return searchable.includes(searchTerm.toLowerCase());
  });

  const filteredFaculty = facultyHighlights.filter((faculty) => {
    const searchable = `${faculty.name} ${faculty.department}`.toLowerCase();
    return searchable.includes(searchTerm.toLowerCase());
  });

  const exportLeaderboardReport = () => {
    const rows = [
      ['Rank', 'Student', 'Grade', 'Department', 'Streak Days', 'Attendance', 'Completed Labs', 'Consistency Score', 'Trend'],
      ...filteredStudents.map((student) => [
        student.rank,
        student.name,
        student.grade,
        student.department,
        student.streak,
        `${student.attendance}%`,
        student.labs,
        student.consistency,
        student.trend,
      ]),
    ];

    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'labzero-consistency-leaderboard.csv';
    link.click();
    URL.revokeObjectURL(url);
    showNotice('Leaderboard CSV exported successfully.');
  };

  const showNotice = (message: string) => {
    setActionNotice(message);
    window.setTimeout(() => setActionNotice(null), 2200);
  };

  return (
    <div className="institute-dashboard h-full overflow-y-auto bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-8 pb-32 relative text-slate-100">
      <div className="institute-dashboard-glow absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(34,211,238,0.16),_transparent_36%),radial-gradient(ellipse_at_bottom_right,_rgba(139,92,246,0.12),_transparent_34%)] pointer-events-none" />
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 max-w-7xl mx-auto relative z-10 w-full">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-3 bg-slate-900/90 border border-slate-700 rounded-xl hover:bg-slate-800 text-slate-100 transition-all shadow-md self-start mt-4 lg:mt-0"
            >
              Go Back
            </button>
          )}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/20 to-violet-400/20 border border-cyan-200/20 flex items-center justify-center text-cyan-200 shadow-inner">
                <Building2 size={24} className="drop-shadow-sm" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-200 leading-none mb-1 drop-shadow-sm">Administrative Node</span>
                <h1 className="text-3xl font-display font-medium text-slate-50 tracking-tight leading-none uppercase italic drop-shadow-md">
                  {user?.first_name || 'Institute Controller'}
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-700 shadow-lg">
          <div className="flex items-center gap-3 px-4 border-r border-slate-700 uppercase font-mono text-[9px] tracking-widest text-cyan-100 drop-shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            Global Status: Active
          </div>
          {isSearchOpen && (
            <input
              autoFocus
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search students or faculty"
              className="h-11 w-56 rounded-xl border border-slate-700 bg-slate-950/80 px-4 text-xs text-slate-100 outline-none placeholder:text-slate-400 focus:border-cyan-300"
            />
          )}
          <button
            onClick={() => {
              setIsSearchOpen((open) => !open);
              if (isSearchOpen) setSearchTerm('');
            }}
            className={`p-3 rounded-xl hover:bg-slate-800 transition-all shadow-inner ${isSearchOpen ? 'bg-cyan-500/20 text-cyan-200' : 'text-slate-300 hover:text-white'}`}
            title={isSearchOpen ? 'Close search' : 'Search dashboard'}
          >
            <Search size={18} />
          </button>
          <button
            onClick={exportLeaderboardReport}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-[10px] font-mono uppercase tracking-widest hover:from-cyan-400 hover:to-violet-500 transition-all shadow-[0_4px_20px_rgba(34,211,238,0.3)] border border-white/20 flex items-center gap-2"
          >
            <Download size={14} />
            Export Report
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <Skeleton name="institute-metrics" loading={false}>
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto relative z-10">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-[28px] bg-slate-900/85 backdrop-blur-xl border border-slate-700/80 hover:border-cyan-300/40 hover:bg-slate-900 transition-all relative overflow-hidden group shadow-lg min-h-44"
            >
              <div className={`absolute right-0 top-0 p-8 transform group-hover:scale-110 group-hover:-rotate-12 transition-transform opacity-20 ${m.color}`}>
                <m.icon size={80} className="drop-shadow-sm" />
              </div>
              <h3 className="text-[9px] font-mono text-slate-300 uppercase tracking-[0.3em] mb-4">{m.label}</h3>
              <div className="flex items-baseline gap-3 mb-2">
                <span className={`text-4xl font-display font-medium tracking-tighter ${m.color} drop-shadow-sm`}>{m.value}</span>
                <span className="text-[10px] font-mono text-emerald-300 drop-shadow-sm">{m.change}</span>
              </div>
              <div className={`h-1.5 w-14 rounded-full ${m.bg} ${m.border} border shadow-inner`} />
            </motion.div>
          ))}
        </section>
      </Skeleton>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-7xl mx-auto relative z-10 items-start">
        {/* Performance Graph Placeholder */}
        <div className="xl:col-span-8">
          <Skeleton name="institute-graph" loading={false}>
            <div className="p-6 md:p-8 rounded-[30px] bg-slate-900/85 backdrop-blur-xl border border-slate-700/80 space-y-8 shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-violet-500/5 pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <div className="space-y-1">
                  <h2 className="text-2xl font-display font-medium text-slate-50 uppercase tracking-tight italic drop-shadow-sm">Resource Utilization</h2>
                  <p className="text-[10px] font-mono text-slate-300 uppercase tracking-widest leading-none">Across all departments for Q2 2026</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setChartMode('pie')}
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all shadow-inner ${chartMode === 'pie' ? 'bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border-cyan-300 text-cyan-200' : 'bg-slate-950/70 border-slate-700 text-slate-300 hover:text-cyan-200 hover:border-cyan-300/70'}`}
                    title="Pie view"
                  >
                    <PieChart size={18} />
                  </button>
                  <button
                    onClick={() => setChartMode('bar')}
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all shadow-inner ${chartMode === 'bar' ? 'bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border-cyan-300 text-cyan-200' : 'bg-slate-950/70 border-slate-700 text-slate-300 hover:text-cyan-200 hover:border-cyan-300/70'}`}
                    title="Bar view"
                  >
                    <BarChart3 size={18} />
                  </button>
                </div>
              </div>

              {chartMode === 'bar' ? (
                <div className="relative z-10">
                  <div className="absolute inset-x-0 top-8 bottom-8 pointer-events-none">
                    {[100, 75, 50, 25, 0].map((tick) => (
                      <div
                        key={tick}
                        className="absolute left-0 right-0 border-t border-slate-700/70"
                        style={{ bottom: `${tick}%` }}
                      >
                        <span className="absolute -left-1 -translate-y-1/2 bg-slate-900 pr-2 text-[8px] font-mono text-slate-400">
                          {tick}%
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="ml-9 grid h-80 grid-cols-5 gap-3 sm:grid-cols-10 sm:gap-4">
                    {utilizationData.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => setSelectedUtilization(item)}
                        className="group grid h-full grid-rows-[24px_1fr_22px] gap-2 text-left"
                        title={`${item.label}: ${item.value}% utilization`}
                      >
                        <div className="text-center text-[10px] font-mono text-slate-100 drop-shadow-sm">{item.value}%</div>
                        <div className="flex h-full items-end rounded-t-2xl rounded-b-lg border border-slate-700 bg-slate-950/70 p-1.5 shadow-inner transition-all group-hover:border-cyan-300/70 group-hover:bg-slate-950">
                          <div
                            className={`w-full rounded-t-xl rounded-b-md bg-gradient-to-t ${item.color} shadow-[0_0_18px_rgba(34,211,238,0.22)] transition-all duration-300 group-hover:brightness-110`}
                            style={{ height: `${item.value}%` }}
                            aria-label={`${item.label} utilization ${item.value}%`}
                          />
                        </div>
                        <div className="truncate text-center text-[9px] font-mono uppercase tracking-wider text-slate-300">{item.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 items-center min-h-64">
                  <div className="mx-auto h-56 w-56 rounded-full border border-cyan-300/30 bg-[conic-gradient(from_180deg,#22d3ee_0_18%,#8b5cf6_18%_34%,#34d399_34%_52%,#f59e0b_52%_68%,#ec4899_68%_82%,#64748b_82%_100%)] p-6 shadow-[0_0_45px_rgba(34,211,238,0.16)]">
                    <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-slate-950/95 border border-slate-700">
                      <span className="text-3xl font-display text-cyan-200">{utilizationAverage}%</span>
                      <span className="text-[8px] font-mono uppercase tracking-[0.25em] text-slate-300">Average</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {utilizationData.slice(0, 6).map((item) => (
                      <button
                        key={item.label}
                        onClick={() => setSelectedUtilization(item)}
                        className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-left hover:border-cyan-300/70 hover:bg-cyan-500/10 transition-colors"
                      >
                        <span className="text-[9px] font-mono uppercase tracking-widest text-slate-300">{item.label}</span>
                        <span className="text-sm font-display text-cyan-200">{item.value}%</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedUtilization && (
                <div className="relative z-10 flex items-center justify-between rounded-3xl border border-cyan-300/30 bg-cyan-500/10 px-5 py-4">
                  <div>
                    <div className="text-[9px] font-mono uppercase tracking-[0.25em] text-cyan-200">Selected Resource</div>
                    <div className="mt-1 text-sm text-slate-100">{selectedUtilization.label} utilization is currently {selectedUtilization.value}%.</div>
                  </div>
                  <button onClick={() => setSelectedUtilization(null)} className="rounded-xl bg-slate-950/70 p-2 text-slate-300 hover:text-white">
                    <X size={14} />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 border-t border-slate-700/80 pt-8 sm:grid-cols-3 relative z-10">
                <div className="space-y-1">
                  <div className="text-[9px] font-mono text-slate-300 uppercase tracking-widest">Active Seats</div>
                  <div className="text-xl font-display font-medium text-slate-50 drop-shadow-sm">12,402 <span className="text-slate-400 text-sm">/ 15,000</span></div>
                </div>
                <div className="space-y-1">
                  <div className="text-[9px] font-mono text-slate-300 uppercase tracking-widest">Storage Used</div>
                  <div className="text-xl font-display font-medium text-slate-50 drop-shadow-sm">4.2 TB <span className="text-slate-400 text-sm">/ 10 TB</span></div>
                </div>
                <div className="space-y-1">
                  <div className="text-[9px] font-mono text-slate-300 uppercase tracking-widest">AI compute</div>
                  <div className="text-xl font-display font-medium text-cyan-200 drop-shadow-sm">74.2% <span className="text-slate-400 text-sm">Utilization</span></div>
                </div>
              </div>
            </div>
          </Skeleton>

          <Skeleton name="institute-leaderboard" loading={false}>
            <div className="mt-6 p-6 md:p-8 rounded-[30px] bg-slate-900/85 backdrop-blur-xl border border-slate-700/80 shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-cyan-500/5 pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-400/20 flex items-center justify-center text-amber-300 shadow-inner">
                      <Trophy size={22} className="drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-display font-medium text-slate-50 uppercase tracking-tight italic drop-shadow-sm">Consistency Leaderboard</h2>
                      <p className="text-[10px] font-mono text-slate-300 uppercase tracking-widest leading-none">Students ranked by attendance, lab completion, and learning streaks</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="px-4 py-3 rounded-2xl bg-slate-950/70 border border-slate-700 shadow-inner">
                    <div className="text-lg font-display text-amber-300">5</div>
                    <div className="text-[8px] font-mono uppercase tracking-widest text-slate-300">Top Cohort</div>
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-slate-950/70 border border-slate-700 shadow-inner">
                    <div className="text-lg font-display text-emerald-300">94%</div>
                    <div className="text-[8px] font-mono uppercase tracking-widest text-slate-300">Avg Attend</div>
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-slate-950/70 border border-slate-700 shadow-inner">
                    <div className="text-lg font-display text-cyan-300">25d</div>
                    <div className="text-[8px] font-mono uppercase tracking-widest text-slate-300">Avg Streak</div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 overflow-x-auto">
                <table className="w-full min-w-[760px] border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-left text-[9px] font-mono uppercase tracking-[0.25em] text-slate-300">
                      <th className="px-4 pb-2">Rank</th>
                      <th className="px-4 pb-2">Student</th>
                      <th className="px-4 pb-2">Focus</th>
                      <th className="px-4 pb-2">Streak</th>
                      <th className="px-4 pb-2">Attendance</th>
                      <th className="px-4 pb-2">Labs</th>
                      <th className="px-4 pb-2 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, index) => (
                      <motion.tr
                        key={student.name}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        className="group"
                      >
                        <td className="rounded-l-3xl bg-slate-950/60 border-y border-l border-slate-700 px-4 py-4">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border font-display text-sm shadow-inner ${
                            student.rank === 1
                              ? 'bg-amber-500/15 border-amber-400/30 text-amber-300'
                              : student.rank === 2
                                ? 'bg-cyan-500/10 border-cyan-400/25 text-cyan-300'
                                : student.rank === 3
                                  ? 'bg-violet-500/10 border-violet-400/25 text-violet-300'
                                  : 'bg-slate-800 border-slate-600 text-slate-200'
                          }`}>
                            {student.rank}
                          </div>
                        </td>
                        <td className="bg-slate-950/60 border-y border-slate-700 px-4 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-slate-600 flex items-center justify-center text-slate-50 font-display text-xs shadow-inner">
                              {student.name.split(' ').map(part => part[0]).join('')}
                            </div>
                            <div>
                              <div className="text-sm font-sans font-medium text-slate-50 group-hover:text-cyan-200 transition-colors">{student.name}</div>
                              <div className="text-[9px] font-mono uppercase tracking-widest text-slate-300 mt-1">{student.grade}</div>
                            </div>
                          </div>
                        </td>
                        <td className="bg-slate-950/60 border-y border-slate-700 px-4 py-4">
                          <span className="rounded-xl bg-cyan-500/10 border border-cyan-400/20 px-3 py-1.5 text-[9px] font-mono uppercase tracking-widest text-cyan-200">
                            {student.department}
                          </span>
                        </td>
                        <td className="bg-slate-950/60 border-y border-slate-700 px-4 py-4">
                          <div className="flex items-center gap-2 text-amber-300 font-mono text-xs">
                            <Flame size={14} className="drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                            {student.streak} days
                          </div>
                        </td>
                        <td className="bg-slate-950/60 border-y border-slate-700 px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-20 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
                              <div className="h-full rounded-full bg-emerald-400" style={{ width: `${student.attendance}%` }} />
                            </div>
                            <span className="text-xs font-mono text-emerald-300">{student.attendance}%</span>
                          </div>
                        </td>
                        <td className="bg-slate-950/60 border-y border-slate-700 px-4 py-4">
                          <div className="flex items-center gap-2 text-slate-200 font-mono text-xs">
                            <Award size={14} className="text-violet-300" />
                            {student.labs}
                          </div>
                        </td>
                        <td className="rounded-r-3xl bg-slate-950/60 border-y border-r border-slate-700 px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <div>
                              <div className="text-lg font-display text-slate-50 leading-none">{student.consistency}</div>
                              <div className="text-[8px] font-mono uppercase tracking-widest text-emerald-300 mt-1">{student.trend}</div>
                            </div>
                            <TrendingUp size={16} className="text-emerald-300" />
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {filteredStudents.length === 0 && (
                  <div className="rounded-3xl border border-slate-700 bg-slate-950/70 p-8 text-center text-sm text-slate-300">
                    No students match "{searchTerm}".
                  </div>
                )}
              </div>
            </div>
          </Skeleton>
        </div>

        {/* Sidebar: Faculty Management */}
        <div className="xl:col-span-4 space-y-6">
          <div className="p-6 md:p-7 rounded-[30px] bg-slate-900/85 backdrop-blur-xl border border-slate-700/80 space-y-7 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-display font-medium text-slate-50 uppercase tracking-tight flex items-center gap-2 drop-shadow-sm">
                <School size={18} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                Key Faculty
              </h3>
              <button
                onClick={() => setShowAddFaculty(true)}
                className="w-8 h-8 rounded-lg bg-slate-950/70 border border-slate-700 flex items-center justify-center hover:border-cyan-300/70 hover:text-cyan-200 transition-all shadow-inner"
                title="Add faculty"
              >
                <Plus size={14} className="text-slate-300 hover:text-cyan-200" />
              </button>
            </div>

            <div className="space-y-4">
              {filteredFaculty.map((f, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedFaculty(f)}
                  className="w-full flex items-center justify-between group text-left rounded-2xl border border-transparent p-2 transition-colors hover:border-cyan-300/40 hover:bg-cyan-500/10"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[14px] bg-slate-950/70 border border-slate-700 flex items-center justify-center text-cyan-100 font-display font-medium text-xs group-hover:border-cyan-300/70 group-hover:bg-cyan-500/10 transition-all shadow-inner">
                      {f.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-sm font-sans font-medium text-slate-50 group-hover:text-cyan-200 transition-colors drop-shadow-sm">{f.name}</div>
                      <div className="text-[9px] font-mono text-slate-300 uppercase tracking-widest mt-1">{f.department}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-medium text-emerald-300 drop-shadow-sm">{f.performance}%</div>
                    <div className="text-[8px] font-mono text-slate-300 uppercase tracking-widest mt-1">Rating</div>
                  </div>
                </button>
              ))}
              {filteredFaculty.length === 0 && (
                <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-center text-xs text-slate-300">
                  No faculty match "{searchTerm}".
                </div>
              )}
            </div>

            <button
              onClick={() => setShowManagementPortal((show) => !show)}
              className="w-full py-4 rounded-2xl bg-slate-950/70 border border-slate-700 text-[9px] font-mono uppercase tracking-[0.3em] text-slate-200 hover:text-cyan-200 hover:border-cyan-300/70 transition-all flex items-center justify-center gap-2 shadow-inner group"
            >
              Management Portal <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>

            {showManagementPortal && (
              <div className="rounded-3xl border border-cyan-300/30 bg-cyan-500/10 p-5 space-y-4">
                <div className="text-[9px] font-mono uppercase tracking-[0.25em] text-cyan-200">Faculty Operations</div>
                {['Review workload balance', 'Schedule department audit', 'Open performance reports'].map((action) => (
                  <button
                    key={action}
                    onClick={() => {
                      showNotice(`${action} queued for institute admin.`);
                      setShowManagementPortal(false);
                    }}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-left text-xs text-slate-200 hover:border-cyan-300/70 hover:text-white transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 md:p-7 rounded-[30px] bg-slate-900/85 backdrop-blur-xl border border-slate-700/80 relative overflow-hidden group shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-t from-violet-500/10 via-transparent to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 p-6 transform translate-x-4 -translate-y-4 opacity-20 group-hover:scale-110 transition-transform mix-blend-overlay text-violet-400">
              <Target size={120} />
            </div>
            <h4 className="text-[9px] font-mono text-violet-300 uppercase tracking-[0.3em] mb-4 relative z-10 drop-shadow-sm">Institutional Goals</h4>
            <div className="space-y-4 relative z-10">
              <p className="text-sm text-slate-100 font-sans leading-relaxed italic drop-shadow-sm">
                "Reach 95% overall student engagement by the end of H1 2026."
              </p>
              <div className="w-full h-2 bg-slate-950/70 border border-slate-700 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-violet-500 w-[72%] shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
              </div>
              <div className="flex justify-between text-[8px] font-mono text-slate-300 uppercase tracking-widest">
                <span>Currently at 72%</span>
                <span className="text-emerald-300">Goal: 95%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {actionNotice && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          className="fixed bottom-8 right-8 z-[120] rounded-2xl border border-emerald-400/20 bg-slate-950/95 px-5 py-4 text-sm text-emerald-200 shadow-2xl backdrop-blur-xl"
        >
          {actionNotice}
        </motion.div>
      )}

      {selectedFaculty && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedFaculty(null)}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            aria-label="Close faculty details"
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="relative w-full max-w-lg rounded-[30px] border border-slate-700 bg-slate-950 p-8 shadow-2xl"
          >
            <button
              onClick={() => setSelectedFaculty(null)}
              className="absolute right-5 top-5 rounded-xl bg-slate-900 p-2 text-slate-300 hover:text-white"
              aria-label="Close faculty details"
            >
              <X size={16} />
            </button>
            <div className="mb-8 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-300/30 flex items-center justify-center text-cyan-100 font-display">
                {selectedFaculty.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="text-2xl font-display text-slate-50">{selectedFaculty.name}</h3>
                <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-300 mt-1">{selectedFaculty.department}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5">
                <div className="text-2xl font-display text-slate-50">{selectedFaculty.classes}</div>
                <div className="text-[9px] font-mono uppercase tracking-widest text-slate-300">Classes</div>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5">
                <div className="text-2xl font-display text-emerald-300">{selectedFaculty.performance}%</div>
                <div className="text-[9px] font-mono uppercase tracking-widest text-slate-300">Rating</div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  showNotice(`${selectedFaculty.name}'s report opened.`);
                  setSelectedFaculty(null);
                }}
                className="flex-1 rounded-2xl bg-cyan-500 px-4 py-3 text-[10px] font-mono uppercase tracking-widest text-slate-950 hover:bg-cyan-400"
              >
                Open Report
              </button>
              <button
                onClick={() => {
                  showNotice(`Message drafted for ${selectedFaculty.name}.`);
                  setSelectedFaculty(null);
                }}
                className="flex-1 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-[10px] font-mono uppercase tracking-widest text-slate-200 hover:text-white"
              >
                Message
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showAddFaculty && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <button
            onClick={() => setShowAddFaculty(false)}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            aria-label="Close add faculty"
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="relative w-full max-w-md rounded-[30px] border border-slate-700 bg-slate-950 p-8 shadow-2xl"
          >
            <button
              onClick={() => setShowAddFaculty(false)}
              className="absolute right-5 top-5 rounded-xl bg-slate-900 p-2 text-slate-300 hover:text-white"
              aria-label="Close add faculty"
            >
              <X size={16} />
            </button>
            <div className="mb-6">
              <h3 className="text-2xl font-display text-slate-50">Add Faculty</h3>
              <p className="text-sm text-slate-300 mt-2">Create an invite for a new faculty member.</p>
            </div>
            <div className="space-y-4">
              <input className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-5 py-4 text-sm text-slate-100 outline-none placeholder:text-slate-400 focus:border-cyan-300" placeholder="Faculty email" />
              <select className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-5 py-4 text-sm text-slate-100 outline-none focus:border-cyan-300">
                <option>Chemistry</option>
                <option>Physics</option>
                <option>Mathematics</option>
                <option>Biology</option>
              </select>
              <button
                onClick={() => {
                  showNotice('Faculty invite prepared and ready to send.');
                  setShowAddFaculty(false);
                }}
                className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-4 text-[10px] font-mono uppercase tracking-widest text-white hover:from-cyan-400 hover:to-violet-500"
              >
                Prepare Invite
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default InstituteDashboard;
