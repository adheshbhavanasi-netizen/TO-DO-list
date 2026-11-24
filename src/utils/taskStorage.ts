import { Task } from '../types/task';

export const TASKS_STORAGE_KEY = 'smart_task_manager_tasks_v1';
export const THEME_STORAGE_KEY = 'smart_task_manager_theme';

export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDateString(): string {
  return toLocalDateString(new Date());
}

function getRelativeDateString(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return toLocalDateString(d);
}

function getRelativeIsoTimestamp(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString();
}

export function isTaskOverdue(task: Task, todayStr = getTodayDateString()): boolean {
  if (task.status === 'completed' || !task.dueDate) {
    return false;
  }
  return task.dueDate < todayStr;
}

export function isDueToday(dueDate: string, todayStr = getTodayDateString()): boolean {
  return dueDate === todayStr;
}

export function formatDueDate(dateStr: string): string {
  if (!dateStr) return 'No due date';
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return dateStr;
  }
  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatCreatedDate(isoStr: string): string {
  const date = new Date(isoStr);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function createSampleTasks(): Task[] {
  return [
    {
      id: 'task-sample-1',
      title: 'Finalize Q4 product roadmap presentation',
      description:
        'Consolidate engineering milestone estimates, design review feedback, and customer retention targets for the leadership sync.',
      dueDate: getRelativeDateString(-2),
      priority: 'high',
      status: 'pending',
      createdAt: getRelativeIsoTimestamp(-7),
      updatedAt: getRelativeIsoTimestamp(-3),
    },
    {
      id: 'task-sample-2',
      title: 'Audit accessibility contrast across checkout flow',
      description:
        'Verify WCAG AA text contrast ratios in both light and dark themes and ensure keyboard focus rings are visible on all form controls.',
      dueDate: getRelativeDateString(0),
      priority: 'high',
      status: 'pending',
      createdAt: getRelativeIsoTimestamp(-4),
      updatedAt: getRelativeIsoTimestamp(-1),
    },
    {
      id: 'task-sample-3',
      title: 'Schedule vendor security questionnaire review',
      description:
        'Coordinate a 30-minute walkthrough with InfoSec to sign off on SOC 2 documentation before renewal.',
      dueDate: getRelativeDateString(2),
      priority: 'medium',
      status: 'pending',
      createdAt: getRelativeIsoTimestamp(-3),
      updatedAt: getRelativeIsoTimestamp(-2),
    },
    {
      id: 'task-sample-4',
      title: 'Organize team sprint retrospective notes',
      description:
        'Group action items from the last two sprints by owner and link follow-up tickets.',
      dueDate: getRelativeDateString(5),
      priority: 'low',
      status: 'pending',
      createdAt: getRelativeIsoTimestamp(-2),
      updatedAt: getRelativeIsoTimestamp(-2),
    },
    {
      id: 'task-sample-5',
      title: 'Publish API migration guide for v2 endpoints',
      description:
        'Document breaking schema changes, deprecation timelines, and sample cURL requests for external integration partners.',
      dueDate: getRelativeDateString(-1),
      priority: 'high',
      status: 'completed',
      createdAt: getRelativeIsoTimestamp(-8),
      updatedAt: getRelativeIsoTimestamp(-1),
    },
    {
      id: 'task-sample-6',
      title: 'Configure automated weekly backup verification',
      description:
        'Set up Sunday staging restore drill and confirm alert routing to the operations channel.',
      dueDate: getRelativeDateString(1),
      priority: 'medium',
      status: 'completed',
      createdAt: getRelativeIsoTimestamp(-5),
      updatedAt: getRelativeIsoTimestamp(0),
    },
  ];
}

export function loadTasksFromStorage(): { tasks: Task[]; error: string | null } {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (raw === null) {
      const initial = createSampleTasks();
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(initial));
      return { tasks: initial, error: null };
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error('Stored tasks format is invalid.');
    }
    return { tasks: parsed as Task[], error: null };
  } catch {
    const fallback = createSampleTasks();
    return {
      tasks: fallback,
      error: 'Could not read saved tasks from localStorage. Loaded sample tasks instead.',
    };
  }
}

export function saveTasksToStorage(tasks: Task[]): boolean {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch {
    return false;
  }
}

export function generateTaskId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `task-${crypto.randomUUID()}`;
  }
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
