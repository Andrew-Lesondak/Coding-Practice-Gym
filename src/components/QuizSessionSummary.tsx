import { QuizSession } from '../types/quiz';

type QuizSessionSummaryProps = {
  session: QuizSession;
  total: number;
  correct: number;
};

const QuizSessionSummary = ({ session, total, correct }: QuizSessionSummaryProps) => {
  const accuracy = total ? Math.round((correct / total) * 100) : 0;
  const durationSeconds =
    session.startedAt && session.finishedAt
      ? Math.max(0, (new Date(session.finishedAt).getTime() - new Date(session.startedAt).getTime()) / 1000)
      : null;

  return (
    <div className="glass rounded-2xl p-5 text-sm text-mist-200">
      <h2 className="font-display text-lg text-mist-100">Session summary</h2>
      <div className="mt-3 grid gap-2 text-xs text-mist-300">
        <div className="flex items-center justify-between">
          <span>Score</span>
          <span>
            {correct}/{total}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Accuracy</span>
          <span>{accuracy}%</span>
        </div>
        {durationSeconds !== null && (
          <div className="flex items-center justify-between">
            <span>Time</span>
            <span>{Math.round(durationSeconds)}s</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizSessionSummary;
