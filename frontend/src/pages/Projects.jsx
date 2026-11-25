import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FolderKanban, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectModal from '../components/projects/ProjectModal';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import { CardGridSkeleton } from '../components/common/Skeleton';
import { createProject, getProjects } from '../services/projectService';
import { getErrorMessage } from '../utils/formatters';

export default function Projects() {
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState('All');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) setSearch(q);
  }, [searchParams]);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProjects({
        search,
        status,
        sortBy,
        sortOrder,
        page,
        limit: 9,
      });
      setProjects(data.projects || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load projects'));
    } finally {
      setLoading(false);
    }
  }, [search, status, sortBy, sortOrder, page]);

  useEffect(() => {
    const timer = setTimeout(loadProjects, 200);
    return () => clearTimeout(timer);
  }, [loadProjects]);

  const handleCreateProject = async (values) => {
    setSubmitting(true);
    try {
      await createProject(values);
      toast.success('Project created successfully');
      setModalOpen(false);
      setPage(1);
      await loadProjects();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="My Projects"
      breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'My Projects' }]}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">
              Manage workspaces you own or collaborate on with your team.
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Project
          </Button>
        </div>

        {/* Search, Filter & Sort Controls */}
        <div className="bg-[#151C2C] border border-slate-800/90 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search projects by name or description..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0B0F19] border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            aria-label="Filter by project status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg bg-[#0B0F19] border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="Planning">Planning</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>

          <select
            aria-label="Sort projects"
            value={`${sortBy}:${sortOrder}`}
            onChange={(e) => {
              const [field, dir] = e.target.value.split(':');
              setSortBy(field);
              setSortOrder(dir);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg bg-[#0B0F19] border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="updatedAt:desc">Recently Updated</option>
            <option value="createdAt:desc">Newest Created</option>
            <option value="createdAt:asc">Oldest Created</option>
            <option value="endDate:asc">Deadline (Earliest)</option>
            <option value="endDate:desc">Deadline (Latest)</option>
          </select>
        </div>

        {loading ? (
          <CardGridSkeleton count={6} />
        ) : projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects found"
            description={
              search || status !== 'All'
                ? 'Try adjusting your search or status filter.'
                : 'Create your first project to organize tasks and collaborate with teammates.'
            }
            action={
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Create Project
              </Button>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {projects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <ProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateProject}
        loading={submitting}
      />
    </DashboardLayout>
  );
}
