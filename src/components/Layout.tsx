import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { ReactNode } from 'react';

const navLink = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'rounded-full px-4 py-2 text-sm font-medium transition',
    isActive ? 'bg-ember-500 text-ink-950' : 'text-mist-200 hover:text-mist-50'
  );

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-ink-950 text-mist-50">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-ink-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="font-display text-xl font-semibold tracking-tight">Coding Practice Gym</p>
            <p className="text-xs uppercase tracking-[0.2em] text-mist-300">Guided completion</p>
          </div>
          <nav className="flex items-center gap-2">
            <NavLink className={navLink} to="/">
              Dashboard
            </NavLink>
            <NavLink className={navLink} to="/catalog">
              Problems
            </NavLink>
            <NavLink className={navLink} to="/dsa/drills">
              DSA Drills
            </NavLink>
            <NavLink className={navLink} to="/system-design">
              System Design
            </NavLink>
            <NavLink className={navLink} to="/system-design/drills">
              Drills
            </NavLink>
            <NavLink className={navLink} to="/system-design/mock">
              Mock Interview
            </NavLink>
            <NavLink className={navLink} to="/react">
              React Coding
            </NavLink>
            <NavLink className={navLink} to="/quizzes">
              Quizzes
            </NavLink>
            <NavLink className={navLink} to="/settings">
              Settings
            </NavLink>
            <NavLink className={navLink} to="/adaptive">
              Adaptive
            </NavLink>
            <NavLink className={navLink} to="/analytics">
              Analytics
            </NavLink>
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
