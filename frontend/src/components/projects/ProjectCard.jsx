import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, Users } from 'lucide-react';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';
import { formatDate } from '../../utils/dateUtils';
import { PROJECT_STATUS_STYLES } from '../../utils/formatters';

export default function ProjectCard({ project }) {
  const memberList = [project.owner, ...(project.members || [])].filter(Boolean);

  return (
    <Link
      to={`/projects/${project._id}`}
      className="group bg-[#151C2C] border border-slate-800/90 hover:border-indigo-500/40 rounded-xl p-5 flex flex-col justify-between transition-all duration-150"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
            {project.name}
          </h3>
          <Badge variantClass={PROJECT_STATUS_STYLES[project.status] || PROJECT_STATUS_STYLES.Planning}>
            {project.status}
          </Badge>
        </div>

        <p className="text-sm text-slate-400 line-clamp-2 min-h-[40px]">
          {project.description || 'No project description provided.'}
        </p>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400">Progress</span>
            <span className="font-semibold text-slate-200 tabular-nums">{project.progress || 0}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${project.progress || 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
        <div className="flex items-center -space-x-2">
          {memberList.slice(0, 4).map((m) => (
            <Avatar key={m._id} user={m} size="xs" className="ring-2 ring-[#151C2C]" />
          ))}
          {memberList.length > 4 && (
            <span className="h-6 w-6 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-slate-300 flex items-center justify-center ring-2 ring-[#151C2C]">
              +{memberList.length - 4}
            </span>
          )}
          <span className="pl-3 text-xs text-slate-400 inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {memberList.length}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            {project.completedTasks || 0}/{project.totalTasks || 0}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(project.endDate)}
          </span>
        </div>
      </div>
    </Link>
  );
}
