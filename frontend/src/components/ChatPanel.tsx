import React, { useState, useRef, useEffect } from 'react';
import { Send, History, X, Sparkles, RefreshCw, Terminal } from 'lucide-react';

export const ChatPanel = ({ messages, onSendMessage, onRollback, versions, isGenerating, history, onRegenerate }: any) => {
  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isGenerating) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="col h-full border-r" style={{ width: '400px', display: 'flex', flexDirection: 'column', position: 'relative', background: 'rgba(2, 6, 23, 0.5)', backdropFilter: 'blur(20px)' }}>
      {/* Header */}
      <div className="p-6 border-b flex items-center justify-between" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
        <div className="col" style={{ gap: '4px' }}>
          <h2 className="gradient-text" style={{ fontSize: '1.2rem', margin: 0, fontWeight: 800 }}>Ryze AI Assistant</h2>
          <div className="row items-center" style={{ gap: '6px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', fontWeight: 500 }}>v{versions} • Gemini 1.5 Flash</span>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
            <span style={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 600 }}>Connected</span>
          </div>
        </div>
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className="ui-button"
          style={{ padding: '8px', borderRadius: '10px' }}
        >
          <History size={18} />
        </button>
      </div>

      {/* History Dropdown */}
      {showHistory && (
        <div className="absolute top-20 left-4 right-4 dark-card rounded-xl p-4 z-50 animate-fade-in" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <div className="row justify-between items-center mb-4">
            <h3 style={{ fontSize: '0.9rem', margin: 0, fontWeight: 700, color: 'var(--foreground)' }}>Version History</h3>
            <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>
          <div className="col" style={{ gap: '10px' }}>
            {history.map((v: any) => (
              <div 
                key={v.version} 
                className="p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-white/10"
                onClick={() => {
                  onRollback(v);
                  setShowHistory(false);
                }}
              >
                <div className="row justify-between items-center mb-1">
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>v{v.version}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>{new Date(v.createdAt).toLocaleTimeString()}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--foreground)', opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {v.userMessage}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-auto p-6 col" style={{ gap: '2rem' }}>
        {messages.length === 0 && (
          <div className="col items-center justify-center h-full animate-fade-in" style={{ textAlign: 'center' }}>
            <div className="shiny-effect" style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>✨</div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Ready to build?</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', maxWidth: '250px', lineHeight: '1.5' }}>
              Describe the UI you want to create and I'll generate the code for you.
            </p>
          </div>
        )}
        {messages.map((msg: any, i: number) => (
          <div key={i} className={`col animate-fade-in`} style={{ 
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%',
            animationDelay: `${i * 0.1}s`
          }}>
            <div className={`p-4 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'dark-card'
            }`} style={{ 
              fontSize: '0.95rem',
              lineHeight: '1.5',
              borderBottomRightRadius: msg.role === 'user' ? '4px' : '20px',
              borderBottomLeftRadius: msg.role === 'agent' ? '4px' : '20px',
            }}>
              {msg.content}
            </div>
            <span style={{ 
              fontSize: '0.7rem', 
              color: 'var(--muted-foreground)', 
              marginTop: '6px',
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {msg.role === 'user' ? 'You' : 'Ryze AI'}
            </span>
          </div>
        ))}
        {isGenerating && (
          <div className="col" style={{ gap: '8px' }}>
            <div className="dark-card p-4 rounded-2xl animate-pulse-soft" style={{ width: '60px', display: 'flex', gap: '4px', justifyContent: 'center' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }}></div>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', animationDelay: '0.2s' }}></div>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 border-t" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
        <form onSubmit={handleSubmit} className="row" style={{ gap: '10px' }}>
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your UI..."
              className="ui-input"
              style={{ paddingRight: '45px', background: 'rgba(2, 6, 23, 0.5)', height: '50px', borderRadius: '14px' }}
              disabled={isGenerating}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Sparkles size={18} className={isGenerating ? 'animate-pulse' : 'text-primary'} style={{ opacity: 0.5 }} />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={!input.trim() || isGenerating}
            className="ui-button-primary"
            style={{ width: '50px', height: '50px', padding: 0, borderRadius: '14px' }}
          >
            <Send size={20} />
          </button>
        </form>
        <div className="row justify-center mt-4" style={{ gap: '20px' }}>
          <button onClick={onRegenerate} className="row items-center" style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', fontSize: '0.75rem', cursor: 'pointer', gap: '6px', fontWeight: 600 }}>
            <RefreshCw size={14} /> REGENERATE
          </button>
          <div style={{ width: '1px', height: '12px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
          <button className="row items-center" style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', fontSize: '0.75rem', cursor: 'pointer', gap: '6px', fontWeight: 600 }}>
            <Terminal size={14} /> CLEAR CHAT
          </button>
        </div>
      </div>
    </div>
  );
};
