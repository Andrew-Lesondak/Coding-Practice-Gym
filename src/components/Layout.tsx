import { NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useAppStore } from '../store/useAppStore';

const navLink = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'rounded-full px-4 py-2 text-sm font-medium transition',
    isActive ? 'bg-ember-500 text-ink-950' : 'text-mist-200 hover:text-mist-50'
  );

type NavItem = {
  to: string;
  label: string;
};

const SETTINGS_RETURN_KEY = 'coding-practice-gym-settings-return';

const Layout = ({ children }: { children: ReactNode }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);

  const navItems = useMemo<NavItem[]>(
    () => [
      { to: '/', label: 'Dashboard' },
      { to: '/catalog', label: 'Problems' },
      { to: '/dsa/drills', label: 'DSA Drills' },
      { to: '/system-design', label: 'System Design' },
      { to: '/system-design/drills', label: 'Drills' },
      { to: '/system-design/mock', label: 'Mock Interview' },
      { to: '/react', label: 'React Coding' },
      { to: '/react-debugging', label: 'React Debugging' },
      { to: '/unit-testing', label: 'Unit Testing' },
      { to: '/quizzes', label: 'Quizzes' },
      { to: '/settings', label: 'Settings' },
      { to: '/adaptive', label: 'Adaptive' },
      { to: '/analytics', label: 'Analytics' }
    ],
    []
  );

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const theme = settings.theme ?? 'dark';

  return (
    <div className="min-h-screen bg-ink-950 text-mist-50 transition-colors">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-ink-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="font-display text-xl font-semibold tracking-tight">Coding Practice Gym</p>
            <p className="text-xs uppercase tracking-[0.2em] text-mist-300">Guided completion</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateSettings({ theme: theme === 'dark' ? 'light' : 'dark' })}
              className="rounded-full border border-white/15 px-3 py-2 text-xs text-mist-200"
            >
              {theme === 'dark' ? 'Light' : 'Dark'} mode
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="header-fanout-nav"
              className="rounded-full bg-ember-500 px-4 py-2 text-xs font-semibold text-ink-950 shadow-glow"
            >
              Menu
            </button>
          </div>
        </div>
        <div
          id="header-fanout-nav"
          className={clsx(
            'mx-auto max-w-6xl overflow-hidden px-6 transition-all duration-200',
            menuOpen ? 'max-h-64 pb-4 opacity-100' : 'max-h-0 pb-0 opacity-0'
          )}
        >
          <nav className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-ink-900/85 p-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                className={navLink}
                to={item.to}
                onClick={() => {
                  if (item.to === '/settings' && location.pathname !== '/settings') {
                    sessionStorage.setItem(
                      SETTINGS_RETURN_KEY,
                      `${location.pathname}${location.search}${location.hash}`
                    );
                  }
                }}
              >
                {item.label}
              </NavLink>
            ))}
            {import.meta.env.DEV && (
              <NavLink className={navLink} to="/author">
                Author
              </NavLink>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-screen-2xl px-6 py-8">{children}</main>
    </div>
  );
};

export default Layout;
