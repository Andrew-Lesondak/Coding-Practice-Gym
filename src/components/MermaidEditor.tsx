import { useEffect, useId, useRef, useMemo } from 'react';
import mermaid from 'mermaid';

const MermaidEditor = ({
  value,
  onChange,
  onInsertSkeleton
}: {
  value: string;
  onChange: (value: string) => void;
  onInsertSkeleton: () => void;
}) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const safeId = useMemo(() => id.replace(/[^a-z0-9_-]/gi, ''), [id]);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'dark' });
  }, []);

  useEffect(() => {
    const render = async () => {
      if (!previewRef.current) return;
      if (!value.trim()) {
        previewRef.current.innerHTML = '<p class="text-xs text-mist-300">No diagram yet.</p>';
        return;
      }
      try {
        const { svg } = await mermaid.render(`mermaid-${safeId}`, value);
        previewRef.current.innerHTML = svg;
      } catch (error) {
        previewRef.current.innerHTML = `<p class="text-xs text-rose-300">Diagram error: ${String(
          (error as Error).message ?? error
        )}</p>`;
      }
    };
    render();
  }, [value, safeId]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-mist-300">Mermaid diagram</p>
        <button
          className="rounded-full border border-white/15 px-3 py-1 text-xs text-mist-200"
          onClick={onInsertSkeleton}
        >
          Insert diagram skeleton
        </button>
      </div>
      <textarea
        className="h-36 w-full rounded-xl border border-white/10 bg-transparent p-2 text-xs font-mono"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="flowchart LR\n  A[Client] --> B[API Gateway]"
      />
      <div className="rounded-xl border border-white/10 bg-ink-900 p-3">
        <div ref={previewRef} className="text-xs text-mist-200" />
      </div>
    </div>
  );
};

export default MermaidEditor;
