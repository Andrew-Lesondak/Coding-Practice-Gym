import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Dashboard from '../pages/Dashboard';
import Catalog from '../pages/Catalog';
import ProblemDetail from '../pages/ProblemDetail';
import Settings from '../pages/Settings';
import Author from '../pages/Author';
import SystemDesignDashboard from '../pages/SystemDesignDashboard';
import SystemDesignCatalog from '../pages/SystemDesignCatalog';
import SystemDesignDetail from '../pages/SystemDesignDetail';
import SystemDesignDrillsDashboard from '../pages/SystemDesignDrillsDashboard';
import SystemDesignDrillDetail from '../pages/SystemDesignDrillDetail';
import SystemDesignMockDashboard from '../pages/SystemDesignMockDashboard';
import SystemDesignMockSession from '../pages/SystemDesignMockSession';
import DSADrillsDashboard from '../pages/DSADrillsDashboard';
import DSADrillDetail from '../pages/DSADrillDetail';
import AnalyticsDashboard from '../pages/AnalyticsDashboard';
import AdaptiveDashboard from '../pages/AdaptiveDashboard';
import AdaptiveSession from '../pages/AdaptiveSession';
import QuizDashboard from '../pages/QuizDashboard';
import QuizCatalog from '../pages/QuizCatalog';
import QuizSession from '../pages/QuizSession';
import QuizReview from '../pages/QuizReview';
import ReactCodingDashboard from '../pages/ReactCodingDashboard';
import ReactCodingCatalog from '../pages/ReactCodingCatalog';
import ReactCodingDetail from '../pages/ReactCodingDetail';
import { validateProblemPack, ValidationIssue } from '../lib/devValidation';
import { useProblems } from '../lib/useProblems';

const App = () => {
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const problems = useProblems();

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    let active = true;
    validateProblemPack(problems).then((issues) => {
      if (active) setValidationIssues(issues);
    });
    return () => {
      active = false;
    };
  }, [problems]);

  return (
    <Layout>
      {validationIssues.length > 0 && (
        <div className="mb-6 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-200">
          <p className="font-semibold">Problem pack validation failed.</p>
          <ul className="mt-2 space-y-1">
            {validationIssues.map((issue) => (
              <li key={issue.problemId}>
                {issue.problemId}: {issue.message}
              </li>
            ))}
          </ul>
        </div>
      )}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/problem/:id" element={<ProblemDetail />} />
        <Route path="/system-design" element={<SystemDesignDashboard />} />
        <Route path="/system-design/catalog" element={<SystemDesignCatalog />} />
        <Route path="/system-design/:id" element={<SystemDesignDetail />} />
        <Route path="/system-design/drills" element={<SystemDesignDrillsDashboard />} />
        <Route path="/system-design/drills/:id" element={<SystemDesignDrillDetail />} />
        <Route path="/system-design/mock" element={<SystemDesignMockDashboard />} />
        <Route path="/system-design/mock/:sessionId" element={<SystemDesignMockSession />} />
        <Route path="/dsa/drills" element={<DSADrillsDashboard />} />
        <Route path="/dsa/drills/:id" element={<DSADrillDetail />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route path="/adaptive" element={<AdaptiveDashboard />} />
        <Route path="/adaptive/session/:sessionId" element={<AdaptiveSession />} />
        <Route path="/quizzes" element={<QuizDashboard />} />
        <Route path="/quizzes/catalog" element={<QuizCatalog />} />
        <Route path="/quizzes/session" element={<QuizSession />} />
        <Route path="/quizzes/review/:sessionId" element={<QuizReview />} />
        <Route path="/react" element={<ReactCodingDashboard />} />
        <Route path="/react/catalog" element={<ReactCodingCatalog />} />
        <Route path="/react/:id" element={<ReactCodingDetail />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/author" element={<Author />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
