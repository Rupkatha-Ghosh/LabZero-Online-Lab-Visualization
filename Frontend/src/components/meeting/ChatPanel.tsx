import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatMessage {
  id: string;
  author: string;
  text: string;
  timestamp: number;
}

interface ChatPanelProps {
  userName: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ userName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');

  const sendMessage = () => {
    if (!draft.trim()) return;
    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        author: userName,
        text: draft.trim(),
        timestamp: Date.now(),
      },
    ]);
    setDraft('');
  };

  return (
    <aside className="flex h-full min-h-0 flex-col rounded-[24px] bg-[#303134]">
      <div className="flex-1 space-y-3 overflow-y-auto p-5">
        {messages.length === 0 ? (
          <p className="py-10 text-center text-sm leading-relaxed text-slate-400">No messages yet.</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="rounded-2xl bg-[#3c4043] p-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-200">{message.author}</span>
                <span className="text-[9px] font-mono text-slate-600">{new Date(message.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">{message.text}</p>
            </div>
          ))
        )}
      </div>
      <div className="flex gap-2 border-t border-white/10 p-4">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="min-w-0 flex-1 rounded-full border border-white/10 bg-[#202124] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-400"
        />
        <button onClick={sendMessage} className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-600 text-white hover:bg-sky-500">
          <Send size={18} />
        </button>
      </div>
    </aside>
  );
};

export default ChatPanel;
