
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit2, Trash2, Save, X, ArrowLeft,
  Database, Beaker, Atom, BookOpen, Layers,
  ChevronRight, ChevronDown, AlertCircle, CheckCircle, RefreshCcw, Folder, MessageSquare, Star
} from 'lucide-react';
import axios from 'axios';
import { Subject, Topic, ElementData, Molecule } from '../../types/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

type Tab = 'subjects' | 'topics' | 'elements' | 'molecules' | 'glossary' | 'feedback';

interface AdminDashboardProps {
  onBack?: () => void;
  onDataUpdate?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack, onDataUpdate }) => {
  const [activeTab, setActiveTab] = useState<Tab>('subjects');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [subjectSortBy, setSubjectSortBy] = useState<'alpha' | 'order'>('order');

  // Deletion security states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: any; name: string; endpoint: string } | null>(null);
  const [securityCode, setSecurityCode] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isDeleting, setIsDeletingProcess] = useState(false);

  // Multi-select states
  const [selectedIds, setSelectedIds] = useState<any[]>([]);
  const [itemsToBulkDelete, setItemsToBulkDelete] = useState<{ id: any; name: string; endpoint: string }[]>([]);

  // Data states
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [elements, setElements] = useState<ElementData[]>([]);
  const [molecules, setMolecules] = useState<Molecule[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  const groupedTopics = useMemo(() => {
    const groups: Record<string, Topic[]> = {};
    // Sort topics by order before grouping
    const sortedTopics = [...topics].sort((a, b) => (a.order || 0) - (b.order || 0));
    sortedTopics.forEach(topic => {
      const subjectName = subjects.find(s => (s.id as unknown as number) === topic.subject)?.name || 'Unassigned Topics';
      if (!groups[subjectName]) groups[subjectName] = [];
      groups[subjectName].push(topic);
    });
    return groups;
  }, [topics, subjects]);

  const groupedGlossary = useMemo(() => {
    const groups: Record<string, any[]> = {};
    terms.forEach(term => {
      const subjectName = term.subject.charAt(0).toUpperCase() + term.subject.slice(1);
      if (!groups[subjectName]) groups[subjectName] = [];
      groups[subjectName].push(term);
    });
    return groups;
  }, [terms]);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [isNewItem, setIsNewItem] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const sortedSubjects = useMemo(() => {
    return [...subjects].sort((a, b) => {
      if (subjectSortBy === 'alpha') {
        return a.name.localeCompare(b.name);
      }
      return (a.order || 0) - (b.order || 0);
    });
  }, [subjects, subjectSortBy]);

  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  // JSON editor state
  const [jsonValue, setJsonValue] = useState("");
  const [isJsonFocused, setIsJsonFocused] = useState(false);

  useEffect(() => {
    if (!isJsonFocused && editItem) {
      setJsonValue(JSON.stringify(editItem, null, 2));
    }
  }, [editItem, isJsonFocused]);

  const toggleFolder = (folderName: string) => {
    setExpandedFolders(prev => ({ ...prev, [folderName]: !prev[folderName] }));
  };

  const updateSortPreference = async (method: 'alpha' | 'order') => {
    setSubjectSortBy(method);
    try {
      await axios.post(`${API_URL}/settings/`, { subject_sort_method: method });
      if (onDataUpdate) onDataUpdate(); // Trigger refresh in App.tsx
    } catch (e) {
      console.error("Failed to save sort preference", e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Field-specific edit states to prevent cursor jumping and formatting issues
  const [classInput, setClassInput] = useState("");
  const [electronsInput, setElectronsInput] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (editItem) {
      if (focusedField !== 'targetClass') {
        setClassInput(editItem.targetClass?.join(', ') || "");
      }
      if (focusedField !== 'electrons') {
        setElectronsInput(editItem.electrons?.join(', ') || "");
      }
    }
  }, [editItem, focusedField]);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch global settings
      try {
        const settingsRes = await axios.get(`${API_URL}/settings/`);
        if (settingsRes.data.subject_sort_method) {
          setSubjectSortBy(settingsRes.data.subject_sort_method);
        }
      } catch (e) {
        console.error("Failed to fetch settings", e);
      }

      // Always fetch subjects if on topics tab or if subjects are empty
      if (activeTab === 'subjects' || activeTab === 'topics' || subjects.length === 0) {
        const sRes = await axios.get(`${API_URL}/subjects/`);
        // We will sort them in the render or after setting state if needed, 
        // but for now let's keep the fetch logic clean.
        setSubjects(sRes.data);
      }

      if (activeTab === 'subjects') {
        // Already fetched above, but we can re-sort if needed or just skip
      } else if (activeTab === 'topics') {
        const res = await axios.get(`${API_URL}/topics/`);
        setTopics(res.data.sort((a: any, b: any) => a.name.localeCompare(b.name)));
      } else if (activeTab === 'elements') {
        const res = await axios.get(`${API_URL}/elements/`);
        setElements(res.data.sort((a: any, b: any) => a.number - b.number));
      } else if (activeTab === 'molecules') {
        const res = await axios.get(`${API_URL}/molecules/`);
        setMolecules(res.data.sort((a: any, b: any) => a.formula.localeCompare(b.formula)));
      } else if (activeTab === 'glossary') {
        const res = await axios.get(`${API_URL}/glossary/terms/`);
        setTerms(res.data.sort((a: any, b: any) => a.term.localeCompare(b.term)));
      } else if (activeTab === 'feedback') {
        const res = await axios.get(`${API_URL}/feedback/`);
        setFeedbacks(res.data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      }
    } catch (err: any) {
      setError("Failed to fetch data. Ensure backend is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateSecurityCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const generateBlock = () => {
      let result = '';
      for (let i = 0; i < 3; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    return `${generateBlock()}-${generateBlock()}-${generateBlock()}`;
  };

  const startDelete = (id: any, name: string) => {
    let endpoint = '';
    if (activeTab === 'subjects') endpoint = `${API_URL}/subjects/${id}/`;
    else if (activeTab === 'topics') endpoint = `${API_URL}/topics/${id}/`;
    else if (activeTab === 'elements') endpoint = `${API_URL}/elements/${id}/`;
    else if (activeTab === 'molecules') endpoint = `${API_URL}/molecules/${id}/`;
    else if (activeTab === 'glossary') endpoint = `${API_URL}/glossary/terms/${id}/`;
    else if (activeTab === 'feedback') endpoint = `${API_URL}/feedback/${id}/`;

    setItemToDelete({ id, name, endpoint });
    setItemsToBulkDelete([]); // Clear bulk if single delete
    setSecurityCode(generateSecurityCode());
    setUserInput("");
    setShowDeleteConfirm(true);
  };

  const startBulkDelete = () => {
    if (selectedIds.length === 0) return;
    
    const items = selectedIds.map(id => {
      let name = '';
      let endpoint = '';
      
      if (activeTab === 'subjects') {
        const item = subjects.find(s => s.id === id);
        name = item?.name || String(id);
        endpoint = `${API_URL}/subjects/${id}/`;
      } else if (activeTab === 'topics') {
        const item = topics.find(t => t.id === id);
        name = item?.name || String(id);
        endpoint = `${API_URL}/topics/${id}/`;
      } else if (activeTab === 'elements') {
        const item = elements.find(e => e.number === id);
        name = item?.name || String(id);
        endpoint = `${API_URL}/elements/${id}/`;
      } else if (activeTab === 'molecules') {
        const item = molecules.find(m => m.formula === id);
        name = item?.name || String(id);
        endpoint = `${API_URL}/molecules/${id}/`;
      } else if (activeTab === 'glossary') {
        const item = terms.find(t => t.id === id);
        name = item?.term || String(id);
        endpoint = `${API_URL}/glossary/terms/${id}/`;
      } else if (activeTab === 'feedback') {
        const item = feedbacks.find(f => f.id === id);
        const fullName = item ? (item.first_name || item.last_name ? `${item.first_name} ${item.last_name}` : item.username) : id;
        name = `Feedback from ${fullName}`;
        endpoint = `${API_URL}/feedback/${id}/`;
      }
      
      return { id, name, endpoint };
    });

    setItemsToBulkDelete(items);
    setItemToDelete(null); // Clear single if bulk
    setSecurityCode(generateSecurityCode());
    setUserInput("");
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if ((!itemToDelete && itemsToBulkDelete.length === 0) || userInput !== securityCode) return;

    setIsDeletingProcess(true);
    try {
      if (itemToDelete) {
        await axios.delete(itemToDelete.endpoint);
        setSuccess(`${itemToDelete.name} has been deleted.`);
      } else {
        await Promise.all(itemsToBulkDelete.map(item => axios.delete(item.endpoint)));
        setSuccess(`${itemsToBulkDelete.length} items have been deleted.`);
      }
      
      setShowDeleteConfirm(false);
      setItemToDelete(null);
      setItemsToBulkDelete([]);
      setSelectedIds([]);
      fetchData();
    } catch (err: any) {
      setError("Failed to complete deletion protocol.");
    } finally {
      setIsDeletingProcess(false);
    }
  };

  const toggleSelect = (id: any) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    let currentIds: any[] = [];
    if (activeTab === 'subjects') currentIds = subjects.map(s => s.id);
    else if (activeTab === 'topics') currentIds = topics.map(t => t.id);
    else if (activeTab === 'elements') currentIds = elements.map(e => e.number);
    else if (activeTab === 'molecules') currentIds = molecules.map(m => m.formula);
    else if (activeTab === 'glossary') currentIds = terms.map(t => t.id);
    else if (activeTab === 'feedback') currentIds = feedbacks.map(f => f.id);

    if (selectedIds.length === currentIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentIds);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let endpoint = '';
      let idField = activeTab === 'subjects' ? 'id' : activeTab === 'topics' ? 'id' : activeTab === 'elements' ? 'number' : activeTab === 'molecules' ? 'formula' : 'slug';
      let method: 'post' | 'put' = isNewItem ? 'post' : 'put';

      // For Put requests, we need the identifier in the URL
      if (method === 'put') {
        const identifier = editItem[idField];
        if (activeTab === 'subjects') endpoint = `${API_URL}/subjects/${identifier}/`;
        else if (activeTab === 'topics') endpoint = `${API_URL}/topics/${identifier}/`;
        else if (activeTab === 'elements') endpoint = `${API_URL}/elements/${identifier}/`;
        else if (activeTab === 'molecules') endpoint = `${API_URL}/molecules/${identifier}/`;
        else if (activeTab === 'glossary') endpoint = `${API_URL}/glossary/terms/${identifier}/`;
      } else {
        // For Post requests, just the collection endpoint
        if (activeTab === 'subjects') endpoint = `${API_URL}/subjects/`;
        else if (activeTab === 'topics') endpoint = `${API_URL}/topics/`;
        else if (activeTab === 'elements') endpoint = `${API_URL}/elements/`;
        else if (activeTab === 'molecules') endpoint = `${API_URL}/molecules/`;
        else if (activeTab === 'glossary') endpoint = `${API_URL}/glossary/terms/`;
      }

      let payload = { ...editItem };

      // Only process subject ID as Number for Topics
      if (activeTab === 'topics') {
        payload.subject = editItem.subject ? Number(editItem.subject) : null;
      }
      // For Glossary, subject is a string (SubjectId), no conversion needed.

      if (method === 'post') {
        await axios.post(endpoint, payload);
      } else {
        await axios.put(endpoint, payload);
      }

      setSuccess(`Item ${method === 'post' ? 'created' : 'updated'} successfully!`);
      setIsEditing(false);
      setEditItem(null);
      fetchData();
      if (onDataUpdate) onDataUpdate();
    } catch (err: any) {
      const serverMsg = err.response?.data ? JSON.stringify(err.response.data) : "Check JSON format and required fields.";
      setError(`Failed to save item. ${serverMsg}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startCreate = () => {
    let newItem: any = {};
    if (activeTab === 'subjects') newItem = {
      name: '', slug: '', icon: 'Brain', color: 'purple',
      description: '', image_url: '',
      theme: 'border-[var(--border-glass)]', iconColor: 'text-indigo-500',
      targetClass: ['Class 11', 'Class 12']
    };
    else if (activeTab === 'topics') newItem = {
      subject: '', name: '', slug: '', description: '', theory: '',
      targetClass: ['Class 11']
    };
    else if (activeTab === 'elements') newItem = {
      number: 0, symbol: '', name: '', mass: 0.0, category: 'nonmetal',
      electrons: [], summary: '', discovery: '', color: '#000000',
      config: '', radius: 0, ionization: 0.0, electronegativity: 0.0,
      period: 0, group: 0
    };
    else if (activeTab === 'molecules') newItem = {
      formula: '', name: '', central_atom: '',
      atoms: [{ symbol: 'H', x: 0, y: 0, z: 0 }],
      lonePairs: [{ x: 0, y: 0, z: 0 }],
      realAngle: '', modelAngle: ''
    };
    else if (activeTab === 'glossary') newItem = {
      term: '', definition: '', subject: 'chemistry'
    };
    setEditItem(newItem);
    setIsNewItem(true);
    setIsEditing(true);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--text-primary)] p-4 md:p-8 pt-24 pb-32 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {onBack && (
              <button
                onClick={onBack}
                className="p-3 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-glass)] hover:bg-white/10 transition-all flex items-center justify-center text-[var(--text-primary)] shadow-sm"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
                <Database className="text-indigo-500" size={40} />
                ADMIN <span className="text-indigo-500">DASHBOARD</span>
              </h1>
              <p className="text-[var(--text-muted)] font-mono text-sm mt-2">LABZERO INFRASTRUCTURE CONTROL v2.0</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <AnimatePresence>
              {selectedIds.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onClick={startBulkDelete}
                  className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 transition-all flex items-center gap-2 shadow-lg shadow-red-600/20 text-sm font-bold text-white"
                >
                  <Trash2 size={18} /> Delete Selected ({selectedIds.length})
                </motion.button>
              )}
            </AnimatePresence>
            <button
              onClick={fetchData}
              className="px-6 py-3 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-glass)] hover:bg-white/10 transition-all flex items-center gap-2 text-sm font-bold shadow-sm"
            >
              <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            {activeTab !== 'feedback' && (
              <button
                onClick={startCreate}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20 text-sm font-bold text-white"
              >
                <Plus size={18} /> Add New
              </button>
            )}
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {(['subjects', 'topics', 'elements', 'molecules'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSelectedIds([]); }}
              className={`px-8 py-4 rounded-3xl font-bold uppercase tracking-widest text-[10px] transition-all border shrink-0 ${activeTab === tab
                ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-600/30 text-white'
                : 'bg-[var(--bg-panel)] border-[var(--border-glass)] text-[var(--text-muted)] hover:bg-indigo-500/10 hover:text-indigo-500'
                }`}
            >
              <div className="flex items-center gap-2">
                {tab === 'subjects' && <Layers size={14} />}
                {tab === 'topics' && <BookOpen size={14} />}
                {tab === 'elements' && <Atom size={14} />}
                {tab === 'molecules' && <Beaker size={14} />}
                {tab}
              </div>
            </button>
          ))}
          <button
            onClick={() => { setActiveTab('glossary'); setSelectedIds([]); }}
            className={`px-8 py-4 rounded-3xl font-bold uppercase tracking-widest text-[10px] transition-all border shrink-0 ${activeTab === 'glossary'
              ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-600/30 text-white'
              : 'bg-[var(--bg-panel)] border-[var(--border-glass)] text-[var(--text-muted)] hover:bg-indigo-500/10 hover:text-indigo-500'
              }`}
          >
            <div className="flex items-center gap-2">
              <Search size={14} />
              Glossary
            </div>
          </button>
          <button
            onClick={() => { setActiveTab('feedback'); setSelectedIds([]); }}
            className={`px-8 py-4 rounded-3xl font-bold uppercase tracking-widest text-[10px] transition-all border shrink-0 ${activeTab === 'feedback'
              ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-600/30 text-white'
              : 'bg-[var(--bg-panel)] border-[var(--border-glass)] text-[var(--text-muted)] hover:bg-indigo-500/10 hover:text-indigo-500'
              }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare size={14} />
              Feedback
            </div>
          </button>
        </div>

        {activeTab === 'subjects' && (
          <div className="flex items-center gap-4 mb-6 bg-[var(--bg-panel)] p-4 rounded-3xl border border-[var(--border-glass)]">
            <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest font-black ml-2">Sort View By:</span>
            <div className="flex bg-[var(--bg-deep)] p-1 rounded-2xl border border-[var(--border-glass)]">
              <button
                onClick={() => updateSortPreference('order')}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${subjectSortBy === 'order' ? 'bg-indigo-600 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-indigo-500'}`}
              >
                Custom Order
              </button>
              <button
                onClick={() => updateSortPreference('alpha')}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${subjectSortBy === 'alpha' ? 'bg-indigo-600 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-indigo-500'}`}
              >
                Alphabetical
              </button>
            </div>
            <div className="flex-1"></div>
            <p className="text-[10px] font-mono text-indigo-500/70 italic mr-4">Select "Custom Order" to see the sequence as it appears on the Landing Page.</p>
          </div>
        )}

        {/* Notifications */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3"
            >
              <AlertCircle size={20} /> {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3"
            >
              <CheckCircle size={20} /> {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Table */}
        <div className="bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-[40px] overflow-hidden backdrop-blur-3xl overflow-x-auto shadow-xl">
          {loading ? (
            <div className="p-20 text-center text-[var(--text-muted)] flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              Retrieving LabZero Database Records...
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-black/5 dark:bg-white/5 border-b border-[var(--border-glass)]">
                  <th className="p-6 w-12">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded-lg border-2 border-[var(--border-glass)] bg-transparent checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer"
                      checked={selectedIds.length > 0 && (
                        (activeTab === 'subjects' && selectedIds.length === subjects.length) ||
                        (activeTab === 'topics' && selectedIds.length === topics.length) ||
                        (activeTab === 'elements' && selectedIds.length === elements.length) ||
                        (activeTab === 'molecules' && selectedIds.length === molecules.length) ||
                        (activeTab === 'glossary' && selectedIds.length === terms.length) ||
                        (activeTab === 'feedback' && selectedIds.length === feedbacks.length)
                      )}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="p-6 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    {activeTab === 'elements' || activeTab === 'molecules' ? 'Identity' : activeTab === 'subjects' ? 'Subject Info' : activeTab === 'glossary' ? 'Term' : activeTab === 'feedback' ? 'Student Info' : 'Topic Info'}
                  </th>
                  <th className="p-6 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    {activeTab === 'elements' ? 'Physical Stats' : activeTab === 'molecules' ? 'Structural Data' : activeTab === 'subjects' ? 'Topics' : activeTab === 'glossary' ? 'Definition' : activeTab === 'feedback' ? 'Comment' : 'Description & Theory'}
                  </th>
                  <th className="p-6 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    {activeTab === 'elements' ? 'Chemical Attributes' : activeTab === 'molecules' ? 'Geometry' : activeTab === 'subjects' ? 'Metadata' : activeTab === 'glossary' ? 'Subject' : activeTab === 'feedback' ? 'Rating' : 'Target Audience'}
                  </th>
                  <th className="p-6 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Actions</th>
                </tr>
              </thead>
               <tbody>
                {activeTab === 'subjects' && sortedSubjects.map((item) => (
                  <tr key={item.id} className={`border-b border-[var(--border-glass)] hover:bg-indigo-500/5 transition-colors ${selectedIds.includes(item.id) ? 'bg-indigo-500/10' : ''}`}>
                    <td className="p-6">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded-lg border-2 border-[var(--border-glass)] bg-transparent checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                      />
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-xl bg-[var(--bg-deep)] border border-[var(--border-glass)] overflow-hidden flex-shrink-0 shadow-sm">
                          {item.image_url ? (
                            <img src={item.image_url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] opacity-30"><Layers size={20} /></div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-black font-mono">#{item.order ?? 0}</span>
                            <div className="font-bold text-lg text-[var(--text-primary)]">{item.name}</div>
                          </div>
                          <div className="text-xs text-[var(--text-primary)] font-mono mt-1 uppercase opacity-60 font-black">{item.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-sm text-[var(--text-primary)] font-medium max-w-xs">
                      <div className="line-clamp-2 text-[var(--text-primary)]/80 leading-relaxed italic">{item.description || 'No description provided.'}</div>
                      <div className="text-[10px] font-black text-indigo-500 uppercase mt-2">{item.topics?.length || 0} topics linked</div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-bold">
                          {item.color}
                        </span>
                        <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase bg-[var(--bg-deep)] border border-[var(--border-glass)] text-[var(--text-primary)] font-medium">
                          Icon: {item.icon}
                        </span>
                        <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase bg-indigo-600 text-white font-bold">
                          {item.theme}
                        </span>
                        <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase bg-black/10 dark:bg-white/10 text-[var(--text-primary)] border border-[var(--border-glass)] font-bold">
                          {item.iconColor}
                        </span>
                        <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase bg-[var(--bg-deep)] border border-[var(--border-glass)] text-[var(--text-primary)] font-medium">
                          Target: {item.targetClass?.join(', ')}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex gap-2">
                        <button onClick={() => { 
                          setEditItem(item); 
                          setIsNewItem(false); 
                          setIsEditing(true); 
                          setClassInput(item.targetClass?.join(', ') || "");
                        }} className="p-2 rounded-xl bg-[var(--bg-deep)] hover:bg-indigo-500 hover:text-white text-[var(--text-primary)] transition-all border border-[var(--border-glass)] shadow-sm"><Edit2 size={16} /></button>
                        <button onClick={() => startDelete(item.id, item.name)} className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-600 dark:text-red-400 hover:text-white transition-all border border-red-500/20 shadow-sm"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}

                {activeTab === 'topics' && Object.entries(groupedTopics).map(([subjectName, subjectTopics]) => (
                  <React.Fragment key={subjectName}>
                    <tr
                      className="bg-indigo-500/5 border-b border-[var(--border-glass)] cursor-pointer hover:bg-indigo-500/10 transition-colors select-none"
                      onClick={() => toggleFolder(subjectName)}
                    >
                      <td colSpan={4} className="p-4 px-6">
                        <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest text-xs">
                          {expandedFolders[subjectName] ? <ChevronDown size={16} className="opacity-70" /> : <ChevronRight size={16} className="opacity-70" />}
                          <Folder size={16} className="opacity-80" />
                          {subjectName} ({subjectTopics.length} Topic{subjectTopics.length !== 1 && 's'})
                        </div>
                      </td>
                    </tr>
                    <AnimatePresence>
                      {expandedFolders[subjectName] && subjectTopics.map((item) => (
                        <tr key={item.id} className={`border-b border-[var(--border-glass)] hover:bg-indigo-500/10 transition-colors ${selectedIds.includes(item.id) ? 'bg-indigo-500/10' : ''}`}>
                          <td className="p-6">
                            <input
                              type="checkbox"
                              className="w-5 h-5 rounded-lg border-2 border-[var(--border-glass)] bg-transparent checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer"
                              checked={selectedIds.includes(item.id)}
                              onChange={() => toggleSelect(item.id)}
                            />
                          </td>
                          <td className="p-6 pl-12">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-black font-mono">#{item.order ?? 0}</span>
                              <div className="font-bold text-lg text-[var(--text-primary)]">{item.name}</div>
                            </div>
                            <div className="text-xs text-[var(--text-primary)] font-mono mt-1 uppercase opacity-60">/{item.slug}</div>
                          </td>
                          <td className="p-6 text-sm text-[var(--text-primary)]/90 max-w-xs font-medium">
                            <div className="truncate mb-1">{item.description}</div>
                            <div className="text-[10px] opacity-70 font-mono uppercase font-bold">Theory Data: Loaded</div>
                          </td>
                          <td className="p-6 text-[10px] font-mono text-[var(--text-primary)] uppercase font-bold">{item.targetClass?.join(', ') || 'N/A'}</td>
                          <td className="p-6">
                            <div className="flex gap-2">
                              <button onClick={() => { setEditItem(item); setIsNewItem(false); setIsEditing(true); }} className="p-2 rounded-xl bg-[var(--bg-deep)] hover:bg-indigo-500 hover:text-white text-[var(--text-primary)] transition-all border border-[var(--border-glass)] shadow-sm"><Edit2 size={16} /></button>
                              <button onClick={() => startDelete(item.id, item.name)} className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-600 dark:text-red-400 hover:text-white transition-all border border-red-500/20 shadow-sm"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </AnimatePresence>
                  </React.Fragment>
                ))}

                {activeTab === 'glossary' && Object.entries(groupedGlossary).map(([subjectName, subjectTerms]) => (
                  <React.Fragment key={subjectName}>
                    <tr
                      className="bg-indigo-500/5 border-b border-[var(--border-glass)] cursor-pointer hover:bg-indigo-500/10 transition-colors select-none"
                      onClick={() => toggleFolder(`glossary-${subjectName}`)}
                    >
                      <td colSpan={4} className="p-4 px-6">
                        <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest text-xs">
                          {expandedFolders[`glossary-${subjectName}`] ? <ChevronDown size={16} className="opacity-70" /> : <ChevronRight size={16} className="opacity-70" />}
                          <Folder size={16} className="opacity-80" />
                          {subjectName} ({subjectTerms.length} Term{subjectTerms.length !== 1 && 's'})
                        </div>
                      </td>
                    </tr>
                    <AnimatePresence>
                      {expandedFolders[`glossary-${subjectName}`] && subjectTerms.map((item) => (
                        <tr key={item.id} className={`border-b border-[var(--border-glass)] hover:bg-indigo-500/10 transition-colors ${selectedIds.includes(item.id) ? 'bg-indigo-500/10' : ''}`}>
                          <td className="p-6">
                            <input
                              type="checkbox"
                              className="w-5 h-5 rounded-lg border-2 border-[var(--border-glass)] bg-transparent checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer"
                              checked={selectedIds.includes(item.id)}
                              onChange={() => toggleSelect(item.id)}
                            />
                          </td>
                          <td className="p-6">
                            <div className="font-bold text-lg text-[var(--text-primary)]">{item.term}</div>
                          </td>
                          <td className="p-6 text-sm text-[var(--text-primary)]/80 max-w-md">
                            <div className="line-clamp-2">{item.definition}</div>
                          </td>
                          <td className="p-6">
                            <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-bold">
                              {item.subject}
                            </span>
                          </td>
                          <td className="p-6">
                            <div className="flex gap-2">
                              <button onClick={() => { setEditItem(item); setIsNewItem(false); setIsEditing(true); }} className="p-2 rounded-xl bg-[var(--bg-deep)] hover:bg-indigo-500 hover:text-white text-[var(--text-primary)] transition-all border border-[var(--border-glass)] shadow-sm"><Edit2 size={16} /></button>
                              <button onClick={() => startDelete(item.id, item.term)} className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-600 dark:text-red-400 hover:text-white transition-all border border-red-500/20 shadow-sm"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </AnimatePresence>
                  </React.Fragment>
                ))}

                {activeTab === 'elements' && elements.map((item) => (
                  <tr key={item.number} className={`border-b border-[var(--border-glass)] hover:bg-indigo-500/5 transition-colors ${selectedIds.includes(item.number) ? 'bg-indigo-500/10' : ''}`}>
                    <td className="p-6">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded-lg border-2 border-[var(--border-glass)] bg-transparent checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer"
                        checked={selectedIds.includes(item.number)}
                        onChange={() => toggleSelect(item.number)}
                      />
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 text-xl shadow-sm">
                          {item.symbol}
                        </div>
                        <div>
                          <div className="font-bold text-lg text-[var(--text-primary)]">{item.name}</div>
                          <div className="text-[10px] text-[var(--text-primary)] font-mono uppercase font-black opacity-70">ATOMIC NO. {item.number} | {item.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-xs text-[var(--text-primary)] font-mono">
                      <div className="mb-2 line-clamp-2 italic text-[var(--text-primary)]/80 text-[10px] leading-relaxed font-bold">"{item.summary}"</div>
                      <div className="font-black opacity-80">MASS: {item.mass} AMU</div>
                      <div className="font-black opacity-80">RADIUS: {item.radius} PM</div>
                      <div className="font-black opacity-80">PERIOD: {item.period} | GROUP: {item.group}</div>
                    </td>
                    <td className="p-6 text-[10px] font-mono text-[var(--text-primary)] uppercase">
                      <div className="mb-1 text-indigo-600 dark:text-indigo-400 font-black">ELECTRONS: [{item.electrons?.join(', ')}]</div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2 font-bold opacity-90">
                        <span>ION: {item.ionization}</span>
                        <span>NEG: {item.electronegativity}</span>
                        <span>CONFIG: {item.config}</span>
                      </div>
                      <div className="flex items-center gap-3 border-t border-[var(--border-glass)] pt-2">
                        <div className="w-4 h-4 rounded-full border border-[var(--border-glass)]" style={{ backgroundColor: item.color }} title={item.color} />
                        <span className="text-indigo-600 dark:text-indigo-400 font-black">DISCOVERED IN: {item.discovery || 'Ancient'}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditItem(item); setIsNewItem(false); setIsEditing(true); }} className="p-2 rounded-xl bg-[var(--bg-deep)] hover:bg-indigo-500 hover:text-white text-[var(--text-primary)] transition-all border border-[var(--border-glass)] shadow-sm"><Edit2 size={16} /></button>
                        <button onClick={() => startDelete(item.number, item.name)} className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-600 dark:text-red-400 hover:text-white transition-all border border-red-500/20 shadow-sm"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}

                {activeTab === 'molecules' && molecules.map((item) => (
                  <tr key={item.formula} className={`border-b border-[var(--border-glass)] hover:bg-indigo-500/5 transition-colors ${selectedIds.includes(item.formula) ? 'bg-indigo-500/10' : ''}`}>
                    <td className="p-6">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded-lg border-2 border-[var(--border-glass)] bg-transparent checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer"
                        checked={selectedIds.includes(item.formula)}
                        onChange={() => toggleSelect(item.formula)}
                      />
                    </td>
                    <td className="p-6">
                      <div className="font-black text-xl text-indigo-600 dark:text-indigo-400">{item.formula}</div>
                      <div className="text-xs text-[var(--text-primary)] font-mono mt-1 uppercase font-bold opacity-70">{item.name}</div>
                    </td>
                    <td className="p-6 text-sm text-[var(--text-primary)] font-bold">
                      <div className="opacity-90">CENTRAL: {item.central_atom}</div>
                      <div className="text-[10px] font-mono text-[var(--text-primary)] mt-1 uppercase opacity-60">ATOMS: {item.atoms?.length || 0} | LONE PAIRS: {item.lonePairs?.length || 0}</div>
                    </td>
                    <td className="p-6 text-[10px] font-mono text-[var(--text-primary)] uppercase font-black">
                      <div className="opacity-90">REAL ANGLE: {item.realAngle || 'N/A'}</div>
                      <div className="opacity-90">MODEL ANGLE: {item.modelAngle || 'N/A'}</div>
                    </td>
                    <td className="p-6">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditItem(item); setIsNewItem(false); setIsEditing(true); }} className="p-2 rounded-xl bg-[var(--bg-deep)] hover:bg-indigo-500 hover:text-white text-[var(--text-primary)] transition-all border border-[var(--border-glass)] shadow-sm"><Edit2 size={16} /></button>
                        <button onClick={() => startDelete(item.formula, item.name)} className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-600 dark:text-red-400 hover:text-white transition-all border border-red-500/20 shadow-sm"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}

                {activeTab === 'feedback' && feedbacks.map((item) => (
                  <tr key={item.id} className={`border-b border-[var(--border-glass)] hover:bg-indigo-500/5 transition-colors ${selectedIds.includes(item.id) ? 'bg-indigo-500/10' : ''}`}>
                    <td className="p-6">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded-lg border-2 border-[var(--border-glass)] bg-transparent checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                      />
                    </td>
                    <td className="p-6">
                      <div className="font-bold text-lg text-[var(--text-primary)]">
                        {item.first_name || item.last_name ? `${item.first_name} ${item.last_name}` : item.username}
                      </div>
                      <div className="text-[10px] text-indigo-500 font-mono uppercase font-black opacity-70">{item.user_role}</div>
                      <div className="text-[10px] text-[var(--text-muted)] font-mono mt-1 italic">{new Date(item.created_at).toLocaleString()}</div>
                    </td>
                    <td className="p-6 text-sm text-[var(--text-primary)]/80 max-w-md">
                      <div className="line-clamp-3 italic leading-relaxed">"{item.comment || 'No comment provided.'}"</div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={14} className={s <= item.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'} />
                        ))}
                        <span className="ml-2 font-mono text-sm font-bold">{item.rating}/5</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex gap-2">
                        <button onClick={() => {
                          const fullName = item.first_name || item.last_name ? `${item.first_name} ${item.last_name}` : item.username;
                          startDelete(item.id, `Feedback from ${fullName}`);
                        }} className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-600 dark:text-red-400 hover:text-white transition-all border border-red-500/20 shadow-sm"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}

                {(!loading && ((activeTab === 'subjects' && subjects.length === 0) ||
                  (activeTab === 'topics' && topics.length === 0) ||
                  (activeTab === 'elements' && elements.length === 0) ||
                  (activeTab === 'molecules' && molecules.length === 0) ||
                  (activeTab === 'feedback' && feedbacks.length === 0))) && (
                    <tr>
                      <td colSpan={5} className="p-20 text-center text-[var(--text-muted)] font-mono text-sm uppercase tracking-widest">
                        No data protocols found in this sector.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-black/40 dark:bg-[#020617]/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-[var(--bg-deep)] border border-[var(--border-glass)] rounded-[40px] md:rounded-[56px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]"
            >
              <form onSubmit={handleSave}>
                <div className="p-6 md:p-10 border-b border-[var(--border-glass)] flex justify-between items-center bg-white/50 dark:bg-white/5">
                  <div>
                    <h2 className="text-xl md:text-3xl font-black uppercase tracking-tight text-[var(--text-primary)]">
                      {editItem && (editItem.id || editItem.number || editItem.formula) ? 'Update' : 'Initialize'} {activeTab.slice(0, -1)}
                    </h2>
                    <p className="text-[10px] font-mono text-[var(--text-muted)] mt-1 uppercase tracking-widest">Protocol: CRUD-SECURE-ALPHA</p>
                  </div>
                  <button type="button" onClick={() => setIsEditing(false)} className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--bg-deep)] border border-[var(--border-glass)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-indigo-500 transition-all">
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6 md:p-10 max-h-[60vh] overflow-y-auto scrollbar-hide bg-white/30 dark:bg-black/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Common Fields */}
                    {activeTab === 'subjects' && (
                      <>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Subject Name</label>
                          <input type="text" className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all" value={editItem?.name || ''} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Slug (ID)</label>
                          <input type="text" className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all" value={editItem?.slug || ''} onChange={(e) => setEditItem({ ...editItem, slug: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Icon Name</label>
                          <input type="text" className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all" value={editItem?.icon || ''} onChange={(e) => setEditItem({ ...editItem, icon: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Color Theme</label>
                          <input type="text" className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all" value={editItem?.color || ''} onChange={(e) => setEditItem({ ...editItem, color: e.target.value })} />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Description</label>
                          <textarea className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all h-32" value={editItem?.description || ''} onChange={(e) => setEditItem({ ...editItem, description: e.target.value })} />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Image URL</label>
                          <input type="url" className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all" value={editItem?.image_url || ''} onChange={(e) => setEditItem({ ...editItem, image_url: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Tailwind Theme Class</label>
                          <input type="text" className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all" value={editItem?.theme || ''} onChange={(e) => setEditItem({ ...editItem, theme: e.target.value })} />
                        </div>
                         <div className="space-y-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Tailwind Icon Color Class</label>
                          <input type="text" className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all" value={editItem?.iconColor || ''} onChange={(e) => setEditItem({ ...editItem, iconColor: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Sort Order</label>
                          <input type="number" className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all" value={editItem?.order ?? 0} onChange={(e) => setEditItem({ ...editItem, order: parseInt(e.target.value) || 0 })} />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">3D Model URL (.glb)</label>
                          <input type="text" placeholder="e.g. /models/chemistry.glb" className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all" value={editItem?.model_url || ''} onChange={(e) => setEditItem({ ...editItem, model_url: e.target.value })} />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Target Classes (comma separated)</label>
                          <input
                            type="text"
                            placeholder="e.g. Class 11, Class 12"
                            className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all"
                            value={classInput}
                            onFocus={() => setFocusedField('targetClass')}
                            onChange={(e) => setClassInput(e.target.value)}
                            onBlur={() => {
                              setFocusedField(null);
                              setEditItem({
                                ...editItem,
                                targetClass: classInput.split(',').map(s => s.trim()).filter(Boolean)
                              });
                            }}
                          />
                        </div>
                      </>
                    )}

                    {activeTab === 'glossary' && (
                      <>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Term</label>
                          <input type="text" className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all" value={editItem?.term || ''} onChange={(e) => setEditItem({ ...editItem, term: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Subject</label>
                          <select className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all" value={editItem?.subject || ''} onChange={(e) => setEditItem({ ...editItem, subject: e.target.value })}>
                            <option value="chemistry">Chemistry</option>
                            <option value="physics">Physics</option>
                            <option value="math">Mathematics</option>
                            <option value="biology">Biology</option>
                          </select>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Definition</label>
                          <textarea rows={4} className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all resize-none" value={editItem?.definition || ''} onChange={(e) => setEditItem({ ...editItem, definition: e.target.value })} />
                        </div>
                      </>
                    )}

                    {activeTab === 'topics' && (
                      <>
                        <div className="space-y-2 col-span-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Parent Subject</label>
                          <select
                            className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all"
                            value={String(editItem?.subject || '')}
                            onChange={(e) => {
                              const val = e.target.value ? Number(e.target.value) : '';
                              setEditItem({ ...editItem, subject: val });
                              console.log("Selected Subject ID:", val);
                            }}
                          >
                            <option value="" disabled>Select a subject...</option>
                            {subjects.map(s => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Topic Name</label>
                          <input
                            type="text"
                            className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all"
                            value={editItem?.name || ''}
                            onChange={(e) => {
                              const name = e.target.value;
                              const slug = name.toLowerCase().replace(/\s+/g, '_').replace(/[^\w-]+/g, '');
                              setEditItem({ ...editItem, name, slug });
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Sort Order</label>
                          <input type="number" className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all" value={editItem?.order ?? 0} onChange={(e) => setEditItem({ ...editItem, order: parseInt(e.target.value) || 0 })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Slug (ID)</label>
                          <input type="text" className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all font-mono text-indigo-400" value={editItem?.slug || ''} onChange={(e) => setEditItem({ ...editItem, slug: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Simulation ID</label>
                          <input 
                            type="text" 
                            placeholder="e.g. molecular_structure"
                            className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all font-mono text-indigo-400" 
                            value={editItem?.simulation_id || ''} 
                            onChange={(e) => setEditItem({ ...editItem, simulation_id: e.target.value })} 
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Description</label>
                          <textarea className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all h-32" value={editItem?.description || ''} onChange={(e) => setEditItem({ ...editItem, description: e.target.value })} />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Theory (Markdown)</label>
                          <textarea className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all h-48 font-mono text-sm" value={editItem?.theory || ''} onChange={(e) => setEditItem({ ...editItem, theory: e.target.value })} />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Target Classes (comma separated)</label>
                          <input
                            type="text"
                            placeholder="e.g. Class 11, Class 12"
                            className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all"
                            value={classInput}
                            onFocus={() => setFocusedField('targetClass')}
                            onChange={(e) => setClassInput(e.target.value)}
                            onBlur={() => {
                              setFocusedField(null);
                              setEditItem({
                                ...editItem,
                                targetClass: classInput.split(',').map(s => s.trim()).filter(Boolean)
                              });
                            }}
                          />
                        </div>
                      </>
                    )}

                    {activeTab === 'elements' && (
                      <>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Atomic Number</label>
                          <input type="number" className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all" value={editItem?.number ?? ''} onChange={(e) => setEditItem({ ...editItem, number: e.target.value ? parseInt(e.target.value) : '' })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Symbol</label>
                          <input type="text" className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all" value={editItem?.symbol || ''} onChange={(e) => setEditItem({ ...editItem, symbol: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Name</label>
                          <input type="text" className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all" value={editItem?.name || ''} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Category</label>
                          <select className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all" value={editItem?.category || ''} onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}>
                            <option value="nonmetal">Nonmetal</option>
                            <option value="noble-gas">Noble Gas</option>
                            <option value="alkali-metal">Alkali Metal</option>
                            <option value="alkaline-earth-metal">Alkaline Earth Metal</option>
                            <option value="metalloid">Metalloid</option>
                            <option value="halogen">Halogen</option>
                            <option value="post-transition-metal">Post-transition Metal</option>
                            <option value="transition-metal">Transition Metal</option>
                            <option value="lanthanide">Lanthanide</option>
                            <option value="actinide">Actinide</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Mass (AMU)</label>
                          <input type="number" step="0.0001" className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all" value={editItem?.mass ?? ''} onChange={(e) => setEditItem({ ...editItem, mass: e.target.value ? parseFloat(e.target.value) : '' })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Radius (PM)</label>
                          <input type="number" className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all" value={editItem?.radius ?? ''} onChange={(e) => setEditItem({ ...editItem, radius: e.target.value ? parseInt(e.target.value) : '' })} />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Period</label>
                          <input type="number" className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all" value={editItem?.period ?? ''} onChange={(e) => setEditItem({ ...editItem, period: e.target.value ? parseInt(e.target.value) : '' })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Group</label>
                          <input type="number" className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all" value={editItem?.group ?? ''} onChange={(e) => setEditItem({ ...editItem, group: e.target.value ? parseInt(e.target.value) : '' })} />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Ionization Energy</label>
                          <input type="number" className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all" value={editItem?.ionization ?? ''} onChange={(e) => setEditItem({ ...editItem, ionization: e.target.value ? parseFloat(e.target.value) : '' })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Electronegativity</label>
                          <input type="number" step="0.01" className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all" value={editItem?.electronegativity ?? ''} onChange={(e) => setEditItem({ ...editItem, electronegativity: e.target.value ? parseFloat(e.target.value) : '' })} />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Electron Shells (comma separated)</label>
                          <input
                            type="text"
                            placeholder="e.g. 2, 8, 1"
                            className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all"
                            value={electronsInput}
                            onFocus={() => setFocusedField('electrons')}
                            onChange={(e) => setElectronsInput(e.target.value)}
                            onBlur={() => {
                              setFocusedField(null);
                              setEditItem({
                                ...editItem,
                                electrons: electronsInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
                              });
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Electron Config</label>
                          <input type="text" placeholder="Type ^2 to get ² (e.g. [He] 2s^2)" className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all" value={editItem?.config || ''} onChange={(e) => {
                            const superscriptMap: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
                            const formatted = e.target.value.replace(/\^([0-9])/g, (_, digit) => superscriptMap[digit]);
                            setEditItem({ ...editItem, config: formatted });
                          }} />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Color (Hex)</label>
                          <div className="flex bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl overflow-hidden focus-within:border-indigo-500 transition-all">
                            <span className="p-4 text-[var(--text-muted)] font-black bg-black/5 dark:bg-white/5 border-r border-[var(--border-glass)]">#</span>
                            <input type="text" className="w-full bg-transparent p-4 text-[var(--text-primary)] outline-none" value={(editItem?.color || '').replace('#', '')} onChange={(e) => setEditItem({ ...editItem, color: '#' + e.target.value.replace('#', '') })} />
                            <input type="color" className="w-16 h-full min-h-[50px] cursor-pointer p-0 border-0" value={editItem?.color?.startsWith('#') ? editItem.color : '#000000'} onChange={(e) => setEditItem({ ...editItem, color: e.target.value })} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Discovery</label>
                          <input type="text" className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all" value={editItem?.discovery || ''} onChange={(e) => setEditItem({ ...editItem, discovery: e.target.value })} />
                        </div>
                        <div className="space-y-2 col-span-1 md:col-span-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Summary</label>
                          <textarea className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all h-24" value={editItem?.summary || ''} onChange={(e) => setEditItem({ ...editItem, summary: e.target.value })} />
                        </div>
                      </>
                    )}

                    {activeTab === 'molecules' && (
                      <>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Chemical Formula</label>
                          <input type="text" className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all" value={editItem?.formula || ''} onChange={(e) => setEditItem({ ...editItem, formula: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Molecule Name</label>
                          <input type="text" className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all" value={editItem?.name || ''} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Central Atom</label>
                          <input type="text" className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all" value={editItem?.central_atom || ''} onChange={(e) => setEditItem({ ...editItem, central_atom: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Real Angle</label>
                          <input type="text" className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all" value={editItem?.realAngle || ''} onChange={(e) => setEditItem({ ...editItem, realAngle: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Model Angle</label>
                          <input type="text" className="w-full bg-[var(--bg-panel)] border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all" value={editItem?.modelAngle || ''} onChange={(e) => setEditItem({ ...editItem, modelAngle: e.target.value })} />
                        </div>
                      </>
                    )}

                    {/* Complex Data Fallback */}
                    <div className="col-span-2 space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <label className="text-[10px] font-mono text-[var(--text-primary)] uppercase tracking-widest font-black">Advanced Structure (JSON)</label>
                        <span className="text-[10px] font-mono text-indigo-500 uppercase font-bold px-2 py-1 bg-indigo-500/10 rounded-lg">RESTRICTED DATA</span>
                      </div>
                      <textarea
                        className="w-full bg-white/80 dark:bg-black/40 border-2 border-[var(--border-glass)] focus:border-indigo-500 rounded-[32px] p-6 font-mono text-xs text-indigo-600 dark:text-indigo-400 focus:outline-none transition-all shadow-inner leading-relaxed h-48"
                        value={jsonValue}
                        onFocus={() => setIsJsonFocused(true)}
                        onChange={(e) => setJsonValue(e.target.value)}
                        onBlur={() => {
                          setIsJsonFocused(false);
                          try {
                            const parsed = JSON.parse(jsonValue);
                            setEditItem({ ...editItem, ...parsed });
                          } catch (err) {
                            console.error("Invalid JSON:", err);
                            // No alert here to avoid annoying the user, 
                            // the useEffect will reset it to match editItem on next render
                          }
                        }}
                      />
                      <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-3">
                        <AlertCircle size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                          Edit complex nested data here (like <span className="text-[var(--text-primary)] font-bold">atoms</span> or <span className="text-[var(--text-primary)] font-bold">electrons</span>). Changes are applied when you <span className="text-indigo-500 font-bold">click outside</span> this text box. If the JSON is invalid, changes will be discarded.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 md:p-10 bg-white/50 dark:bg-white/5 border-t border-[var(--border-glass)] flex flex-col md:flex-row justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-8 py-4 rounded-2xl bg-[var(--bg-deep)] border border-[var(--border-glass)] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all text-xs font-bold uppercase tracking-widest"
                  >
                    Abort Changes
                  </button>
                  <button
                    type="submit"
                    className="px-12 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 transition-all text-xs font-bold uppercase tracking-widest text-white shadow-[0_20px_40px_-10px_rgba(79,70,229,0.3)] flex items-center justify-center gap-3"
                  >
                    <Save size={18} /> Commit to Database
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (itemToDelete || itemsToBulkDelete.length > 0) && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-6 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute inset-0 bg-red-950/40 dark:bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[var(--bg-deep)] border-2 border-red-500/30 rounded-[40px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(239,68,68,0.2)]"
            >
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-6 border border-red-500/20">
                  <Trash2 size={40} />
                </div>
                
                <h2 className="text-2xl font-black uppercase tracking-tight text-red-500 mb-2">Destructive Action</h2>
                <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-8">Authorization Protocol Required</p>
                
                <div className="p-6 bg-red-500/5 rounded-3xl border border-red-500/10 mb-8">
                  <p className="text-sm text-[var(--text-primary)] leading-relaxed mb-1">
                    You are about to permanently delete:
                  </p>
                  <p className="text-xl font-black text-red-500 uppercase tracking-tight break-words">
                    {itemToDelete ? itemToDelete.name : `${itemsToBulkDelete.length} Selected Items`}
                  </p>
                  {itemsToBulkDelete.length > 0 && (
                    <div className="mt-4 max-h-24 overflow-y-auto pr-2 scrollbar-hide">
                      <div className="flex flex-wrap gap-2 justify-center">
                        {itemsToBulkDelete.map(item => (
                          <span key={item.id} className="text-[9px] px-2 py-0.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 font-mono font-bold">
                            {item.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-[10px] font-mono text-red-400/60 uppercase mt-4 font-bold italic">
                    Caution: This action cannot be reversed.
                  </p>
                </div>

                <div className="space-y-4 text-left">
                  <div className="flex justify-between items-end px-2">
                    <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest font-black">Security Confirmation</label>
                    <span className="text-[10px] font-mono text-red-500 font-black tracking-widest">{userInput.length}/{securityCode.length}</span>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full bg-black/20 border border-[var(--border-glass)] rounded-2xl p-4 text-[var(--text-primary)] focus:border-red-500 outline-none transition-all font-mono text-center uppercase tracking-[0.2em] font-black placeholder:text-white/5"
                      placeholder="Type code here"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value.toLowerCase())}
                      autoFocus
                    />
                  </div>
                  
                  <p className="text-[10px] text-[var(--text-muted)] text-center font-mono py-2">
                    Please type <span className="text-red-500 font-black bg-red-500/10 px-2 py-0.5 rounded">{securityCode}</span> to proceed.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-10">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-6 py-4 rounded-2xl bg-[var(--bg-deep)] border border-[var(--border-glass)] hover:bg-white/5 transition-all text-[10px] font-bold uppercase tracking-widest"
                  >
                    Abort
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={userInput !== securityCode || isDeleting}
                    className={`px-6 py-4 rounded-2xl transition-all text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 ${
                      userInput === securityCode && !isDeleting
                        ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20'
                        : 'bg-white/5 text-[var(--text-muted)] cursor-not-allowed border border-[var(--border-glass)]'
                    }`}
                  >
                    {isDeleting ? <RefreshCcw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    Execute Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
