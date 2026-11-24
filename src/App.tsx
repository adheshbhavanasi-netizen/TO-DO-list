import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { EmptyState } from './components/EmptyState';
import { FilterToolbar } from './components/FilterToolbar';
import { Sidebar } from './components/Sidebar';
import { StatsGrid } from './components/StatsGrid';
import { TaskCard } from './components/TaskCard';
import { TaskFormModal } from './components/TaskFormModal';
import { ToastContainer } from './components/ToastContainer';
import { TopBar } from './components/TopBar';
import {
  NavSection,
  PriorityFilter,
  SortOrder,
  StatusFilter,
  Task,
  TaskFormData,
  ToastMessage,
} from './types/task';
import {
  THEME_STORAGE_KEY,
  generateTaskId,
  getTodayDateString,
  isTaskOverdue,
  loadTasksFromStorage,
  saveTasksToStorage,
} from './utils/taskStorage';

export default function App() {
  const [initialLoad] = useState(() => loadTasksFromStorage());
  const [tasks, setTasks] = useState<Task[]>(initialLoad.tasks);

  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('due-asc');

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light';
  });

  const addToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Show storage error on mount if localStorage data was corrupted
  useEffect(() => {
    if (initialLoad.error) {
      addToast('error', initialLoad.error);
    }
  }, [initialLoad.error, addToast]);

  // Persist tasks to localStorage whenever tasks state changes
  useEffect(() => {
    const saved = saveTasksToStorage(tasks);
    if (!saved) {
      addToast('error', 'Failed to save changes to localStorage.');
    }
  }, [tasks, addToast]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', next === 'dark');
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Ignore storage errors for theme preference
      }
      return next;
    });
  }, []);

  const todayStr = getTodayDateString();

  const counts = useMemo(() => {
    let completed = 0;
    let pending = 0;
    let overdue = 0;
    for (const task of tasks) {
      if (task.status === 'completed') {
        completed += 1;
      } else {
        pending += 1;
        if (isTaskOverdue(task, todayStr)) {
          overdue += 1;
        }
      }
    }
    return {
      all: tasks.length,
      completed,
      pending,
      overdue,
    };
  }, [tasks, todayStr]);

  const sortTasksByDueDate = useCallback(
    (list: Task[]) => {
      return [...list].sort((a, b) => {
        const cmp = a.dueDate.localeCompare(b.dueDate);
        if (cmp !== 0) {
          return sortOrder === 'due-asc' ? cmp : -cmp;
        }
        return b.createdAt.localeCompare(a.createdAt);
      });
    },
    [sortOrder]
  );

  const filteredTasks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const matching = tasks.filter((task) => {
      if (normalizedQuery && !task.title.toLowerCase().includes(normalizedQuery)) {
        return false;
      }
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }

      if (activeSection === 'pending' && task.status !== 'pending') {
        return false;
      }
      if (activeSection === 'completed' && task.status !== 'completed') {
        return false;
      }
      if (activeSection === 'all' && statusFilter !== 'all' && task.status !== statusFilter) {
        return false;
      }

      return true;
    });

    return sortTasksByDueDate(matching);
  }, [tasks, searchQuery, priorityFilter, activeSection, statusFilter, sortTasksByDueDate]);

  const pendingFilteredTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === 'pending'),
    [filteredTasks]
  );

  const completedFilteredTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === 'completed'),
    [filteredTasks]
  );

  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      priorityFilter !== 'all' ||
      (activeSection === 'all' && statusFilter !== 'all')
    );
  }, [searchQuery, priorityFilter, activeSection, statusFilter]);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setPriorityFilter('all');
    setStatusFilter('all');
  }, []);

  const handleOpenCreateModal = useCallback(() => {
    setEditingTask(null);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((task: Task) => {
    setEditingTask(task);
    setIsFormModalOpen(true);
  }, []);

  const handleCloseFormModal = useCallback(() => {
    setIsFormModalOpen(false);
    setEditingTask(null);
  }, []);

  const handleFormSubmit = useCallback(
    (formData: TaskFormData) => {
      const nowIso = new Date().toISOString();

      if (editingTask) {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === editingTask.id
              ? {
                  ...task,
                  title: formData.title,
                  description: formData.description,
                  dueDate: formData.dueDate,
                  priority: formData.priority,
                  status: formData.status,
                  updatedAt: nowIso,
                }
              : task
          )
        );
        addToast('success', `Updated "${formData.title}".`);
      } else {
        const newTask: Task = {
          id: generateTaskId(),
          title: formData.title,
          description: formData.description,
          dueDate: formData.dueDate,
          priority: formData.priority,
          status: 'pending',
          createdAt: nowIso,
          updatedAt: nowIso,
        };
        setTasks((prev) => [newTask, ...prev]);
        addToast('success', `Added "${formData.title}".`);
      }

      setIsFormModalOpen(false);
      setEditingTask(null);
    },
    [editingTask, addToast]
  );

  const handleToggleStatus = useCallback(
    (taskId: string) => {
      const target = tasks.find((t) => t.id === taskId);
      if (!target) return;

      const nextStatus = target.status === 'completed' ? 'pending' : 'completed';
      const nowIso = new Date().toISOString();

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? { ...task, status: nextStatus, updatedAt: nowIso }
            : task
        )
      );

      addToast(
        'success',
        nextStatus === 'completed'
          ? `Marked "${target.title}" as completed.`
          : `Moved "${target.title}" back to pending.`
      );
    },
    [tasks, addToast]
  );

  const handleConfirmDelete = useCallback(() => {
    if (!taskToDelete) return;
    const deletedTitle = taskToDelete.title;
    setTasks((prev) => prev.filter((task) => task.id !== taskToDelete.id));
    setTaskToDelete(null);
    addToast('success', `Deleted "${deletedTitle}".`);
  }, [taskToDelete, addToast]);

  const handleSelectSection = useCallback((section: NavSection) => {
    setActiveSection(section);
  }, []);

  return (
    <div className="min-h-screen flex bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        counts={counts}
        theme={theme}
        onToggleTheme={toggleTheme}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          activeSection={activeSection}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenCreateModal={handleOpenCreateModal}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          {activeSection === 'dashboard' && (
            <>
              <StatsGrid
                total={counts.all}
                completed={counts.completed}
                pending={counts.pending}
                overdue={counts.overdue}
                onNavigate={handleSelectSection}
              />

              <FilterToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                showStatusFilter={false}
                priorityFilter={priorityFilter}
                onPriorityFilterChange={setPriorityFilter}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
                onResetFilters={handleResetFilters}
                hasActiveFilters={hasActiveFilters}
                resultCount={filteredTasks.length}
              />

              {/* Pending and Completed tasks shown separately on Dashboard */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                <section aria-labelledby="dashboard-pending-heading" className="space-y-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-baseline gap-2.5">
                      <h2
                        id="dashboard-pending-heading"
                        className="font-display text-base font-semibold text-neutral-900 dark:text-neutral-100"
                      >
                        Pending Tasks
                      </h2>
                      <span className="font-mono text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
                        {pendingFilteredTasks.length}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectSection('pending')}
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
                    >
                      <span>View all</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  {pendingFilteredTasks.length > 0 ? (
                    <div className="space-y-3">
                      {pendingFilteredTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onToggleStatus={handleToggleStatus}
                          onEdit={handleOpenEditModal}
                          onDeleteRequest={setTaskToDelete}
                        />
                      ))}
                    </div>
                  ) : hasActiveFilters ? (
                    <EmptyState
                      variant="filtered"
                      title="No matching pending tasks"
                      description="Try clearing your search or priority filter to view open tasks."
                      onResetFilters={handleResetFilters}
                    />
                  ) : (
                    <EmptyState
                      variant="completed-all"
                      title="No pending tasks"
                      description="You are all caught up. Add a new task whenever something comes up."
                      onAddTask={handleOpenCreateModal}
                    />
                  )}
                </section>

                <section aria-labelledby="dashboard-completed-heading" className="space-y-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-baseline gap-2.5">
                      <h2
                        id="dashboard-completed-heading"
                        className="font-display text-base font-semibold text-neutral-900 dark:text-neutral-100"
                      >
                        Completed Tasks
                      </h2>
                      <span className="font-mono text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
                        {completedFilteredTasks.length}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectSection('completed')}
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
                    >
                      <span>View all</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  {completedFilteredTasks.length > 0 ? (
                    <div className="space-y-3">
                      {completedFilteredTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onToggleStatus={handleToggleStatus}
                          onEdit={handleOpenEditModal}
                          onDeleteRequest={setTaskToDelete}
                        />
                      ))}
                    </div>
                  ) : hasActiveFilters ? (
                    <EmptyState
                      variant="filtered"
                      title="No matching completed tasks"
                      description="Adjust your search or priority filter to see completed items."
                      onResetFilters={handleResetFilters}
                    />
                  ) : (
                    <EmptyState
                      variant="empty"
                      title="No completed tasks yet"
                      description="Check off any pending task when finished and it will appear here."
                    />
                  )}
                </section>
              </div>
            </>
          )}

          {activeSection === 'all' && (
            <>
              <FilterToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                showStatusFilter={true}
                priorityFilter={priorityFilter}
                onPriorityFilterChange={setPriorityFilter}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
                onResetFilters={handleResetFilters}
                hasActiveFilters={hasActiveFilters}
                resultCount={filteredTasks.length}
              />

              {filteredTasks.length === 0 ? (
                hasActiveFilters ? (
                  <EmptyState
                    variant="filtered"
                    title="No tasks match your filters"
                    description="No tasks matched your current search or filter settings."
                    onResetFilters={handleResetFilters}
                  />
                ) : (
                  <EmptyState
                    variant="empty"
                    title="Your task list is empty"
                    description="Create your first task with a due date and priority to get organized."
                    onAddTask={handleOpenCreateModal}
                  />
                )
              ) : statusFilter === 'all' ? (
                <div className="space-y-8">
                  <section aria-labelledby="all-pending-heading" className="space-y-3">
                    <div className="flex items-baseline gap-2.5 border-b border-neutral-200 dark:border-neutral-800 pb-2">
                      <h2
                        id="all-pending-heading"
                        className="font-display text-sm font-semibold text-neutral-900 dark:text-neutral-100"
                      >
                        Pending Tasks
                      </h2>
                      <span className="font-mono text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
                        {pendingFilteredTasks.length}
                      </span>
                    </div>
                    {pendingFilteredTasks.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {pendingFilteredTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onToggleStatus={handleToggleStatus}
                            onEdit={handleOpenEditModal}
                            onDeleteRequest={setTaskToDelete}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 py-2">
                        No pending tasks in this view.
                      </p>
                    )}
                  </section>

                  <section aria-labelledby="all-completed-heading" className="space-y-3">
                    <div className="flex items-baseline gap-2.5 border-b border-neutral-200 dark:border-neutral-800 pb-2">
                      <h2
                        id="all-completed-heading"
                        className="font-display text-sm font-semibold text-neutral-900 dark:text-neutral-100"
                      >
                        Completed Tasks
                      </h2>
                      <span className="font-mono text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
                        {completedFilteredTasks.length}
                      </span>
                    </div>
                    {completedFilteredTasks.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {completedFilteredTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onToggleStatus={handleToggleStatus}
                            onEdit={handleOpenEditModal}
                            onDeleteRequest={setTaskToDelete}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 py-2">
                        No completed tasks in this view.
                      </p>
                    )}
                  </section>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleStatus={handleToggleStatus}
                      onEdit={handleOpenEditModal}
                      onDeleteRequest={setTaskToDelete}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeSection === 'pending' && (
            <>
              <FilterToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter="pending"
                onStatusFilterChange={setStatusFilter}
                showStatusFilter={false}
                priorityFilter={priorityFilter}
                onPriorityFilterChange={setPriorityFilter}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
                onResetFilters={handleResetFilters}
                hasActiveFilters={hasActiveFilters}
                resultCount={filteredTasks.length}
              />

              {filteredTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleStatus={handleToggleStatus}
                      onEdit={handleOpenEditModal}
                      onDeleteRequest={setTaskToDelete}
                    />
                  ))}
                </div>
              ) : hasActiveFilters ? (
                <EmptyState
                  variant="filtered"
                  title="No matching pending tasks"
                  description="No pending tasks matched your search or priority filter."
                  onResetFilters={handleResetFilters}
                />
              ) : (
                <EmptyState
                  variant="completed-all"
                  title="All tasks completed"
                  description="You have zero pending tasks right now. Add a new task to plan ahead."
                  onAddTask={handleOpenCreateModal}
                />
              )}
            </>
          )}

          {activeSection === 'completed' && (
            <>
              <FilterToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter="completed"
                onStatusFilterChange={setStatusFilter}
                showStatusFilter={false}
                priorityFilter={priorityFilter}
                onPriorityFilterChange={setPriorityFilter}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
                onResetFilters={handleResetFilters}
                hasActiveFilters={hasActiveFilters}
                resultCount={filteredTasks.length}
              />

              {filteredTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleStatus={handleToggleStatus}
                      onEdit={handleOpenEditModal}
                      onDeleteRequest={setTaskToDelete}
                    />
                  ))}
                </div>
              ) : hasActiveFilters ? (
                <EmptyState
                  variant="filtered"
                  title="No matching completed tasks"
                  description="No completed tasks matched your search or priority filter."
                  onResetFilters={handleResetFilters}
                />
              ) : (
                <EmptyState
                  variant="empty"
                  title="No completed tasks yet"
                  description="Completed tasks will be collected here once you mark a task done."
                />
              )}
            </>
          )}
        </main>
      </div>

      <TaskFormModal
        isOpen={isFormModalOpen}
        editingTask={editingTask}
        onClose={handleCloseFormModal}
        onSubmit={handleFormSubmit}
        onValidationError={(msg) => addToast('error', msg)}
      />

      <DeleteConfirmModal
        task={taskToDelete}
        onCancel={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
