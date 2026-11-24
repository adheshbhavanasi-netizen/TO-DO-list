import {
  AlertTriangle,
  Calendar,
  Check,
  Clock,
  Flag,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Priority, Task } from '../types/task';
import {
  formatCreatedDate,
  formatDueDate,
  isDueToday,
  isTaskOverdue,
} from '../utils/taskStorage';

interface TaskCardProps {
  task: Task;
  onToggleStatus: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDeleteRequest: (task: Task) => void;
}

const PRIORITY_STYLES: Record<
  Priority,
  { label: string; textClass: string }
> = {
  high: {
    label: 'High priority',
    textClass: 'text-red-600 dark:text-red-400 font-medium',
  },
  medium: {
    label: 'Medium priority',
    textClass: 'text-amber-700 dark:text-amber-400 font-medium',
  },
  low: {
    label: 'Low priority',
    textClass: 'text-neutral-600 dark:text-neutral-400',
  },
};

export function TaskCard({
  task,
  onToggleStatus,
  onEdit,
  onDeleteRequest,
}: TaskCardProps) {
  const isCompleted = task.status === 'completed';
  const overdue = isTaskOverdue(task);
  const dueToday = !isCompleted && isDueToday(task.dueDate);
  const priorityInfo = PRIORITY_STYLES[task.priority];

  return (
    <article
      className={`group rounded-xl border transition-colors duration-150 p-4 sm:p-5 ${
        isCompleted
          ? 'bg-neutral-50/70 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800/80'
          : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Completion toggle */}
        <button
          type="button"
          onClick={() => onToggleStatus(task.id)}
          aria-label={
            isCompleted
              ? `Mark "${task.title}" as pending`
              : `Mark "${task.title}" as completed`
          }
          aria-pressed={isCompleted}
          className="flex h-10 w-10 -ml-2 -mt-1.5 shrink-0 items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors duration-150 ${
              isCompleted
                ? 'bg-emerald-600 border-emerald-600 text-white dark:bg-emerald-500 dark:border-emerald-500'
                : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-950 group-hover:border-blue-600 dark:group-hover:border-blue-400'
            }`}
          >
            {isCompleted && <Check className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" />}
          </span>
        </button>

        {/* Main task body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h3
              className={`font-display text-base font-semibold leading-snug break-words ${
                isCompleted
                  ? 'line-through text-neutral-500 dark:text-neutral-500'
                  : 'text-neutral-900 dark:text-neutral-100'
              }`}
            >
              {task.title}
            </h3>

            {/* Card action controls */}
            <div className="flex items-center gap-1 shrink-0 -mt-1 -mr-1">
              <button
                type="button"
                onClick={() => onEdit(task)}
                aria-label={`Edit "${task.title}"`}
                title="Edit task"
                className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onDeleteRequest(task)}
                aria-label={`Delete "${task.title}"`}
                title="Delete task"
                className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {task.description && (
            <p
              className={`mt-1.5 text-sm leading-relaxed break-words ${
                isCompleted
                  ? 'text-neutral-400 dark:text-neutral-500'
                  : 'text-neutral-600 dark:text-neutral-300'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Unboxed clean metadata row with typographic separators */}
          <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            <span className={`inline-flex items-center gap-1 ${priorityInfo.textClass}`}>
              <Flag className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{priorityInfo.label}</span>
            </span>

            <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">
              ·
            </span>

            {overdue ? (
              <span className="inline-flex items-center gap-1 font-medium text-red-600 dark:text-red-400 font-mono tabular-nums">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Overdue · Due {formatDueDate(task.dueDate)}</span>
              </span>
            ) : dueToday ? (
              <span className="inline-flex items-center gap-1 font-medium text-amber-700 dark:text-amber-400 font-mono tabular-nums">
                <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Due Today ({formatDueDate(task.dueDate)})</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Due {formatDueDate(task.dueDate)}</span>
              </span>
            )}

            <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">
              ·
            </span>

            <span
              className={`inline-flex items-center gap-1 ${
                isCompleted
                  ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <span>{isCompleted ? 'Completed' : 'Pending'}</span>
            </span>

            <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">
              ·
            </span>

            <span className="font-mono tabular-nums">
              Created {formatCreatedDate(task.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
