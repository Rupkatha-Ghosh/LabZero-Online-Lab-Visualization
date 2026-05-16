import React from 'react';
import { MonitorUp } from 'lucide-react';

interface ScreenShareProps {
  isScreenSharing: boolean;
}

const ScreenShare: React.FC<ScreenShareProps> = ({ isScreenSharing }) => (
  <div className={`rounded-2xl border px-4 py-3 text-xs ${isScreenSharing ? 'border-sky-400/40 bg-sky-500/10 text-sky-200' : 'border-white/10 bg-white/[0.03] text-slate-500'}`}>
    <div className="flex items-center gap-2">
      <MonitorUp size={16} />
      <span>{isScreenSharing ? 'You are sharing your screen' : 'Screen share is off'}</span>
    </div>
  </div>
);

export default ScreenShare;
