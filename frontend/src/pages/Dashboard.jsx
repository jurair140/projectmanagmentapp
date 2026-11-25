import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FolderKanban,
  FolderPlus,
  Layers,
  ListChecks,
  Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import ProjectOverviewList from '../components/dashboard/ProjectOverviewList';
import MyTasksList from '../components/dashboard/MyTasksList';
import UpcomingDeadlines from '../components/dashboard/UpcomingDeadlines';
import ProductivityChart from '../components/dashboard/ProductivityChart';
import ProjectModal from '../components/projects/ProjectModal';
import TaskModal from '../components/tasks/TaskModal';
import TaskDetailsModal from '../components/tasks/TaskDetailsModal';
import Button from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import {
  getDashboardMyTasks,
  getDashboardStats,
  getProductivity,
  getRecentProjects,
} from '../services/dashboardService';
import { createProject, getProjects } from '../services/projectService';
import { createTask, updateTask } from '../services/taskService';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/formatters';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [productivityData, setProductivityData] = useState([]);

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      const [statsRes, recentRes, tasksRes, prodRes, projListRes] = await Promise.all([
        getDashboardStats(),
        getRecentProjects(),
        getDashboardMyTasks(),
        getProductivity(),
        getProjects({ limit: 50 }),
      ]);
      setStats(statsRes.stats || {});
      setRecentProjects(recentRes.projects || []);
      setMyTasks(tasksRes.myTasks || []);
      setUpcomingDeadlines(tasksRes.upcomingDeadlines || []);
      setProductivityData(prodRes.statusData || []);
      setAllProjects(projListRes.projects || []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load dashboard data'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleCreateProject = async (values) => {
    setSubmitting(true);
    try {
      await createProject(values);
      toast.success('Project created');
      setProjectModalOpen(false);
      await loadDashboard();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTask = async (values) => {
    setSubmitting(true);
    try {
      await createTask(values);
      toast.success('Task created');
      setTaskModalOpen(false);
      await loadDashboard();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (taskId, nextStatus) => {
    try {
      const res = await updateTask(taskId, { status: nextStatus });
      setSelectedTask(res.task);
      toast.success(`Moved to ${nextStatus}`);
      await loadDashboard();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome & Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#151C2C] border border-slate-800/90 rounded-xl p-5">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Welcome back, {user?.name?.split(' ')[0] || 'there'}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Here is a live summary of your projects, deliverables, and upcoming deadlines.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button onClick={() => setProjectModalOpen(true)} size="sm">
              <FolderPlus className="h-4 w-4" />
              New Project
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (allProjects.length === 0) {
                  toast.error('Create a project first before adding tasks');
                  setProjectModalOpen(true);
                  return;
                }
                setTaskModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              New Task
            </Button>
            <Link
              to="/projects"
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              View All Projects
            </Link>
          </div>
        </div>

        {/* Stat Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[#151C2C] border border-slate-800 rounded-xl p-5 space-y-3">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-8 w-12" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard
              label="Total Projects"
              value={stats.totalProjects}
              icon={Layers}
              accentClass="text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
            />
            <StatCard
              label="Active Projects"
              value={stats.activeProjects}
              icon={FolderKanban}
              accentClass="text-sky-400 bg-sky-500/10 border-sky-500/20"
            />
            <StatCard
              label="Total Tasks"
              value={stats.totalTasks}
              icon={ListChecks}
              accentClass="text-violet-400 bg-violet-500/10 border-violet-500/20"
            />
            <StatCard
              label="Completed Tasks"
              value={stats.completedTasks}
              icon={CheckCircle2}
              accentClass="text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
            />
            <StatCard
              label="Pending Tasks"
              value={stats.pendingTasks}
              icon={Clock}
              accentClass="text-amber-400 bg-amber-500/10 border-amber-500/20"
            />
            <StatCard
              label="Overdue Tasks"
              value={stats.overdueTasks}
              icon={AlertTriangle}
              accentClass="text-rose-400 bg-rose-500/10 border-rose-500/20"
            />
          </div>
        )}

        {/* Main Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProjectOverviewList projects={recentProjects} />
          <ProductivityChart data={productivityData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MyTasksList tasks={myTasks} onTaskClick={setSelectedTask} />
          <UpcomingDeadlines tasks={upcomingDeadlines} onTaskClick={setSelectedTask} />
        </div>
      </div>

      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onSubmit={handleCreateProject}
        loading={submitting}
      />

      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        projects={allProjects}
        loading={submitting}
      />

      <TaskDetailsModal
        task={selectedTask}
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        onStatusChange={handleQuickStatusChange}
      />
    </DashboardLayout>
  );
}
