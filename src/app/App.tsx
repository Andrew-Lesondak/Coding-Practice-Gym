import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Dashboard from '../pages/Dashboard';
import Catalog from '../pages/Catalog';
import ProblemDetail from '../pages/ProblemDetail';
import Settings from '../pages/Settings';
import Author from '../pages/Author';
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
        <Route path="/settings" element={<Settings />} />
        <Route path="/author" element={<Author />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
