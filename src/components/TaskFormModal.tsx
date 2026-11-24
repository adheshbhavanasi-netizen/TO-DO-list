import { FormEvent, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Priority, Task, TaskFormData, TaskStatus } from '../types/task';
import { getTodayDateString } from '../utils/taskStorage';

interface TaskFormModalProps {
  isOpen: boolean;
  editingTask: Task | null;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
  onValidationError: (message: string) => void;
}

interface FormErrors {
  title?: string;
  dueDate?: string;
}

export function TaskFormModal({
  isOpen,
  editingTask,
  onClose,
  onSubmit,
  onValidationError,
}: TaskFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!isOpen) return;
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setDueDate(editingTask.dueDate);
      setPriority(editingTask.priority);
      setStatus(editingTask.status);
    } else {
      setTitle('');
      setDescription('');
      setDueDate(getTodayDateString());
      setPriority('medium');
      setStatus('pending');
    }
    setErrors({});
  }, [isOpen, editingTask]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isEditing = editingTask !== null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const nextErrors: FormErrors = {};

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      nextErrors.title = 'Task title is required.';
    } else if (trimmedTitle.length < 2) {
      nextErrors.title = 'Task title must be at least 2 characters.';
    }

    if (!dueDate) {
      nextErrors.dueDate = 'Please select a due date.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      onValidationError('Please fill in all required fields before saving.');
      return;
    }

    onSubmit({
      title: trimmedTitle,
      description: description.trim(),
      dueDate,
      priority,
      status,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
    >
      <div
        className="fixed inset-0 bg-neutral-950/55 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2
            id="task-modal-title"
            className="font-display text-lg font-semibold text-neutral-900 dark:text-neutral-100"
          >
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">
          {/* Task Title */}
          <div>
            <label
              htmlFor="task-title"
              className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1.5"
            >
              Task Title <span className="text-red-600 dark:text-red-400">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="e.g., Prepare quarterly budget review"
              autoFocus
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'task-title-error' : undefined}
              className={`w-full h-10 px-3.5 rounded-lg border bg-neutral-50 dark:bg-neutral-950 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                errors.title
                  ? 'border-red-500 focus:ring-red-600'
                  : 'border-neutral-200 dark:border-neutral-800 focus:ring-blue-600'
              }`}
            />
            {errors.title && (
              <p
                id="task-title-error"
                role="alert"
                className="mt-1.5 text-xs text-red-600 dark:text-red-400"
              >
                {errors.title}
              </p>
            )}
          </div>

          {/* Task Description */}
          <div>
            <label
              htmlFor="task-description"
              className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1.5"
            >
              Description
            </label>
            <textarea
              id="task-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add context, links, or deliverables for this task..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors resize-y"
            />
          </div>

          {/* Due Date & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="task-due-date"
                className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1.5"
              >
                Due Date <span className="text-red-600 dark:text-red-400">*</span>
              </label>
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (errors.dueDate)
                    setErrors((prev) => ({ ...prev, dueDate: undefined }));
                }}
                aria-invalid={Boolean(errors.dueDate)}
                aria-describedby={errors.dueDate ? 'task-date-error' : undefined}
                className={`w-full h-10 px-3 rounded-lg border bg-neutral-50 dark:bg-neutral-950 text-sm font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                  errors.dueDate
                    ? 'border-red-500 focus:ring-red-600'
                    : 'border-neutral-200 dark:border-neutral-800 focus:ring-blue-600'
                }`}
              />
              {errors.dueDate && (
                <p
                  id="task-date-error"
                  role="alert"
                  className="mt-1.5 text-xs text-red-600 dark:text-red-400"
                >
                  {errors.dueDate}
                </p>
              )}
            </div>

            <div>
              <span className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1.5">
                Priority
              </span>
              <div
                className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 h-10"
                role="group"
                aria-label="Select task priority"
              >
                {(['low', 'medium', 'high'] as Priority[]).map((level) => {
                  const isSelected = priority === level;
                  const label = level.charAt(0).toUpperCase() + level.slice(1);
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setPriority(level)}
                      aria-pressed={isSelected}
                      className={`rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                        isSelected
                          ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 shadow-xs'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Status selector when editing */}
          {isEditing && (
            <div>
              <span className="block text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1.5">
                Task Status
              </span>
              <div
                className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 h-10"
                role="group"
                aria-label="Select task status"
              >
                {(['pending', 'completed'] as TaskStatus[]).map((itemStatus) => {
                  const isSelected = status === itemStatus;
                  const label = itemStatus === 'pending' ? 'Pending' : 'Completed';
                  return (
                    <button
                      key={itemStatus}
                      type="button"
                      onClick={() => setStatus(itemStatus)}
                      aria-pressed={isSelected}
                      className={`rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                        isSelected
                          ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 shadow-xs'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 min-h-[40px] rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 min-h-[40px] rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-sm font-medium text-white transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900"
            >
              {isEditing ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
