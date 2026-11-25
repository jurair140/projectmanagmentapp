import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { toInputDate } from '../../utils/dateUtils';

const PROJECT_STATUSES = ['Planning', 'Active', 'Completed', 'On Hold'];

export default function ProjectModal({ isOpen, onClose, onSubmit, project = null, loading = false }) {
  const isEditing = Boolean(project);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      startDate: toInputDate(new Date()),
      endDate: toInputDate(new Date(Date.now() + 14 * 86400000)),
      status: 'Planning',
    },
  });

  useEffect(() => {
    if (project) {
      reset({
        name: project.name || '',
        description: project.description || '',
        startDate: toInputDate(project.startDate),
        endDate: toInputDate(project.endDate),
        status: project.status || 'Planning',
      });
    } else {
      reset({
        name: '',
        description: '',
        startDate: toInputDate(new Date()),
        endDate: toInputDate(new Date(Date.now() + 14 * 86400000)),
        status: 'Planning',
      });
    }
  }, [project, isOpen, reset]);

  const startDateValue = watch('startDate');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Project' : 'Create New Project'}
      subtitle={isEditing ? 'Update project details and timeline' : 'Organize tasks and collaborate with your team'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="project-name" className="block text-sm font-medium text-slate-200 mb-1.5">
            Project Name
          </label>
          <input
            id="project-name"
            type="text"
            placeholder="e.g., Customer Portal Redesign"
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#0B0F19] border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            {...register('name', {
              required: 'Project name is required',
              minLength: { value: 2, message: 'At least 2 characters required' },
              maxLength: { value: 120, message: 'Maximum 120 characters' },
            })}
          />
          {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="project-description" className="block text-sm font-medium text-slate-200 mb-1.5">
            Description
          </label>
          <textarea
            id="project-description"
            rows={3}
            placeholder="Describe project goals, scope, and deliverables..."
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#0B0F19] border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            {...register('description', {
              maxLength: { value: 2000, message: 'Maximum 2000 characters' },
            })}
          />
          {errors.description && (
            <p className="text-xs text-rose-400 mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="project-start" className="block text-sm font-medium text-slate-200 mb-1.5">
              Start Date
            </label>
            <input
              id="project-start"
              type="date"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0B0F19] border border-slate-700/80 text-sm text-white focus:outline-none focus:border-indigo-500"
              {...register('startDate', { required: 'Start date is required' })}
            />
            {errors.startDate && (
              <p className="text-xs text-rose-400 mt-1">{errors.startDate.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="project-end" className="block text-sm font-medium text-slate-200 mb-1.5">
              End Date
            </label>
            <input
              id="project-end"
              type="date"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0B0F19] border border-slate-700/80 text-sm text-white focus:outline-none focus:border-indigo-500"
              {...register('endDate', {
                required: 'End date is required',
                validate: (val) =>
                  !startDateValue || val >= startDateValue || 'End date cannot be before start date',
              })}
            />
            {errors.endDate && <p className="text-xs text-rose-400 mt-1">{errors.endDate.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="project-status" className="block text-sm font-medium text-slate-200 mb-1.5">
            Status
          </label>
          <select
            id="project-status"
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#0B0F19] border border-slate-700/80 text-sm text-white focus:outline-none focus:border-indigo-500"
            {...register('status')}
          >
            {PROJECT_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {isEditing ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
