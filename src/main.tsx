import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App';
import ErrorBoundary from './components/ErrorBoundary';
import './styles.css';

if (!(globalThis as any).process) {
  (globalThis as any).process = {
    env: { NODE_ENV: import.meta.env.MODE ?? 'production' },
    versions: {}
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
