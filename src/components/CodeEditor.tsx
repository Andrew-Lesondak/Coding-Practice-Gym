import { useEffect, useRef, useState } from 'react';
import Editor, { loader } from '@monaco-editor/react';


const LOCAL_MONACO_VS_PATH = '/monaco/vs';
const CDN_MONACO_VS = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs';
let monacoLoaderConfigured = false;

const ensureMonacoLoaderConfigured = async () => {
  if (monacoLoaderConfigured) return;
  let vsPath = CDN_MONACO_VS;
  try {
    const localVsUrl = new URL(LOCAL_MONACO_VS_PATH, window.location.origin).toString();
    const response = await fetch(`${localVsUrl}/loader.js`, { method: 'HEAD' });
    if (response.ok) {
      vsPath = localVsUrl;
    }
  } catch {
    // Fall back to CDN when local Monaco assets are unavailable.
  }
  loader.config({ paths: { vs: vsPath } });
  monacoLoaderConfigured = true;
};

const CodeEditor = ({
  value,
  language,
  onChange,
  path,
  suppressDiagnostics = false,
  readOnly = false
}: {
  value: string;
  language: 'typescript' | 'javascript';
  onChange: (value: string) => void;
  path?: string;
  suppressDiagnostics?: boolean;
  readOnly?: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  const monacoRef = useRef<any>(null);
  const [copied, setCopied] = useState(false);
  const [loaderReady, setLoaderReady] = useState(false);
  const editorFocusedRef = useRef(false);
  const latestValueRef = useRef(value);
  const hasMountedRef = useRef(false);
  const hasModelValueRef = useRef(false);
  const lastEmittedRef = useRef<string | null>(null);
  const modelIdRef = useRef(
    typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `model-${Date.now()}`
  );
  const modelPath = path ?? `file:///model/${modelIdRef.current}.${language === 'typescript' ? 'ts' : 'js'}`;

  useEffect(() => {
    latestValueRef.current = value;
  }, [value]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let active = true;
    ensureMonacoLoaderConfigured().finally(() => {
      if (active) setLoaderReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const model = editor?.getModel?.();
    if (editor && model && monaco) {
      monaco.editor.setModelLanguage(model, language);
    }
  }, [language]);
  useEffect(() => {
    if (!containerRef.current || !editorRef.current) return;
    let frame: number | null = null;
    let lastWidth = 0;
    let lastHeight = 0;
    const observer = new ResizeObserver(() => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(() => {
        frame = null;
        if (!containerRef.current) return;
        const { width, height } = containerRef.current.getBoundingClientRect();
        if (width === lastWidth && height === lastHeight) return;
        lastWidth = width;
        lastHeight = height;
        editorRef.current?.layout();
      });
    });
    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
        frame = null;
      }
    };
  }, []);

  useEffect(() => {
    const flushLatest = () => {
      if (!hasMountedRef.current) return;
      const editor = editorRef.current;
      const model = editor?.getModel?.();
      const modelValue = model ? model.getValue() : '';
      const nextValue =
        modelValue.trim() === '' && latestValueRef.current.trim() !== '' ? latestValueRef.current : modelValue || latestValueRef.current;
      if (nextValue !== latestValueRef.current) {
        latestValueRef.current = nextValue;
      }
      if (!hasModelValueRef.current && latestValueRef.current.trim() === '') {
        return;
      }
      if (lastEmittedRef.current === latestValueRef.current) return;
      lastEmittedRef.current = latestValueRef.current;
      onChangeRef.current(latestValueRef.current);
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        flushLatest();
      }
    };

    const handleBeforeUnload = () => {
      flushLatest();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      flushLatest();
    };
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
        className="h-[80vh] resize-y overflow-auto rounded-2xl border border-white/10 pr-3 pb-3"
        style={{ minHeight: 360 }}
      >
        <div className="h-full w-full">
          {!loaderReady ? (
            <div className="flex h-full items-center justify-center text-sm text-mist-300">Loading editor...</div>
          ) : (
          <Editor
            value={value}
            theme="vs-dark"
            language={language}
            path={modelPath}
            beforeMount={(monaco) => {
              monacoRef.current = monaco;
              const reactTypes = `
                declare namespace React {
                  type FC<P = any> = (props: P) => any;
                  const createElement: any;
                  const Fragment: any;
                }
                declare module "react" {
                  export = React;
                  export const Fragment: any;
                  export const useState: any;
                  export const useEffect: any;
                  export const useMemo: any;
                  export const useCallback: any;
                  export const useRef: any;
                  export const useReducer: any;
                  export const createContext: any;
                  export const useContext: any;
                }
                declare module "react/jsx-runtime" {
                  export const jsx: any;
                  export const jsxs: any;
                  export const Fragment: any;
                }
                declare module "react-dom/client" {
                  export const createRoot: any;
                }
              `;
              monaco.languages.typescript.typescriptDefaults.addExtraLib(
                reactTypes,
                'file:///types/react-shim.d.ts'
              );
              monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
                target: monaco.languages.typescript.ScriptTarget.ES2020,
                module: monaco.languages.typescript.ModuleKind.ESNext,
                moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
                noUnusedLocals: false,
                noUnusedParameters: false,
                allowNonTsExtensions: true,
                allowJs: true,
                isolatedModules: true
              });
              monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
                noSemanticValidation: true,
                noSuggestionDiagnostics: true
              });
              monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                target: monaco.languages.typescript.ScriptTarget.ES2020,
                module: monaco.languages.typescript.ModuleKind.ESNext,
                moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                allowNonTsExtensions: true,
                allowJs: true,
                checkJs: false
              });
              monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                noSemanticValidation: true,
                noSyntaxValidation: true
              });
            }}
          onChange={(val) => onChange(val ?? '')}
          onMount={(editor, monaco) => {
            editorRef.current = editor;
            hasMountedRef.current = true;
            editor.layout();

            const wheelBridge = (event: WheelEvent) => {
              const domNode = editor.getDomNode();
              if (!domNode || !domNode.contains(event.target as Node)) return;

              const scrollTop = editor.getScrollTop();
              const contentHeight = editor.getScrollHeight();
              const layout = editor.getLayoutInfo();
              const viewportHeight = layout.height;
              const maxTop = Math.max(0, contentHeight - viewportHeight);

              const atTop = scrollTop <= 0;
              const atBottom = scrollTop >= maxTop - 1;
              const wantsUp = event.deltaY < 0;
              const wantsDown = event.deltaY > 0;

              if ((atTop && wantsUp) || (atBottom && wantsDown)) {
                window.scrollBy({ top: event.deltaY, left: 0, behavior: 'auto' });
              }

              // Horizontal bridge for trackpads when editor is at left/right edges.
              const scrollLeft = editor.getScrollLeft();
              const maxLeft = Math.max(0, editor.getScrollWidth() - layout.width);
              const atLeft = scrollLeft <= 0;
              const atRight = scrollLeft >= maxLeft - 1;
              const wantsLeft = event.deltaX < 0;
              const wantsRight = event.deltaX > 0;
              if ((atLeft && wantsLeft) || (atRight && wantsRight)) {
                window.scrollBy({ top: 0, left: event.deltaX, behavior: 'auto' });
              }
            };

            window.addEventListener('wheel', wheelBridge, { passive: true, capture: true });
            const model = editor.getModel();
            if (model) {
              monaco.editor.setModelLanguage(model, language);
            }
            editor.onDidFocusEditorText(() => {
              editorFocusedRef.current = true;
            });
            editor.onDidBlurEditorText(() => {
              editorFocusedRef.current = false;
              const model = editor.getModel();
              if (model) {
                const nextValue = model.getValue();
                latestValueRef.current = nextValue;
                hasModelValueRef.current = true;
                if (lastEmittedRef.current !== nextValue) {
                  lastEmittedRef.current = nextValue;
                  onChangeRef.current(nextValue);
                }
              }
            });
            editor.onDidChangeModelContent(() => {
              const model = editor.getModel();
              if (model) {
                latestValueRef.current = model.getValue();
                hasModelValueRef.current = true;
              }
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

            editor.onDidDispose(() => {
              window.removeEventListener('wheel', wheelBridge, true);
            });
          }}
            options={{
              renderValidationDecorations: suppressDiagnostics ? 'off' : 'on',
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 16, bottom: 16 },
              wordWrap: 'on',
              fixedOverflowWidgets: true,
              // Let wheel events bubble so page scroll can continue when editor hits bounds.
              scrollbar: {
                alwaysConsumeMouseWheel: false
              },
              readOnly
            }}
            height="100%"
            width="100%"
          />
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
