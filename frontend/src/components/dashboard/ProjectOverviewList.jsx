import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, FolderKanban } from 'lucide-react';
import Badge from '../common/Badge';
import { formatDate } from '../../utils/dateUtils';
import { PROJECT_STATUS_STYLES } from '../../utils/formatters';

export default function ProjectOverviewList({ projects = [] }) {
  return (
    <div className="bg-[#151C2C] border border-slate-800/90 rounded-xl p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-white">Project Overview</h2>
          <p className="text-xs text-slate-400 mt-0.5">Recently updated projects & progress</p>
        </div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <FolderKanban className="h-8 w-8 text-slate-600 mb-2" />
          <p className="text-sm text-slate-400">No projects yet. Create your first project to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <Link
              key={project._id}
              to={`/projects/${project._id}`}
              className="block p-3.5 rounded-lg bg-[#192132]/80 hover:bg-[#1E283C] border border-slate-800/80 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-sm font-medium text-white truncate">{project.name}</span>
                <Badge variantClass={PROJECT_STATUS_STYLES[project.status] || PROJECT_STATUS_STYLES.Planning}>
                  {project.status}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${project.progress || 0}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-300 tabular-nums w-9 text-right">
                  {project.progress || 0}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                <span>
                  {project.completedTasks || 0}/{project.totalTasks || 0} tasks completed
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Due {formatDate(project.endDate)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
