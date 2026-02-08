import { useEffect, useRef, useState } from 'react';
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
  const [copied, setCopied] = useState(false);
  const editorFocusedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || !editorRef.current) return;
    const observer = new ResizeObserver(() => {
      editorRef.current?.layout();
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {};
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end gap-2 text-xs">
        <button
          type="button"
          className="rounded-full border border-white/15 px-3 py-1 text-mist-200"
          onClick={() => {
            const editor = editorRef.current;
            const model = editor?.getModel?.();
            if (editor && model) {
              editor.setSelection(model.getFullModelRange());
              editor.focus();
            }
          }}
        >
          Select all
        </button>
        <button
          type="button"
          className="rounded-full border border-white/15 px-3 py-1 text-mist-200"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            } catch {
              const editor = editorRef.current;
              const model = editor?.getModel?.();
              if (editor && model) {
                editor.setSelection(model.getFullModelRange());
                editor.focus();
                editor.trigger('editor', 'editor.action.clipboardCopyAction', {});
              }
            }
          }}
        >
          {copied ? 'Copied' : 'Copy all'}
        </button>
      </div>
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
            editor.onDidFocusEditorText(() => {
              editorFocusedRef.current = true;
            });
            editor.onDidBlurEditorText(() => {
              editorFocusedRef.current = false;
            });
            const dom = editor.getDomNode();
            if (dom) {
              dom.addEventListener(
                'beforeinput',
                (event: InputEvent) => {
                  const inputType = (event as InputEvent).inputType;
                  if (!editor.hasTextFocus()) return;
                  if (inputType === 'historyUndo') {
                    event.preventDefault();
                    editor.trigger('keyboard', 'undo', null);
                  } else if (inputType === 'selectAll') {
                    event.preventDefault();
                    editor.trigger('keyboard', 'editor.action.selectAll', null);
                  }
                },
                true
              );
            }
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
    </div>
  );
};

export default CodeEditor;
