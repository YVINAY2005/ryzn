import Editor from '@monaco-editor/react';

export const CodePanel = ({ code = '', onChange }: any) => {
  return (
    <div className="col h-full overflow-hidden">
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="typescript"
          value={code}
          onChange={(value) => onChange && onChange(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16 },
            wordWrap: 'on',
            folding: true,
            lineNumbers: 'on',
          }}
        />
      </div>
    </div>
  );
};
