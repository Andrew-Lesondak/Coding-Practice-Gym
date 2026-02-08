type QuizProgressHeaderProps = {
  current: number;
  total: number;
  streak: number;
  accuracy: number;
  timeLeftSeconds?: number;
};

const formatSeconds = (seconds?: number) => {
  if (seconds === undefined) return '';
  const clamped = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

const QuizProgressHeader = ({ current, total, streak, accuracy, timeLeftSeconds }: QuizProgressHeaderProps) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-ink-900/60 px-4 py-3 text-xs text-mist-200">
      <span>
        Question {current}/{total}
      </span>
      <span>Streak: {streak}</span>
      <span>Accuracy: {Math.round(accuracy * 100)}%</span>
      {timeLeftSeconds !== undefined && <span>Time: {formatSeconds(timeLeftSeconds)}</span>}
    </div>
  );
};

export default QuizProgressHeader;
