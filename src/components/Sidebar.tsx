import {
  CheckCircle2,
  Clock,
  LayoutDashboard,
  ListTodo,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import { NavSection } from '../types/task';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  counts: {
    all: number;
    pending: number;
    completed: number;
    overdue: number;
  };
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: Array<{
  id: NavSection;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'all', label: 'All Tasks', icon: ListTodo },
  { id: 'pending', label: 'Pending Tasks', icon: Clock },
  { id: 'completed', label: 'Completed Tasks', icon: CheckCircle2 },
];

export function Sidebar({
  activeSection,
  onSelectSection,
  counts,
  theme,
  onToggleTheme,
  isOpenMobile,
  onCloseMobile,
}: SidebarProps) {
  const getCountForSection = (section: NavSection): number | null => {
    switch (section) {
      case 'dashboard':
        return null;
      case 'all':
        return counts.all;
      case 'pending':
        return counts.pending;
      case 'completed':
        return counts.completed;
    }
  };

  const handleNavClick = (section: NavSection) => {
    onSelectSection(section);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 w-64 shrink-0">
      <div>
        <div className="flex items-center justify-between px-5 h-16 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white font-display font-bold text-sm">
              ST
            </div>
            <span className="font-display text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 whitespace-nowrap truncate">
              Smart Task Manager
            </span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Primary Navigation" className="px-3 py-5 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            const count = getCountForSection(item.id);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 min-h-[42px] rounded-lg text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isActive
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-neutral-400 dark:text-neutral-500'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="whitespace-nowrap truncate">{item.label}</span>
                </span>
                {count !== null && (
                  <span
                    className={`font-mono text-xs tabular-nums shrink-0 ${
                      isActive
                        ? 'text-neutral-900 dark:text-neutral-100 font-semibold'
                        : 'text-neutral-400 dark:text-neutral-500'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
        <div className="px-2 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <span>Completion Rate</span>
          <span className="font-mono tabular-nums font-medium text-neutral-900 dark:text-neutral-100">
            {counts.all === 0
              ? '0%'
              : `${Math.round((counts.completed / counts.all) * 100)}%`}
          </span>
        </div>
        <div
          className="mx-2 h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden"
          role="progressbar"
          aria-valuenow={
            counts.all === 0 ? 0 : Math.round((counts.completed / counts.all) * 100)
          }
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Task completion percentage"
        >
          <div
            className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
            style={{
              width: `${
                counts.all === 0 ? 0 : Math.round((counts.completed / counts.all) * 100)
              }%`,
            }}
          />
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-full flex items-center justify-between gap-2 px-3 py-2.5 min-h-[42px] rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <span className="flex items-center gap-2.5 whitespace-nowrap">
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-500 shrink-0" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4 text-neutral-500 shrink-0" aria-hidden="true" />
            )}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </span>
          <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500 uppercase">
            {theme}
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside className="hidden lg:block shrink-0">{sidebarContent}</aside>

      {/* Mobile slide-over drawer */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
        >
          <div
            className="fixed inset-0 bg-neutral-950/50 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 flex h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
