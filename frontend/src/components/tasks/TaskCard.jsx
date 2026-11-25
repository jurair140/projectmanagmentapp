import { AlertCircle, Calendar, Clock, Edit2, Trash2 } from 'lucide-react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import { formatDate, getClientDeadlineFlags } from '../../utils/dateUtils';
import { TASK_PRIORITY_STYLES } from '../../utils/formatters';

export default function TaskCard({
  task,
  onSelect,
  onStatusChange,
  onEdit,
  onDelete,
  showProjectName = true,
}) {
  const { isOverdue, isDueSoon } = getClientDeadlineFlags(task);

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', task._id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onSelect(task)}
      className="group bg-[#192132] hover:bg-[#1E273B] border border-slate-800/90 hover:border-indigo-500/40 rounded-xl p-4 cursor-pointer transition-all duration-150 space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variantClass={TASK_PRIORITY_STYLES[task.priority]}>{task.priority}</Badge>
          {isOverdue && (
            <Badge variantClass="bg-rose-500/20 text-rose-300 border-rose-500/40">
              <AlertCircle className="h-3 w-3" />
              Overdue
            </Badge>
          )}
          {isDueSoon && !isOverdue && (
            <Badge variantClass="bg-amber-500/20 text-amber-300 border-amber-500/40">
              <Clock className="h-3 w-3" />
              Due Soon
            </Badge>
          )}
        </div>

        <div
          className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(task)}
              title="Edit task"
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700/70"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(task)}
              title="Delete task"
              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-white leading-snug line-clamp-2">{task.title}</h4>
        {showProjectName && task.project?.name && (
          <p className="text-xs text-indigo-300/90 mt-1 truncate">{task.project.name}</p>
        )}
      </div>

      <div
        className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 min-w-0">
          {task.assignedTo ? (
            <Avatar user={task.assignedTo} size="xs" />
          ) : (
            <span className="h-6 w-6 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-slate-500 flex items-center justify-center">
              —
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1 text-xs ${
              isOverdue ? 'text-rose-400 font-medium' : 'text-slate-400'
            }`}
          >
            <Calendar className="h-3 w-3" />
            {formatDate(task.dueDate)}
          </span>
        </div>

        <select
          aria-label={`Change status for ${task.title}`}
          value={task.status}
          onChange={(e) => onStatusChange(task._id, e.target.value)}
          className="px-2 py-1 rounded-md bg-[#0B0F19] border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
    </div>
  );
}
