import { CheckCircle2, ClipboardList, Plus, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  variant?: 'empty' | 'filtered' | 'completed-all';
  onAddTask?: () => void;
  onResetFilters?: () => void;
}

export function EmptyState({
  title,
  description,
  variant = 'empty',
  onAddTask,
  onResetFilters,
}: EmptyStateProps) {
  const Icon =
    variant === 'completed-all' ? CheckCircle2 : ClipboardList;

  return (
    <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-white/60 dark:bg-neutral-900/40 px-6 py-10 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="mt-3 font-display text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </h3>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
        {description}
      </p>
      <div className="mt-5 flex items-center justify-center gap-3">
        {variant === 'filtered' && onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Clear Filters</span>
          </button>
        )}
        {onAddTask && (
          <button
            type="button"
            onClick={onAddTask}
            className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-medium text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Add Task</span>
          </button>
        )}
      </div>
    </div>
  );
}
