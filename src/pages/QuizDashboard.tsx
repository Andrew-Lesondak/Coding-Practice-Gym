import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizQuestions } from '../lib/useQuizQuestions';
import { useAppStore } from '../store/useAppStore';
import { selectQuizQuestions } from '../lib/quizEngine';
import { saveQuizSession } from '../lib/quizStorage';
import { QuizQuestion } from '../types/quiz';

const QuizDashboard = () => {
  const navigate = useNavigate();
  const questions = useQuizQuestions();
  const progress = useAppStore((state) => state.progress.quizzes);
  const quizSessions = useAppStore((state) => state.quizSessions);
  const [count, setCount] = useState(10);
  const [topics, setTopics] = useState<QuizQuestion['topic'][]>(['javascript', 'react']);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');
  const [mode, setMode] = useState<'immediate' | 'exam'>('immediate');
  const [timed, setTimed] = useState(false);

  const dueQuestions = useMemo(() => {
    const now = Date.now();
    return questions.filter((q) => {
      const p = progress[q.id];
      if (!p?.nextReviewAt) return false;
      return new Date(p.nextReviewAt).getTime() <= now;
    });
  }, [questions, progress]);

  const weakAreas = useMemo(() => {
    const stats: Record<string, { attempts: number; correct: number }> = {};
    questions.forEach((q) => {
      const p = progress[q.id];
      if (!p || p.attempts === 0) return;
      const entry = stats[q.subtopic] ?? { attempts: 0, correct: 0 };
      entry.attempts += p.attempts;
      entry.correct += p.correctCount;
      stats[q.subtopic] = entry;
    });
    return Object.entries(stats)
      .map(([subtopic, value]) => ({
        subtopic,
        accuracy: value.correct / value.attempts
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);
  }, [questions, progress]);

  const recentSessions = useMemo(() => quizSessions.slice(0, 5), [quizSessions]);

  const startSession = () => {
    const selected = selectQuizQuestions(questions, progress, {
      count,
      topics,
      difficulty
    });
    const sessionId = crypto.randomUUID();
    const session = {
      id: sessionId,
      questionIds: selected.map((q) => q.id),
      settings: {
        count,
        topics,
        difficulty,
        mode,
        timed,
        secondsPerQuestion: 30
      },
      startedAt: new Date().toISOString(),
      answers: {},
      results: {},
      timePerQuestionSeconds: {}
    };
    saveQuizSession(session);
    navigate(`/quizzes/session?id=${sessionId}`);
  };

  const toggleTopic = (topic: QuizQuestion['topic']) => {
    setTopics((prev) => (prev.includes(topic) ? prev.filter((item) => item !== topic) : [...prev, topic]));
  };

  return (
    <div className="space-y-8">
      <section className="glass rounded-2xl p-6">
        <h1 className="font-display text-2xl font-semibold">JS/React Quizzes</h1>
        <p className="mt-2 text-sm text-mist-200">Rapid-fire questions with immediate feedback.</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            className="rounded-full bg-ember-500 px-5 py-2 text-sm font-semibold text-ink-950"
            onClick={startSession}
          >
            Start rapid-fire
          </button>
          <button
            className="rounded-full border border-white/15 px-4 py-2 text-xs text-mist-200"
            onClick={() => navigate('/quizzes/catalog')}
          >
            Browse question bank
          </button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass rounded-2xl p-6">
          <h2 className="font-display text-lg">Session settings</h2>
          <div className="mt-4 grid gap-4 text-sm text-mist-200">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-mist-300">Questions</label>
              <div className="mt-2 flex gap-2">
                {[10, 20, 30].map((value) => (
                  <button
                    key={value}
                    className={`rounded-full border px-4 py-1 text-xs ${count === value ? 'border-emerald-400/60 text-emerald-200' : 'border-white/15 text-mist-200'}`}
                    onClick={() => setCount(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-mist-300">Topics</label>
              <div className="mt-2 flex gap-2">
                {(['javascript', 'react'] as QuizQuestion['topic'][]).map((topic) => (
                  <button
                    key={topic}
                    className={`rounded-full border px-4 py-1 text-xs ${topics.includes(topic) ? 'border-emerald-400/60 text-emerald-200' : 'border-white/15 text-mist-200'}`}
                    onClick={() => toggleTopic(topic)}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-mist-300">Difficulty</label>
              <div className="mt-2 flex gap-2">
                {(['easy', 'medium', 'hard', 'mixed'] as const).map((value) => (
                  <button
                    key={value}
                    className={`rounded-full border px-4 py-1 text-xs ${difficulty === value ? 'border-emerald-400/60 text-emerald-200' : 'border-white/15 text-mist-200'}`}
                    onClick={() => setDifficulty(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-mist-300">Mode</label>
              <div className="mt-2 flex gap-2">
                {(['immediate', 'exam'] as const).map((value) => (
                  <button
                    key={value}
                    className={`rounded-full border px-4 py-1 text-xs ${mode === value ? 'border-emerald-400/60 text-emerald-200' : 'border-white/15 text-mist-200'}`}
                    onClick={() => setMode(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs text-mist-200">
              <input type="checkbox" checked={timed} onChange={(e) => setTimed(e.target.checked)} />
              30s per question
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl p-6">
            <h2 className="font-display text-lg">Due for review</h2>
            <p className="mt-2 text-sm text-mist-200">{dueQuestions.length} question(s) due.</p>
          </div>
          <div className="glass rounded-2xl p-6">
            <h2 className="font-display text-lg">Weak areas</h2>
            {weakAreas.length === 0 ? (
              <p className="mt-2 text-sm text-mist-300">Not enough data yet.</p>
            ) : (
              <ul className="mt-2 space-y-2 text-sm text-mist-200">
                {weakAreas.map((area) => (
                  <li key={area.subtopic}>
                    {area.subtopic} — {Math.round(area.accuracy * 100)}% accuracy
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="glass rounded-2xl p-6">
            <h2 className="font-display text-lg">Recent sessions</h2>
            {recentSessions.length === 0 ? (
              <p className="mt-2 text-sm text-mist-300">No sessions yet.</p>
            ) : (
              <ul className="mt-2 space-y-2 text-sm text-mist-200">
                {recentSessions.map((session) => (
                  <li key={session.id}>
                    {session.settings.count} questions • {new Date(session.startedAt).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default QuizDashboard;
