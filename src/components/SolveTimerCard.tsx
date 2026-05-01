import { useEffect, useMemo, useRef, useState } from 'react';

type TimerStatus = 'idle' | 'running' | 'paused' | 'stopped' | 'completed';

type Props = {
  defaultMinutes?: number;
  title?: string;
  subtitle?: string;
};

const clampSeconds = (value: number) => Math.max(0, Math.min(value, 59));

const SolveTimerCard = ({
  defaultMinutes = 20,
  title = 'Timer',
  subtitle = 'Manual timer for focused runs.'
}: Props) => {
  const [timerDurationSec, setTimerDurationSec] = useState(defaultMinutes * 60);
  const [timerRemainingSec, setTimerRemainingSec] = useState(defaultMinutes * 60);
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('idle');
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerStatus !== 'running') {
      if (timerIntervalRef.current) {
        window.clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    timerIntervalRef.current = window.setInterval(() => {
      setTimerRemainingSec((prev) => {
        if (prev <= 1) {
          setTimerStatus('completed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        window.clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [timerStatus]);

  useEffect(() => {
    if (timerStatus !== 'idle') return;
    setTimerRemainingSec(timerDurationSec);
  }, [timerDurationSec, timerStatus]);

  const durationMinutes = Math.floor(timerDurationSec / 60);
  const durationSeconds = timerDurationSec % 60;
  const formatTime = (value: number) => {
    const minutes = Math.floor(value / 60);
    const seconds = value % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const statusStyles: Record<TimerStatus, { label: string; pill: string; dot: string }> = {
    idle: {
      label: 'Idle',
      pill: 'border-white/20 text-mist-200 bg-white/5',
      dot: 'bg-mist-300'
    },
    running: {
      label: 'Running',
      pill: 'border-emerald-400/40 text-emerald-200 bg-emerald-400/10',
      dot: 'bg-emerald-400'
    },
    paused: {
      label: 'Paused',
      pill: 'border-amber-400/40 text-amber-200 bg-amber-400/10',
      dot: 'bg-amber-400'
    },
    stopped: {
      label: 'Stopped',
      pill: 'border-slate-400/40 text-slate-200 bg-slate-400/10',
      dot: 'bg-slate-300'
    },
    completed: {
      label: 'Complete',
      pill: 'border-rose-400/40 text-rose-200 bg-rose-400/10',
      dot: 'bg-rose-400'
    }
  };

  const statusStyle = statusStyles[timerStatus];
  const progressRatio = timerDurationSec > 0 ? timerRemainingSec / timerDurationSec : 0;
  const canStart = timerStatus !== 'running';
  const canPause = timerStatus === 'running';
  const canStop = timerStatus === 'running' || timerStatus === 'paused';
  const canReset = timerStatus !== 'idle' || timerRemainingSec !== timerDurationSec;

  const handleTimerStart = () => {
    setTimerRemainingSec((prev) => (prev <= 0 ? timerDurationSec : prev));
    setTimerStatus('running');
  };

  const actions = useMemo(
    () => ({
      pause: () => setTimerStatus('paused'),
      stop: () => {
        setTimerStatus('stopped');
        setTimerRemainingSec(timerDurationSec);
      },
      reset: () => {
        setTimerRemainingSec(timerDurationSec);
        setTimerStatus('idle');
      }
    }),
    [timerDurationSec]
  );

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-mist-300">{title}</p>
          <p className="text-sm text-mist-200">{subtitle}</p>
        </div>
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${statusStyle.pill}`}>
          <span className={`h-2 w-2 rounded-full ${statusStyle.dot}`} />
          {statusStyle.label}
        </span>
      </div>
      <div className="mt-4 grid gap-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-xs text-mist-300">
              Minutes
              <input
                type="number"
                min={0}
                max={180}
                disabled={timerStatus === 'running'}
                className="mt-2 w-24 rounded-xl border border-white/10 bg-transparent p-2 text-sm text-mist-100"
                value={durationMinutes}
                onChange={(event) => {
                  const nextMinutes = Math.max(0, Number(event.target.value) || 0);
                  setTimerDurationSec(nextMinutes * 60 + durationSeconds);
                }}
              />
            </label>
            <label className="text-xs text-mist-300">
              Seconds
              <input
                type="number"
                min={0}
                max={59}
                disabled={timerStatus === 'running'}
                className="mt-2 w-24 rounded-xl border border-white/10 bg-transparent p-2 text-sm text-mist-100"
                value={durationSeconds}
                onChange={(event) => {
                  const nextSeconds = clampSeconds(Number(event.target.value) || 0);
                  setTimerDurationSec(durationMinutes * 60 + nextSeconds);
                }}
              />
            </label>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <div className="flex items-center justify-between text-xs text-mist-300">
              <span>Remaining</span>
              <span>{formatTime(timerRemainingSec)}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-emerald-400 transition-all" style={{ width: `${Math.max(0, Math.min(1, progressRatio)) * 100}%` }} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-ink-950 disabled:opacity-50" onClick={handleTimerStart} disabled={!canStart}>Start</button>
          <button className="rounded-full border border-amber-400/40 px-4 py-2 text-xs text-amber-200 disabled:opacity-50" onClick={actions.pause} disabled={!canPause}>Pause</button>
          <button className="rounded-full border border-white/20 px-4 py-2 text-xs text-mist-200 disabled:opacity-50" onClick={actions.stop} disabled={!canStop}>Stop</button>
          <button className="rounded-full border border-rose-400/40 px-4 py-2 text-xs text-rose-200 disabled:opacity-50" onClick={actions.reset} disabled={!canReset}>Reset</button>
        </div>
      </div>
    </div>
  );
};

export default SolveTimerCard;
