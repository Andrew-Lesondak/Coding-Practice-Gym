import Editor from '@monaco-editor/react';

const CodeEditor = ({
  value,
  language,
  onChange
}: {
  value: string;
  language: 'typescript' | 'javascript';
  onChange: (value: string) => void;
}) => {
  return (
    <div className="h-[520px] overflow-hidden rounded-2xl border border-white/10">
      <Editor
        value={value}
        theme="vs-dark"
        language={language}
        onChange={(val) => onChange(val ?? '')}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          wordWrap: 'on'
        }}
      />
    </div>
  );
};

export default CodeEditor;
