import { Link } from 'react-router-dom';
import { ArrowRight, CheckSquare } from 'lucide-react';
import Badge from '../common/Badge';
import { formatDate, getClientDeadlineFlags } from '../../utils/dateUtils';
import { TASK_PRIORITY_STYLES, TASK_STATUS_STYLES } from '../../utils/formatters';

export default function MyTasksList({ tasks = [], onTaskClick }) {
  return (
    <div className="bg-[#151C2C] border border-slate-800/90 rounded-xl p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-white">My Tasks</h2>
          <p className="text-xs text-slate-400 mt-0.5">Tasks assigned directly to you</p>
        </div>
        <Link
          to="/tasks"
          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300"
        >
          View board
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <CheckSquare className="h-8 w-8 text-slate-600 mb-2" />
          <p className="text-sm text-slate-400">No tasks assigned to you right now.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {tasks.map((task) => {
            const { isOverdue } = getClientDeadlineFlags(task);
            return (
              <button
                key={task._id}
                type="button"
                onClick={() => onTaskClick && onTaskClick(task)}
                className="w-full text-left p-3 rounded-lg bg-[#192132]/80 hover:bg-[#1E283C] border border-slate-800/80 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{task.title}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {task.project?.name || 'Project'}
                    </p>
                  </div>
                  <Badge variantClass={TASK_PRIORITY_STYLES[task.priority]}>
                    {task.priority}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-2 mt-2.5">
                  <Badge variantClass={TASK_STATUS_STYLES[task.status]}>{task.status}</Badge>
                  <span
                    className={`text-xs ${
                      isOverdue ? 'text-rose-400 font-medium' : 'text-slate-400'
                    }`}
                  >
                    {isOverdue ? 'Overdue · ' : 'Due '}
                    {formatDate(task.dueDate)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
