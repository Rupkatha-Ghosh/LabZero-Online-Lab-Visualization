
import React from 'react';
import { X, Maximize2, Minimize2, Download } from 'lucide-react';
import { Resource } from '../../types/types';

interface ResourceViewerProps {
  resource: Resource;
  onClose: () => void;
}

const ResourceViewer: React.FC<ResourceViewerProps> = ({ resource, onClose }) => {
  const isPdf = resource.type === 'application/pdf';
  const isText = resource.type.startsWith('text/');
  const isImage = resource.type.startsWith('image/');

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = resource.content;
    link.download = resource.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col">
      {/* Viewer Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-white/5 bg-slate-900/50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Maximize2 size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase italic tracking-tight leading-none">
              Presentation Mode
            </h2>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">
              {resource.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all text-xs font-bold uppercase tracking-widest"
          >
            <Download size={16} />
            Download
          </button>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Viewer Content */}
      <main className="flex-1 overflow-hidden p-8 flex items-center justify-center">
        <div className="w-full h-full max-w-6xl bg-slate-900/50 rounded-[40px] border border-white/5 overflow-hidden shadow-2xl relative">
          {isPdf ? (
            <iframe
              src={resource.content}
              className="w-full h-full border-none"
              title={resource.name}
            />
          ) : isText ? (
            <div className="w-full h-full overflow-y-auto p-12 font-mono text-sm text-slate-300 whitespace-pre-wrap selection:bg-indigo-500/30">
              {atob(resource.content.split(',')[1])}
            </div>
          ) : isImage ? (
            <div className="w-full h-full flex items-center justify-center p-8">
              <img
                src={resource.content}
                alt={resource.name}
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-6 text-center p-12">
              <div className="w-24 h-24 rounded-[32px] bg-slate-800 flex items-center justify-center text-slate-500">
                <X size={48} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Format Not Supported for Direct Preview</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                  This file format ({resource.type}) cannot be rendered directly in the presentation mode. Please download it to view using your local applications.
                </p>
              </div>
              <button
                onClick={handleDownload}
                className="px-8 py-3 rounded-2xl bg-indigo-600 text-white font-bold uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
              >
                Download to Present
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Viewer Footer */}
      <footer className="px-8 py-4 border-t border-white/5 bg-slate-900/50 flex items-center justify-center">
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.2em]">
          Atomic Explorer • Interactive Teaching Tool
        </p>
      </footer>
    </div>
  );
};

export default ResourceViewer;
