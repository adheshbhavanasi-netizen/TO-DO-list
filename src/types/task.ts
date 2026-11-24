export type Priority = 'low' | 'medium' | 'high';

export type TaskStatus = 'pending' | 'completed';

export type NavSection = 'dashboard' | 'all' | 'pending' | 'completed';

export type StatusFilter = 'all' | 'pending' | 'completed';

export type PriorityFilter = 'all' | Priority;

export type SortOrder = 'due-asc' | 'due-desc';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  priority: Priority;
  status: TaskStatus;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface TaskFormData {
  title: string;
  description: string;
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}
