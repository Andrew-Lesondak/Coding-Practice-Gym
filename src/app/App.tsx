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
import ReactDebuggingDashboard from '../pages/ReactDebuggingDashboard';
import ReactDebuggingCatalog from '../pages/ReactDebuggingCatalog';
import ReactDebuggingDetail from '../pages/ReactDebuggingDetail';
import UnitTestingDashboard from '../pages/UnitTestingDashboard';
import UnitTestingCatalog from '../pages/UnitTestingCatalog';
import UnitTestingDetail from '../pages/UnitTestingDetail';
import { validateProblemPack, ValidationIssue } from '../lib/devValidation';
import { useProblems } from '../lib/useProblems';
import { initializeStorage, loadAllState, loadLegacyState } from '../storage';
import { useAppStore } from '../store/useAppStore';
import { normalizeOverlayPack } from '../lib/problemPack';

const App = () => {
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const problems = useProblems();
  const hydrate = useAppStore((state) => state.hydrateFromStorage);
  const storageStatus = useAppStore((state) => state.storageStatus);
  const setStorageStatus = useAppStore((state) => state.setStorageStatus);

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

  useEffect(() => {
    let active = true;
    const load = async () => {
      setStorageStatus('migrating');
      const status = await initializeStorage();
      if (!active) return;
      if (status === 'ready') {
        const state = await loadAllState();
        if (!active) return;
        hydrate({
          progress: state.progress ?? null,
          settings: state.settings ?? null,
          overlayPack: normalizeOverlayPack(state.overlayPack),
          drillAttempts: state.drillAttempts ?? [],
          mockSessions: state.mockSessions ?? [],
          quizSessions: state.quizSessions ?? [],
          adaptivePlans: state.adaptivePlans ?? [],
          adaptiveRuns: state.adaptiveRuns ?? []
        });
        setStorageStatus('ready');
        return;
      }
      if (status === 'unavailable') {
        const legacy = loadLegacyState();
        hydrate({
          progress: legacy.progress,
          settings: legacy.settings,
          overlayPack: normalizeOverlayPack(legacy.overlayPack),
          drillAttempts: legacy.drillAttempts ?? [],
          mockSessions: legacy.mockSessions ?? [],
          quizSessions: legacy.quizSessions ?? [],
          adaptivePlans: legacy.adaptivePlans ?? [],
          adaptiveRuns: legacy.adaptiveRuns ?? []
        });
        setStorageStatus('unavailable');
        return;
      }
      setStorageStatus('error', 'Storage initialization failed.');
    };
    void load();
    return () => {
      active = false;
    };
  }, [hydrate, setStorageStatus]);

  return (
    <Layout>
      {storageStatus === 'unavailable' && (
        <div className="mb-6 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-100">
          IndexedDB is unavailable. The app is running in read-only fallback mode using legacy data.
        </div>
      )}
      {storageStatus === 'error' && (
        <div className="mb-6 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-200">
          Storage initialization failed. Data may not persist correctly.
        </div>
      )}
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
        <Route path="/react-debugging" element={<ReactDebuggingDashboard />} />
        <Route path="/react-debugging/catalog" element={<ReactDebuggingCatalog />} />
        <Route path="/react-debugging/:id" element={<ReactDebuggingDetail />} />
        <Route path="/unit-testing" element={<UnitTestingDashboard />} />
        <Route path="/unit-testing/catalog" element={<UnitTestingCatalog />} />
        <Route path="/unit-testing/:id" element={<UnitTestingDetail />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/author" element={<Author />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
