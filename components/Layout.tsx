import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Plus, Activity, Settings, List } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isForm =
    location.pathname.includes('/new') ||
    location.pathname.includes('/edit') ||
    location.pathname === '/log-injection' ||
    location.pathname === '/check-in';

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FB] dark:bg-stone-950 text-stone-900 dark:text-stone-100 overflow-hidden font-sans transition-colors duration-300">
      <main className="flex-1 overflow-y-auto no-scrollbar pb-28">
        <div className="max-w-md mx-auto min-h-full p-6 relative">{children}</div>
      </main>

      {!isForm && (
        <nav className="fixed bottom-6 left-0 right-0 z-50 safe-area-bottom px-6">
          <div className="max-w-[340px] mx-auto bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-white/50 dark:border-stone-800 h-16 px-6 flex justify-between items-center transition-colors">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `transition-colors duration-300 ${isActive ? 'text-stone-900 dark:text-white' : 'text-stone-300 dark:text-stone-600'}`
              }
            >
              {({ isActive }) => <Home size={24} strokeWidth={isActive ? 2.5 : 2} />}
            </NavLink>

            <NavLink
              to="/compounds"
              className={({ isActive }) =>
                `transition-colors duration-300 ${isActive ? 'text-stone-900 dark:text-white' : 'text-stone-300 dark:text-stone-600'}`
              }
            >
              {({ isActive }) => <List size={24} strokeWidth={isActive ? 2.5 : 2} />}
            </NavLink>

            {/* Floating Action Button */}
            <NavLink
              to="/log-injection"
              className="bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-stone-900/20 dark:shadow-stone-100/10 transform -translate-y-4 hover:-translate-y-5 transition-all duration-300 active:scale-95"
            >
              <Plus size={26} strokeWidth={2.5} />
            </NavLink>

            <NavLink
              to="/trends"
              className={({ isActive }) =>
                `transition-colors duration-300 ${isActive ? 'text-stone-900 dark:text-white' : 'text-stone-300 dark:text-stone-600'}`
              }
            >
              {({ isActive }) => <Activity size={24} strokeWidth={isActive ? 2.5 : 2} />}
            </NavLink>

            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `transition-colors duration-300 ${isActive ? 'text-stone-900 dark:text-white' : 'text-stone-300 dark:text-stone-600'}`
              }
            >
              {({ isActive }) => <Settings size={24} strokeWidth={isActive ? 2.5 : 2} />}
            </NavLink>
          </div>
        </nav>
      )}
    </div>
  );
};
