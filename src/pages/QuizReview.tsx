import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getQuizSession, saveQuizSession } from '../lib/quizStorage';
import { useQuizQuestions } from '../lib/useQuizQuestions';
import QuizSessionSummary from '../components/QuizSessionSummary';
import { formatQuizAnswer, formatQuizCorrectAnswer, getQuizSelectionFeedback } from '../lib/quizFeedback';
import { QuizQuestion } from '../types/quiz';

const QuizReview = () => {
  const { sessionId } = useParams();
  const session = sessionId ? getQuizSession(sessionId) : null;
  const questions = useQuizQuestions();
  const [confidence, setConfidence] = useState(session?.confidence ?? 3);

  const sessionQuestions = useMemo(() => {
    if (!session) return [];
    return session.questionIds
      .map((id) => questions.find((q) => q.id === id))
      .filter(Boolean) as QuizQuestion[];
  }, [session, questions]);

  if (!session) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-mist-300">Session not found.</p>
        <Link className="text-sm text-ember-300" to="/quizzes">
          Back to quizzes
        </Link>
      </div>
    );
  }

  const total = sessionQuestions.length;
  const correct = Object.values(session.results).filter(Boolean).length;
  const missed = sessionQuestions.filter((q) => !session.results[q.id]);

  const saveConfidence = () => {
    const next = { ...session, confidence };
    saveQuizSession(next);
  };

  const bySubtopic = sessionQuestions.reduce<Record<string, { total: number; correct: number }>>((acc, question) => {
    const entry = acc[question.subtopic] ?? { total: 0, correct: 0 };
    entry.total += 1;
    if (session.results[question.id]) entry.correct += 1;
    acc[question.subtopic] = entry;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <QuizSessionSummary session={session} total={total} correct={correct} />

      <section className="glass rounded-2xl p-5">
        <h2 className="font-display text-lg">Topic breakdown</h2>
        <div className="mt-3 grid gap-2 text-xs text-mist-200">
          {Object.entries(bySubtopic).map(([subtopic, stats]) => (
            <div key={subtopic} className="flex items-center justify-between rounded-xl border border-white/10 p-3">
              <span>{subtopic}</span>
              <span>{Math.round((stats.correct / stats.total) * 100)}%</span>
            </div>
          ))}
        </div>
      </section>

      <section className="glass rounded-2xl p-5">
        <h2 className="font-display text-lg">Confidence</h2>
        <p className="mt-2 text-sm text-mist-200">How confident did you feel?</p>
        <input
          type="range"
          min={1}
          max={5}
          value={confidence}
          onChange={(e) => setConfidence(Number(e.target.value))}
          className="mt-3 w-full"
        />
        <button
          className="mt-3 rounded-full bg-ember-500 px-4 py-2 text-xs font-semibold text-ink-950"
          onClick={saveConfidence}
        >
          Save confidence
        </button>
      </section>

      <section className="glass rounded-2xl p-5">
        <h2 className="font-display text-lg">Missed questions</h2>
        {missed.length === 0 ? (
          <p className="mt-2 text-sm text-mist-300">Perfect score. Nice!</p>
        ) : (
          <div className="mt-4 space-y-4 text-sm text-mist-200">
            {missed.map((question) => (
              <div key={question.id} className="rounded-xl border border-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-mist-400">{question.subtopic}</p>
                <p className="mt-2 text-mist-100">{question.promptMarkdown}</p>
                <p className="mt-2 text-xs text-mist-300">
                  Your answer: {formatQuizAnswer(question, session.answers[question.id])}
                </p>
                <p className="text-xs text-mist-300">
                  Correct: {formatQuizCorrectAnswer(question)}
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-mist-200">
                  {getQuizSelectionFeedback(question, session.answers[question.id]).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-mist-200">{question.explanationMarkdown}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <Link className="text-sm text-ember-300" to="/quizzes">
        Back to quizzes
      </Link>
    </div>
  );
};

export default QuizReview;
