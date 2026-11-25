import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  Edit2,
  Sparkles,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ProjectModal from '../components/projects/ProjectModal';
import ProjectOverviewTab from '../components/projects/ProjectOverviewTab';
import ProjectTasksTab from '../components/projects/ProjectTasksTab';
import ProjectMembersTab from '../components/projects/ProjectMembersTab';
import TaskModal from '../components/tasks/TaskModal';
import TaskDetailsModal from '../components/tasks/TaskDetailsModal';
import AddMemberModal from '../components/team/AddMemberModal';
import { Skeleton } from '../components/common/Skeleton';
import {
  addProjectMember,
  deleteProject,
  getProjectById,
  removeProjectMember,
  updateProject,
} from '../services/projectService';
import {
  createTask,
  deleteTask,
  getProjectTasks,
  updateTask,
} from '../services/taskService';
import { useAuth } from '../hooks/useAuth';
import { PROJECT_STATUS_STYLES, getErrorMessage } from '../utils/formatters';

const DEFAULT_FILTERS = {
  search: '',
  status: 'All',
  priority: 'All',
  dueDate: '',
  assignedTo: 'All',
};

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isOwner = Boolean(project && user && String(project.owner?._id) === String(user._id));

  const projectMembers = useMemo(() => {
    if (!project) return [];
    const list = [];
    if (project.owner) list.push(project.owner);
    for (const m of project.members || []) {
      if (m && !list.some((u) => u._id === m._id)) list.push(m);
    }
    return list;
  }, [project]);

  const loadProject = useCallback(async () => {
    try {
      const data = await getProjectById(id);
      setProject(data.project);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to load project'));
      navigate('/projects', { replace: true });
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const loadTasks = useCallback(async () => {
    setTasksLoading(true);
    try {
      const data = await getProjectTasks(id, {
        ...filters,
        limit: 100,
      });
      setTasks(data.tasks || []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load project tasks'));
    } finally {
      setTasksLoading(false);
    }
  }, [id, filters]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  useEffect(() => {
    const timer = setTimeout(loadTasks, 200);
    return () => clearTimeout(timer);
  }, [loadTasks]);

  const handleUpdateProject = async (values) => {
    setSubmitting(true);
    try {
      const res = await updateProject(id, values);
      setProject(res.project);
      toast.success('Project updated');
      setEditProjectOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkProjectCompleted = async () => {
    setSubmitting(true);
    try {
      const res = await updateProject(id, { status: 'Completed' });
      setProject(res.project);
      toast.success('Project marked as Completed');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    setSubmitting(true);
    try {
      await deleteProject(id);
      toast.success('Project deleted');
      navigate('/projects', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMember = async (payload) => {
    setSubmitting(true);
    try {
      const res = await addProjectMember(id, payload);
      setProject(res.project);
      toast.success(res.message || 'Member added');
      setAddMemberOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    setSubmitting(true);
    try {
      const res = await removeProjectMember(id, memberToRemove._id);
      setProject(res.project);
      toast.success('Member removed');
      setMemberToRemove(null);
      await loadTasks();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveTask = async (values) => {
    setSubmitting(true);
    try {
      if (editingTask) {
        await updateTask(editingTask._id, values);
        toast.success('Task updated');
      } else {
        await createTask({ ...values, project: id });
        toast.success('Task created');
      }
      setTaskModalOpen(false);
      setEditingTask(null);
      await Promise.all([loadProject(), loadTasks()]);
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
      toast.success(`Status updated to ${nextStatus}`);
      await Promise.all([loadProject(), loadTasks()]);
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
      await Promise.all([loadProject(), loadTasks()]);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !project) {
    return (
      <DashboardLayout title="Project Details">
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={project.name}
      breadcrumbs={[
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Projects', to: '/projects' },
        { label: project.name },
      ]}
    >
      <div className="space-y-6">
        {/* Header Card */}
        <div className="bg-[#151C2C] border border-slate-800/90 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold text-white">{project.name}</h2>
              <Badge variantClass={PROJECT_STATUS_STYLES[project.status]}>
                {project.status}
              </Badge>
            </div>
            <p className="text-sm text-slate-400">
              Owned by <span className="text-slate-200 font-medium">{project.owner?.name}</span>
            </p>
          </div>

          {isOwner && (
            <div className="flex flex-wrap items-center gap-2.5">
              <Button variant="secondary" size="sm" onClick={() => setEditProjectOpen(true)}>
                <Edit2 className="h-4 w-4" />
                Edit Project
              </Button>
              <Button variant="danger" size="sm" onClick={() => setDeleteProjectOpen(true)}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Auto-suggest Completed Banner */}
        {project.suggestCompleted && isOwner && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-emerald-400 shrink-0" />
              <p className="text-sm text-emerald-100">
                All {project.totalTasks} tasks in this project are completed! Would you like to mark
                this project as Completed?
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleMarkProjectCompleted}
              loading={submitting}
              className="bg-emerald-600 hover:bg-emerald-500 border-emerald-500/40 shrink-0"
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark Completed
            </Button>
          </div>
        )}

        {/* Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-[#151C2C] border border-slate-800/90 rounded-xl p-4">
            <p className="text-xs text-slate-400">Progress</p>
            <p className="text-2xl font-bold text-indigo-400 mt-1 tabular-nums">
              {project.progress || 0}%
            </p>
          </div>
          <div className="bg-[#151C2C] border border-slate-800/90 rounded-xl p-4">
            <p className="text-xs text-slate-400">Total Tasks</p>
            <p className="text-2xl font-bold text-white mt-1 tabular-nums">
              {project.totalTasks || 0}
            </p>
          </div>
          <div className="bg-[#151C2C] border border-slate-800/90 rounded-xl p-4">
            <p className="text-xs text-slate-400">Completed</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1 tabular-nums">
              {project.completedTasks || 0}
            </p>
          </div>
          <div className="bg-[#151C2C] border border-slate-800/90 rounded-xl p-4">
            <p className="text-xs text-slate-400">Pending</p>
            <p className="text-2xl font-bold text-amber-400 mt-1 tabular-nums">
              {project.pendingTasks || 0}
            </p>
          </div>
          <div className="bg-[#151C2C] border border-slate-800/90 rounded-xl p-4 col-span-2 sm:col-span-1">
            <p className="text-xs text-slate-400">Overdue</p>
            <p className="text-2xl font-bold text-rose-400 mt-1 tabular-nums">
              {project.overdueTasks || 0}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-800 flex items-center gap-6 overflow-x-auto">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'tasks', label: `Tasks (${project.totalTasks || 0})` },
            { key: 'members', label: `Team Members (${projectMembers.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && <ProjectOverviewTab project={project} />}

        {activeTab === 'tasks' && (
          <ProjectTasksTab
            tasks={tasks}
            loading={tasksLoading}
            filters={filters}
            onFilterChange={setFilters}
            onResetFilters={() => setFilters(DEFAULT_FILTERS)}
            members={projectMembers}
            onCreateTask={() => {
              setEditingTask(null);
              setTaskModalOpen(true);
            }}
            onStatusChange={handleStatusChange}
            onSelectTask={setSelectedTask}
            onEditTask={(t) => {
              setEditingTask(t);
              setTaskModalOpen(true);
            }}
            onDeleteTask={setTaskToDelete}
          />
        )}

        {activeTab === 'members' && (
          <ProjectMembersTab
            project={project}
            isOwner={isOwner}
            onOpenAddMember={() => setAddMemberOpen(true)}
            onRemoveMember={setMemberToRemove}
          />
        )}
      </div>

      <ProjectModal
        isOpen={editProjectOpen}
        onClose={() => setEditProjectOpen(false)}
        onSubmit={handleUpdateProject}
        project={project}
        loading={submitting}
      />

      <ConfirmDialog
        isOpen={deleteProjectOpen}
        onClose={() => setDeleteProjectOpen(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.name}"? All tasks and notifications linked to this project will also be permanently removed.`}
        loading={submitting}
      />

      <AddMemberModal
        isOpen={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        onAddMember={handleAddMember}
        projectName={project.name}
        existingIds={projectMembers.map((m) => m._id)}
        loading={submitting}
      />

      <ConfirmDialog
        isOpen={Boolean(memberToRemove)}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveMember}
        title="Remove Team Member"
        message={`Remove ${memberToRemove?.name} from "${project.name}"? Their assigned tasks in this project will become unassigned.`}
        confirmLabel="Remove Member"
        loading={submitting}
      />

      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
        task={editingTask}
        projects={[project]}
        defaultProjectId={project._id}
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
