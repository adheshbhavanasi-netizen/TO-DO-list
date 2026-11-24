import { AlertTriangle, CheckCircle2, Clock, Layers } from 'lucide-react';
import { NavSection } from '../types/task';

interface StatsGridProps {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  onNavigate?: (section: NavSection) => void;
}

export function StatsGrid({
  total,
  completed,
  pending,
  overdue,
  onNavigate,
}: StatsGridProps) {
  const stats = [
    {
      label: 'Total Tasks',
      value: total,
      detail: 'All recorded items',
      icon: Layers,
      accentClass: 'text-neutral-600 dark:text-neutral-300',
      targetSection: 'all' as NavSection,
    },
    {
      label: 'Completed Tasks',
      value: completed,
      detail:
        total > 0
          ? `${Math.round((completed / total) * 100)}% of total`
          : 'No tasks yet',
      icon: CheckCircle2,
      accentClass: 'text-emerald-600 dark:text-emerald-400',
      targetSection: 'completed' as NavSection,
    },
    {
      label: 'Pending Tasks',
      value: pending,
      detail: 'Active in progress',
      icon: Clock,
      accentClass: 'text-blue-600 dark:text-blue-400',
      targetSection: 'pending' as NavSection,
    },
    {
      label: 'Overdue Tasks',
      value: overdue,
      detail: overdue > 0 ? 'Past scheduled due date' : 'All deadlines on track',
      icon: AlertTriangle,
      accentClass:
        overdue > 0
          ? 'text-red-600 dark:text-red-400'
          : 'text-neutral-500 dark:text-neutral-400',
      targetSection: 'pending' as NavSection,
    },
  ];

  return (
    <section aria-label="Task Summary Metrics">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const content = (
            <div className="flex flex-col justify-between gap-3 p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-left h-full transition-colors duration-150 group-hover:border-neutral-300 dark:group-hover:border-neutral-700">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  {stat.label}
                </span>
                <Icon className={`h-4 w-4 shrink-0 ${stat.accentClass}`} aria-hidden="true" />
              </div>

              <div>
                <p className="font-display text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 font-mono tabular-nums">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {stat.detail}
                </p>
              </div>
            </div>
          );

          if (onNavigate) {
            return (
              <button
                key={stat.label}
                type="button"
                onClick={() => onNavigate(stat.targetSection)}
                className="group block w-full text-left rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                {content}
              </button>
            );
          }

          return <div key={stat.label}>{content}</div>;
        })}
      </div>
    </section>
  );
}
