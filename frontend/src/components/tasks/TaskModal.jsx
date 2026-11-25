import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { toInputDate } from '../../utils/dateUtils';

const TASK_PRIORITIES = ['Low', 'Medium', 'High'];
const TASK_STATUSES = ['To Do', 'In Progress', 'Completed'];

export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  task = null,
  projects = [],
  defaultProjectId = '',
  loading = false,
}) {
  const isEditing = Boolean(task);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      project: defaultProjectId || '',
      assignedTo: '',
      priority: 'Medium',
      status: 'To Do',
      startDate: '',
      dueDate: toInputDate(new Date(Date.now() + 3 * 86400000)),
    },
  });

  const selectedProjectId = watch('project');
  const startDateValue = watch('startDate');

  const projectMembers = useMemo(() => {
    const proj = projects.find((p) => p._id === selectedProjectId);
    if (!proj) return [];
    const list = [];
    if (proj.owner) list.push(proj.owner);
    for (const m of proj.members || []) {
      if (m && !list.some((u) => u._id === m._id)) {
        list.push(m);
      }
    }
    return list;
  }, [projects, selectedProjectId]);

  useEffect(() => {
    if (task) {
      reset({
        title: task.title || '',
        description: task.description || '',
        project: task.project?._id || task.project || defaultProjectId || '',
        assignedTo: task.assignedTo?._id || task.assignedTo || '',
        priority: task.priority || 'Medium',
        status: task.status || 'To Do',
        startDate: toInputDate(task.startDate),
        dueDate: toInputDate(task.dueDate),
      });
    } else {
      reset({
        title: '',
        description: '',
        project: defaultProjectId || projects[0]?._id || '',
        assignedTo: '',
        priority: 'Medium',
        status: 'To Do',
        startDate: '',
        dueDate: toInputDate(new Date(Date.now() + 3 * 86400000)),
      });
    }
  }, [task, isOpen, defaultProjectId, projects, reset]);

  // Clear assignee if user switches project to one where previous assignee isn't a member
  useEffect(() => {
    const currentAssignee = watch('assignedTo');
    if (currentAssignee && projectMembers.length > 0) {
      const valid = projectMembers.some((m) => m._id === currentAssignee);
      if (!valid) {
        setValue('assignedTo', '');
      }
    }
  }, [projectMembers, setValue, watch]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Task' : 'Create New Task'}
      subtitle={isEditing ? 'Update task assignment, status, or deadline' : 'Add a deliverable and assign a project member'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="task-title" className="block text-sm font-medium text-slate-200 mb-1.5">
            Task Title
          </label>
          <input
            id="task-title"
            type="text"
            placeholder="e.g., Implement JWT refresh endpoint"
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#0B0F19] border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            {...register('title', {
              required: 'Task title is required',
              minLength: { value: 2, message: 'At least 2 characters required' },
              maxLength: { value: 200, message: 'Maximum 200 characters' },
            })}
          />
          {errors.title && <p className="text-xs text-rose-400 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="task-description" className="block text-sm font-medium text-slate-200 mb-1.5">
            Description
          </label>
          <textarea
            id="task-description"
            rows={3}
            placeholder="Add acceptance criteria, links, or implementation notes..."
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#0B0F19] border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            {...register('description', {
              maxLength: { value: 3000, message: 'Maximum 3000 characters' },
            })}
          />
          {errors.description && (
            <p className="text-xs text-rose-400 mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="task-project" className="block text-sm font-medium text-slate-200 mb-1.5">
              Project
            </label>
            <select
              id="task-project"
              disabled={isEditing}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0B0F19] border border-slate-700/80 text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-60"
              {...register('project', { required: 'Please select a project' })}
            >
              <option value="">Select a project</option>
              {projects.map((proj) => (
                <option key={proj._id} value={proj._id}>
                  {proj.name}
                </option>
              ))}
            </select>
            {errors.project && <p className="text-xs text-rose-400 mt-1">{errors.project.message}</p>}
          </div>

          <div>
            <label htmlFor="task-assignee" className="block text-sm font-medium text-slate-200 mb-1.5">
              Assign To
            </label>
            <select
              id="task-assignee"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0B0F19] border border-slate-700/80 text-sm text-white focus:outline-none focus:border-indigo-500"
              {...register('assignedTo')}
            >
              <option value="">Unassigned</option>
              {projectMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name} ({member.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="task-priority" className="block text-sm font-medium text-slate-200 mb-1.5">
              Priority
            </label>
            <select
              id="task-priority"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0B0F19] border border-slate-700/80 text-sm text-white focus:outline-none focus:border-indigo-500"
              {...register('priority')}
            >
              {TASK_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="task-status" className="block text-sm font-medium text-slate-200 mb-1.5">
              Status
            </label>
            <select
              id="task-status"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0B0F19] border border-slate-700/80 text-sm text-white focus:outline-none focus:border-indigo-500"
              {...register('status')}
            >
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="task-start" className="block text-sm font-medium text-slate-200 mb-1.5">
              Start Date <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <input
              id="task-start"
              type="date"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0B0F19] border border-slate-700/80 text-sm text-white focus:outline-none focus:border-indigo-500"
              {...register('startDate')}
            />
          </div>

          <div>
            <label htmlFor="task-due" className="block text-sm font-medium text-slate-200 mb-1.5">
              Due Date
            </label>
            <input
              id="task-due"
              type="date"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0B0F19] border border-slate-700/80 text-sm text-white focus:outline-none focus:border-indigo-500"
              {...register('dueDate', {
                required: 'Due date is required',
                validate: (val) =>
                  !startDateValue || val >= startDateValue || 'Due date cannot be before start date',
              })}
            />
            {errors.dueDate && <p className="text-xs text-rose-400 mt-1">{errors.dueDate.message}</p>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {isEditing ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
