import { Calendar, Crown, UserCheck } from 'lucide-react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import { formatDate } from '../../utils/dateUtils';
import { PROJECT_STATUS_STYLES } from '../../utils/formatters';

export default function ProjectOverviewTab({ project }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-[#151C2C] border border-slate-800/90 rounded-xl p-6 space-y-5">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">
            About Project
          </h3>
          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
            {project.description || 'No detailed description provided for this project.'}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-400">Completion Progress</span>
            <span className="font-semibold text-white tabular-nums">{project.progress || 0}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${project.progress || 0}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Automatically calculated from {project.completedTasks || 0} completed out of{' '}
            {project.totalTasks || 0} total tasks.
          </p>
        </div>
      </div>

      <div className="bg-[#151C2C] border border-slate-800/90 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Project Details
        </h3>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Status</span>
          <Badge variantClass={PROJECT_STATUS_STYLES[project.status] || PROJECT_STATUS_STYLES.Planning}>
            {project.status}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400 inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4" /> Start Date
          </span>
          <span className="text-slate-200">{formatDate(project.startDate)}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400 inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4" /> End Date
          </span>
          <span className="text-slate-200">{formatDate(project.endDate)}</span>
        </div>

        <div className="pt-4 border-t border-slate-800/80">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-3">
            Project Owner
          </p>
          <div className="flex items-center gap-3">
            <Avatar user={project.owner} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate flex items-center gap-1.5">
                {project.owner?.name}
                <Crown className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              </p>
              <p className="text-xs text-slate-400 truncate">{project.owner?.email}</p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5" /> Team Size
          </span>
          <span className="text-slate-200 font-medium">
            {1 + (project.members?.length || 0)} members
          </span>
        </div>
      </div>
    </div>
  );
}
