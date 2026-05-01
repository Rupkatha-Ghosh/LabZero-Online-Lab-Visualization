
import React, { useState, useRef } from 'react';
import { Upload, FileText, X, Check, Loader2 } from 'lucide-react';
import { Resource } from '../../types/types';
import { saveResource } from '../../services/resourceService';

interface ResourceUploadProps {
  topicId: string;
  onUploadComplete: () => void;
}

const ResourceUpload: React.FC<ResourceUploadProps> = ({ topicId, onUploadComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit file size to 10MB for IndexedDB safety
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Content = event.target?.result as string;
        
        const resource: Resource = {
          id: crypto.randomUUID(),
          topicId,
          name: file.name,
          type: file.type || 'application/octet-stream',
          content: base64Content,
          timestamp: Date.now(),
        };

        await saveResource(resource);
        setIsUploading(false);
        onUploadComplete();
        if (fileInputRef.current) fileInputRef.current.value = '';
      };

      reader.onerror = () => {
        setError('Failed to read file.');
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Upload error:', err);
      setError('An error occurred during upload.');
      setIsUploading(false);
    }
  };

  return (
    <div className="mt-8 p-6 rounded-3xl bg-slate-900/30 border border-white/5 border-dashed hover:border-indigo-500/30 transition-all group">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
          {isUploading ? <Loader2 className="animate-spin" size={24} /> : <Upload size={24} />}
        </div>
        
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Upload Study Material</h3>
          <p className="text-xs text-slate-500 mt-1">PDF, PPT, or Notes (Max 10MB)</p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-6 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold uppercase tracking-widest hover:bg-slate-700 transition-all disabled:opacity-50"
        >
          {isUploading ? 'Uploading...' : 'Select File'}
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.ppt,.pptx,.txt,.doc,.docx"
        />

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-[10px] font-bold uppercase">
            <X size={12} />
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceUpload;
