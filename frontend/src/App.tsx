import React, { useState, useCallback, useEffect } from 'react';
import { ChatPanel } from './components/ChatPanel';
import { CodePanel } from './components/CodePanel';
import { PreviewPanel } from './components/PreviewPanel';
import { UIAgent } from './lib/agent';

const agent = new UIAgent();

const INITIAL_CODE = `import React from 'react';
import { Card } from "@/ui";

export default function GeneratedUI() {
  return (
    <div className="layout">
      <Card title="Ready to start?">
        <p>Describe the UI you want in the chat panel to the left.</p>
      </Card>
    </div>
  );
}
`;

function App() {
  const [messages, setMessages] = useState<any[]>([]);
  const [code, setCode] = useState(INITIAL_CODE);
  const [versions, setVersions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchVersions = useCallback(async () => {
    const data = await agent.getVersions();
    setVersions(data);
  }, []);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    const newUserMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, newUserMessage]);
    setIsGenerating(true);

    try {
      const mode = versions.length > 0 ? 'modify' : 'new';
      const currentCode = code;
      const result = await agent.run(text, mode, currentCode);
      
      if (result.code) {
        setCode(result.code);
        await fetchVersions();
      }
      
      if (result.explanation) {
        setMessages(prev => [...prev, { 
          role: 'agent', 
          content: result.explanation,
          thinking: result.thinking,
          plan: result.plan
        }]);
      }
    } catch (error) {
      console.error('Agent error:', error);
      setMessages(prev => [...prev, { role: 'agent', content: 'Sorry, I encountered an error generating the UI.' }]);
    } finally {
      setIsGenerating(false);
    }
  }, [code, versions, fetchVersions]);

  const handleRollback = useCallback((versionData?: any) => {
    if (versionData) {
      setCode(versionData.code);
      setMessages(prev => [...prev, { role: 'agent', content: `Switched to version ${versionData.version}.` }]);
    } else if (versions.length > 1) {
      const previousVersion = versions[1]; // Index 0 is latest, 1 is previous
      setCode(previousVersion.code);
      setMessages(prev => [...prev, { role: 'agent', content: `Rolled back to version ${previousVersion.version}.` }]);
    }
  }, [versions]);

  const handleRegenerate = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage.content);
    }
  }, [messages, handleSendMessage]);

  return (
    <div className="layout h-full overflow-hidden" style={{ height: '100vh', background: 'var(--background)' }}>
      <div className="row h-full overflow-hidden" style={{ gap: 0 }}>
        <ChatPanel 
          messages={messages} 
          onSendMessage={handleSendMessage} 
          onRollback={handleRollback}
          onRegenerate={handleRegenerate}
          versions={versions.length}
          history={versions}
          isGenerating={isGenerating}
        />
        
        <div className="flex-1 col overflow-hidden p-8" style={{ gap: '2rem', background: 'transparent', position: 'relative' }}>
          {/* Header Area */}
          <div className="row justify-between items-center animate-fade-in" style={{ zIndex: 10 }}>
            <div className="col" style={{ gap: '0.5rem' }}>
              <h1 className="gradient-text shiny-effect" style={{ fontSize: '2.2rem', margin: 0, letterSpacing: '-0.02em' }}>
                Ryze AI Workspace
              </h1>
              <p style={{ color: 'var(--muted-foreground)', margin: 0, fontSize: '0.9rem' }}>
                Design, build, and iterate on your UI in real-time
              </p>
            </div>
            
            <div className="row items-center dark-card p-2 px-4 rounded-full" style={{ gap: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div className="animate-pulse-soft" style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 10px #22c55e' }}></div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>System Active</span>
              <div style={{ width: '1px', height: '15px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
              <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>v{versions.length > 0 ? versions[0].version : '1.0'}</span>
            </div>
          </div>

          {/* Main Grid */}
          <div className="flex-1 grid overflow-hidden" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="dark-card rounded-lg overflow-hidden animate-fade-in shiny-effect" style={{ animationDelay: '0.1s', display: 'flex', flexDirection: 'column' }}>
              <div className="p-4 border-b flex items-center justify-between" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                <div className="row items-center" style={{ gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--primary)' }}></div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Source Code</span>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <CodePanel code={code} onChange={setCode} />
              </div>
            </div>

            <div className="dark-card rounded-lg overflow-hidden animate-fade-in" style={{ animationDelay: '0.2s', display: 'flex', flexDirection: 'column' }}>
              <div className="p-4 border-b flex items-center justify-between" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                <div className="row items-center" style={{ gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--accent)' }}></div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Preview</span>
                </div>
              </div>
              <div className="flex-1 overflow-auto bg-[#0f172a] p-8">
                <div className="min-h-full rounded-xl border border-dashed border-white/10 flex items-center justify-center" style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
                  <PreviewPanel code={code} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
