import React from 'react';
import { LiveProvider, LiveError, LivePreview } from 'react-live';
import * as UI from '@/ui';

export const PreviewPanel = ({ code }: any) => {
  // Preprocess code to remove imports and export default
  const transformCode = (c: string) => {
    if (!c) return '';
    return c
      .replace(/import\s+.*?\s+from\s+['"].*?['"];?/g, '')
      .replace(/export\s+default\s+function\s+GeneratedUI\(\)\s*\{/g, 'const GeneratedUI = () => {')
      .replace(/export\s+default\s+GeneratedUI;?/g, '')
      + '\nrender(<GeneratedUI />);';
  };

  return (
    <div className="col h-full overflow-hidden w-full">
      <div className="flex-1 overflow-auto p-4">
        <LiveProvider 
          code={transformCode(code)} 
          scope={{ ...UI, React }}
          noInline={true}
        >
          <LivePreview />
          <LiveError style={{ 
            color: '#ef4444', 
            padding: '1.5rem', 
            fontSize: '0.85rem',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            marginTop: '1rem',
            fontFamily: 'monospace'
          }} />
        </LiveProvider>
      </div>
    </div>
  );
};
