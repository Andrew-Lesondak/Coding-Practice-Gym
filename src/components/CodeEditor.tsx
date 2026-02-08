import { useEffect, useRef } from 'react';
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || !editorRef.current) return;
    const observer = new ResizeObserver(() => {
      editorRef.current?.layout();
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-[700px] resize-y overflow-auto rounded-2xl border border-white/10 pr-3 pb-3"
      style={{ minHeight: 360 }}
    >
      <div className="h-full w-full">
        <Editor
          value={value}
          theme="vs-dark"
          language={language}
          onChange={(val) => onChange(val ?? '')}
          onMount={(editor) => {
            editorRef.current = editor;
            editor.layout();
          }}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 16 },
            wordWrap: 'on'
          }}
          height="100%"
          width="100%"
        />
      </div>
    </div>
  );
};

export default CodeEditor;
