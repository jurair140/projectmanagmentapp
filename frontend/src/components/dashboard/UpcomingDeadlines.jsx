import { AlertCircle, Clock } from 'lucide-react';
import Badge from '../common/Badge';
import { formatDate, getClientDeadlineFlags } from '../../utils/dateUtils';

export default function UpcomingDeadlines({ tasks = [], onTaskClick }) {
  return (
    <div className="bg-[#151C2C] border border-slate-800/90 rounded-xl p-5 flex flex-col">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-white">Upcoming Deadlines</h2>
        <p className="text-xs text-slate-400 mt-0.5">Overdue & tasks due within 3 days</p>
      </div>

      {tasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <Clock className="h-8 w-8 text-slate-600 mb-2" />
          <p className="text-sm text-slate-400">No urgent deadlines in the next 3 days.</p>
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
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  isOverdue
                    ? 'bg-rose-500/[0.06] border-rose-500/30 hover:bg-rose-500/10'
                    : 'bg-amber-500/[0.05] border-amber-500/25 hover:bg-amber-500/10'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{task.title}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {task.project?.name || 'Project'}
                      {task.assignedTo?.name ? ` · ${task.assignedTo.name}` : ''}
                    </p>
                  </div>
                  {isOverdue ? (
                    <Badge variantClass="bg-rose-500/20 text-rose-300 border-rose-500/40 shrink-0">
                      <AlertCircle className="h-3 w-3" />
                      Overdue
                    </Badge>
                  ) : (
                    <Badge variantClass="bg-amber-500/20 text-amber-300 border-amber-500/40 shrink-0">
                      <Clock className="h-3 w-3" />
                      Due Soon
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-2">Due {formatDate(task.dueDate)}</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
