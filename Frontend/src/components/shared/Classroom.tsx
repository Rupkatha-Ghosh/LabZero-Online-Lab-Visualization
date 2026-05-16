
import React, { useState, useEffect } from 'react';
import { Topic, DiscussionPost, DiscussionComment, Resource } from '../../types/types';
import { useAuth } from '../../context/AuthContext';
import { 
  Send, 
  MessageSquare, 
  User as UserIcon, 
  Clock, 
  Trash2, 
  FileText, 
  Download, 
  Presentation,
  AlertCircle,
  Megaphone,
  LayoutGrid,
  GraduationCap,
  Video
} from 'lucide-react';
import { savePost, getPostsByTopic, deletePost, saveComment, getCommentsByPost, deleteComment } from '../../services/discussionService';
import { getResourcesByTopic } from '../../services/resourceService';
import ResourceUpload from './ResourceUpload';
import { motion, AnimatePresence } from 'motion/react';

interface ClassroomProps {
  topic: Topic;
  onPresent: (resource: Resource) => void;
  onStartMeeting?: (topic: Topic) => void;
}

const Classroom: React.FC<ClassroomProps> = ({ topic, onPresent, onStartMeeting }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [postType, setPostType] = useState<'announcement' | 'problem'>('announcement');
  const [comments, setComments] = useState<Record<string, DiscussionComment[]>>({});
  const [newCommentContent, setNewCommentContent] = useState<Record<string, string>>({});

  const canManagePost = (post?: DiscussionPost) => {
    if (!user) return false;
    if (user.role === 'teacher' || user.role === 'institute') return true;
    if (post && post.author === user.username) return true;
    return false;
  };

  const fetchData = async () => {
    try {
      const [postsData, resourcesData] = await Promise.all([
        getPostsByTopic(topic.id),
        getResourcesByTopic(topic.id)
      ]);
      
      const sortedPosts = postsData.sort((a, b) => b.timestamp - a.timestamp);
      setPosts(sortedPosts);
      setResources(resourcesData.sort((a, b) => b.timestamp - a.timestamp));

      const commentsMap: Record<string, DiscussionComment[]> = {};
      await Promise.all(sortedPosts.map(async (post) => {
        const postComments = await getCommentsByPost(post.id);
        commentsMap[post.id] = postComments.sort((a, b) => a.timestamp - b.timestamp);
      }));
      setComments(commentsMap);
    } catch (err) {
      console.error('Failed to fetch classroom data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [topic.id]);

  useEffect(() => {
    if (user?.role === 'student' && postType === 'announcement') {
      setPostType('problem');
    }
  }, [user]);

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !user) return;

    const post: DiscussionPost = {
      id: crypto.randomUUID(),
      topicId: topic.id,
      author: user.username,
      content: newPostContent,
      timestamp: Date.now(),
      type: postType,
    };

    try {
      await savePost(post);
      setNewPostContent('');
      fetchData();
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      await deletePost(id);
      fetchData();
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const handleCreateComment = async (postId: string) => {
    const content = newCommentContent[postId];
    if (!content?.trim() || !user) return;

    const comment: DiscussionComment = {
      id: crypto.randomUUID(),
      postId,
      author: user.username,
      content,
      timestamp: Date.now(),
    };

    try {
      await saveComment(comment);
      setNewCommentContent(prev => ({ ...prev, [postId]: '' }));
      fetchData();
    } catch (err) {
      console.error('Failed to create comment:', err);
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
    <div className="h-full overflow-y-auto px-8 py-16 bg-[#020617] grainy">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Stream */}
        <div className="lg:col-span-8 space-y-12">
          {/* Post Creator */}
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-3xl shadow-2xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                <UserIcon size={24} />
              </div>
              <div className="flex-1">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Announce something to your class or post a problem..."
                  className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-slate-600 resize-none h-24 text-sm font-light leading-relaxed"
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
                {(user?.role === 'teacher' || user?.role === 'institute') && (
                  <button
                    onClick={() => setPostType('announcement')}
                    className={`px-4 py-2 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all ${
                      postType === 'announcement' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Announcement
                  </button>
                )}
                <button
                  onClick={() => setPostType('problem')}
                  className={`px-4 py-2 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all ${
                    postType === 'problem' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Problem
                </button>
              </div>
              <button
                onClick={handleCreatePost}
                disabled={!newPostContent.trim()}
                className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-indigo-600 text-white text-[10px] font-mono uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20"
              >
                <Send size={14} />
                Post
              </button>
            </div>
          </div>

          {/* Stream Posts */}
          <div className="space-y-8">
            <AnimatePresence mode="popLayout">
              {posts.map((post) => (
                <motion.div 
                  key={post.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-8 rounded-3xl bg-white/[0.01] border border-white/5 hover:border-white/10 transition-all group"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        post.type === 'problem' ? 'bg-rose-500/10 text-rose-500' : 'bg-indigo-500/10 text-indigo-400'
                      }`}>
                        {post.type === 'problem' ? <AlertCircle size={24} /> : <Megaphone size={24} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-display font-bold text-white uppercase tracking-tight">{post.author}</span>
                          <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                            {new Date(post.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className={`text-[9px] font-mono uppercase tracking-[0.3em] mt-1 ${
                          post.type === 'problem' ? 'text-rose-500' : 'text-indigo-500'
                        }`}>
                          {post.type}
                        </div>
                      </div>
                    </div>
                    {canManagePost(post) && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="w-8 h-8 rounded-lg bg-white/5 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <p className="text-sm text-slate-400 font-light leading-relaxed mb-8 whitespace-pre-wrap pl-16">
                    {post.content}
                  </p>

                  {/* Comments Section */}
                  <div className="space-y-4 pt-8 border-t border-white/5 pl-16">
                    {comments[post.id]?.map((comment) => (
                      <div key={comment.id} className="flex gap-4">
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-600 shrink-0">
                          <UserIcon size={14} />
                        </div>
                        <div className="flex-1 bg-white/[0.02] rounded-2xl p-4 border border-white/5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest">{comment.author}</span>
                            <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">
                              {new Date(comment.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 font-light leading-relaxed">{comment.content}</p>
                        </div>
                      </div>
                    ))}

                    {/* Comment Input */}
                    <div className="flex gap-4 mt-6">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                        <MessageSquare size={14} />
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={newCommentContent[post.id] || ''}
                          onChange={(e) => setNewCommentContent(prev => ({ ...prev, [post.id]: e.target.value }))}
                          placeholder="Add a class comment..."
                          className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-700 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                          onKeyDown={(e) => e.key === 'Enter' && handleCreateComment(post.id)}
                        />
                        <button
                          onClick={() => handleCreateComment(post.id)}
                          className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {posts.length === 0 && (
              <div className="py-32 text-center space-y-6">
                <div className="w-20 h-20 rounded-[40px] bg-white/[0.02] border border-white/5 flex items-center justify-center text-slate-800 mx-auto">
                  <MessageSquare size={40} strokeWidth={1} />
                </div>
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.4em]">Class stream is empty</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Resources & Class Info */}
        <div className="lg:col-span-4 space-y-12">
          {/* Class Info Card */}
          <div className="p-10 rounded-[48px] bg-gradient-to-br from-indigo-600 to-violet-800 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 text-white/10 group-hover:scale-110 transition-transform duration-1000">
              <LayoutGrid size={200} strokeWidth={0.5} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <GraduationCap size={16} />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/70">Classroom</span>
              </div>
              <h2 className="text-4xl font-display font-bold tracking-tighter leading-[0.9] mb-8 uppercase italic">
                {topic.name}
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-white/80">
                  <Clock size={14} className="text-white/40" />
                  <span>Active Session</span>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-white/80">
                  <UserIcon size={14} className="text-white/40" />
                  <span>{user?.role === 'teacher' ? 'Your Session' : 'Instructor: Sayan Sinha'}</span>
                </div>
              </div>
              {onStartMeeting && (
                <button
                  onClick={() => onStartMeeting(topic)}
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-[10px] font-mono font-bold uppercase tracking-[0.22em] text-slate-950 transition-all hover:bg-sky-50"
                >
                  <Video size={16} />
                  {user?.role === 'student' ? 'Join Online Class' : 'Start Online Class'}
                </button>
              )}
            </div>
          </div>

          {/* Class Materials */}
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em]">Materials</h3>
              <div className="h-px w-4 bg-white/10" />
            </div>

            <div className="space-y-3">
              {resources.map((resource) => (
                <div key={resource.id} className="group p-4 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-white/10 hover:bg-white/[0.03] transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 group-hover:scale-110 transition-transform">
                        <FileText size={18} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-medium text-white truncate">{resource.name}</p>
                        <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">
                          {new Date(resource.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <button
                        onClick={() => onPresent(resource)}
                        className="w-8 h-8 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-all flex items-center justify-center"
                      >
                        <Presentation size={14} />
                      </button>
                      <button
                        onClick={() => handleDownloadResource(resource)}
                        className="w-8 h-8 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {resources.length === 0 && (
                <div className="p-12 rounded-3xl border-2 border-dashed border-white/5 text-center">
                  <p className="text-[10px] font-mono text-slate-700 uppercase tracking-widest">No materials</p>
                </div>
              )}
            </div>

            {(user?.role === 'teacher' || user?.role === 'institute') && (
              <ResourceUpload topicId={topic.id} onUploadComplete={fetchData} />
            )}
          </section>
        </div>

      </div>
    </div>
  );
};

export default Classroom;
