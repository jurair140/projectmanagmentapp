import { AlertCircle, Calendar, Clock, Edit2, FolderKanban, Trash2, User } from 'lucide-react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { formatDate, formatDateTime, getClientDeadlineFlags } from '../../utils/dateUtils';
import { TASK_PRIORITY_STYLES, TASK_STATUS_STYLES } from '../../utils/formatters';

export default function TaskDetailsModal({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  if (!task) return null;

  const { isOverdue, isDueSoon } = getClientDeadlineFlags(task);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task.title} size="lg">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variantClass={TASK_STATUS_STYLES[task.status]}>{task.status}</Badge>
          <Badge variantClass={TASK_PRIORITY_STYLES[task.priority]}>{task.priority} Priority</Badge>
          {isOverdue && (
            <Badge variantClass="bg-rose-500/20 text-rose-300 border-rose-500/40">
              <AlertCircle className="h-3 w-3" />
              Overdue
            </Badge>
          )}
          {isDueSoon && !isOverdue && (
            <Badge variantClass="bg-amber-500/20 text-amber-300 border-amber-500/40">
              <Clock className="h-3 w-3" />
              Due within 3 days
            </Badge>
          )}
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Description
          </h4>
          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-[#0B0F19] border border-slate-800 rounded-lg p-4">
            {task.description || 'No description provided for this task.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-[#0B0F19] border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400 inline-flex items-center gap-1.5">
              <FolderKanban className="h-4 w-4" /> Project
            </span>
            <span className="text-white font-medium truncate">
              {task.project?.name || '—'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400 inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> Due Date
            </span>
            <span className={isOverdue ? 'text-rose-400 font-medium' : 'text-slate-200'}>
              {formatDate(task.dueDate)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400 inline-flex items-center gap-1.5">
              <User className="h-4 w-4" /> Assigned To
            </span>
            {task.assignedTo ? (
              <span className="inline-flex items-center gap-2 text-slate-200">
                <Avatar user={task.assignedTo} size="xs" />
                {task.assignedTo.name}
              </span>
            ) : (
              <span className="text-slate-500">Unassigned</span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400 inline-flex items-center gap-1.5">
              <User className="h-4 w-4" /> Created By
            </span>
            <span className="text-slate-200">{task.createdBy?.name || '—'}</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400">Created At</span>
            <span className="text-slate-300 text-xs">{formatDateTime(task.createdAt)}</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400">Last Updated</span>
            <span className="text-slate-300 text-xs">{formatDateTime(task.updatedAt)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
          {onStatusChange && (
            <div className="flex items-center gap-2">
              <label htmlFor="detail-status" className="text-xs text-slate-400">
                Quick Status:
              </label>
              <select
                id="detail-status"
                value={task.status}
                onChange={(e) => onStatusChange(task._id, e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[#0B0F19] border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            {onDelete && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  onClose();
                  onDelete(task);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            )}
            {onEdit && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(task);
                }}
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit Task
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
