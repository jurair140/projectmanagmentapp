import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckSquare, LayoutGrid, List, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import TaskFilters from '../components/tasks/TaskFilters';
import KanbanBoard from '../components/tasks/KanbanBoard';
import TaskModal from '../components/tasks/TaskModal';
import TaskDetailsModal from '../components/tasks/TaskDetailsModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import EmptyState from '../components/common/EmptyState';
import { getProjects } from '../services/projectService';
import {
  createTask,
  deleteTask,
  getMyTasks,
  getTasks,
  updateTask,
} from '../services/taskService';
import { formatDate, getClientDeadlineFlags } from '../utils/dateUtils';
import {
  TASK_PRIORITY_STYLES,
  TASK_STATUS_STYLES,
  getErrorMessage,
} from '../utils/formatters';

export default function MyTasks() {
  const [searchParams] = useSearchParams();
  const [scope, setScope] = useState('my'); // 'my' | 'all'
  const [viewMode, setViewMode] = useState('board'); // 'board' | 'list'
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: 'All',
    priority: 'All',
    dueDate: '',
    project: '',
  });

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) {
      setFilters((prev) => ({ ...prev, search: q }));
    }
  }, [searchParams]);

  const loadProjects = useCallback(async () => {
    try {
      const data = await getProjects({ limit: 50 });
      setProjects(data.projects || []);
    } catch {
      // ignore
    }
  }, []);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const fetcher = scope === 'my' ? getMyTasks : getTasks;
      const data = await fetcher({ ...filters, limit: 100 });
      setTasks(data.tasks || []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load tasks'));
    } finally {
      setLoading(false);
    }
  }, [scope, filters]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    const timer = setTimeout(loadTasks, 200);
    return () => clearTimeout(timer);
  }, [loadTasks]);

  const handleSaveTask = async (values) => {
    setSubmitting(true);
    try {
      if (editingTask) {
        await updateTask(editingTask._id, values);
        toast.success('Task updated');
      } else {
        await createTask(values);
        toast.success('Task created');
      }
      setTaskModalOpen(false);
      setEditingTask(null);
      await loadTasks();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, nextStatus) => {
    try {
      const res = await updateTask(taskId, { status: nextStatus });
      if (selectedTask?._id === taskId) {
        setSelectedTask(res.task);
      }
      toast.success(`Moved to ${nextStatus}`);
      await loadTasks();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    setSubmitting(true);
    try {
      await deleteTask(taskToDelete._id);
      toast.success('Task deleted');
      setTaskToDelete(null);
      await loadTasks();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="My Tasks"
      breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'My Tasks' }]}
    >
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="inline-flex rounded-lg bg-[#151C2C] border border-slate-800 p-1 self-start">
            <button
              type="button"
              onClick={() => setScope('my')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                scope === 'my'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Assigned to Me
            </button>
            <button
              type="button"
              onClick={() => setScope('all')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                scope === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Project Tasks
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-lg bg-[#151C2C] border border-slate-800 p-1">
              <button
                type="button"
                onClick={() => setViewMode('board')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium ${
                  viewMode === 'board'
                    ? 'bg-[#202A3F] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Board
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium ${
                  viewMode === 'list'
                    ? 'bg-[#202A3F] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="h-3.5 w-3.5" />
                List
              </button>
            </div>

            <Button
              onClick={() => {
                if (projects.length === 0) {
                  toast.error('Create a project first before creating tasks');
                  return;
                }
                setEditingTask(null);
                setTaskModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>

        <TaskFilters
          filters={filters}
          onChange={setFilters}
          onReset={() =>
            setFilters({
              search: '',
              status: 'All',
              priority: 'All',
              dueDate: '',
              project: '',
            })
          }
          projects={projects}
        />

        {viewMode === 'board' ? (
          <KanbanBoard
            tasks={tasks}
            loading={loading}
            onStatusChange={handleStatusChange}
            onSelectTask={setSelectedTask}
            onEditTask={(t) => {
              setEditingTask(t);
              setTaskModalOpen(true);
            }}
            onDeleteTask={setTaskToDelete}
          />
        ) : tasks.length === 0 && !loading ? (
          <EmptyState
            icon={CheckSquare}
            title="No matching tasks"
            description="Adjust your filters or create a new task to get started."
          />
        ) : (
          <div className="bg-[#151C2C] border border-slate-800/90 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#121826] border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-5 py-3.5 font-medium">Task</th>
                    <th className="px-5 py-3.5 font-medium">Project</th>
                    <th className="px-5 py-3.5 font-medium">Assignee</th>
                    <th className="px-5 py-3.5 font-medium">Priority</th>
                    <th className="px-5 py-3.5 font-medium">Status</th>
                    <th className="px-5 py-3.5 font-medium">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {tasks.map((task) => {
                    const { isOverdue } = getClientDeadlineFlags(task);
                    return (
                      <tr
                        key={task._id}
                        onClick={() => setSelectedTask(task)}
                        className="hover:bg-[#1A2234] cursor-pointer transition-colors"
                      >
                        <td className="px-5 py-3.5 font-medium text-white max-w-xs truncate">
                          {task.title}
                        </td>
                        <td className="px-5 py-3.5 text-slate-300">
                          {task.project?.name || '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          {task.assignedTo ? (
                            <div className="flex items-center gap-2">
                              <Avatar user={task.assignedTo} size="xs" />
                              <span className="text-slate-300 text-xs">
                                {task.assignedTo.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-xs">Unassigned</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge variantClass={TASK_PRIORITY_STYLES[task.priority]}>
                            {task.priority}
                          </Badge>
                        </td>
                        <td
                          className="px-5 py-3.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                            className={`px-2.5 py-1 rounded-md bg-[#0B0F19] border border-slate-700 text-xs ${TASK_STATUS_STYLES[task.status] ? 'text-slate-200' : ''}`}
                          >
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td
                          className={`px-5 py-3.5 text-xs ${
                            isOverdue ? 'text-rose-400 font-medium' : 'text-slate-400'
                          }`}
                        >
                          {isOverdue ? 'Overdue · ' : ''}
                          {formatDate(task.dueDate)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
        task={editingTask}
        projects={projects}
        loading={submitting}
      />

      <TaskDetailsModal
        task={selectedTask}
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        onEdit={(t) => {
          setEditingTask(t);
          setTaskModalOpen(true);
        }}
        onDelete={setTaskToDelete}
        onStatusChange={handleStatusChange}
      />

      <ConfirmDialog
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"?`}
        loading={submitting}
      />
    </DashboardLayout>
  );
}
