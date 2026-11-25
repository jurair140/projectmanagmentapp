import { RotateCcw, Search } from 'lucide-react';

export default function TaskFilters({
  filters,
  onChange,
  onReset,
  projects = [],
  members = [],
  hideProjectFilter = false,
}) {
  const updateField = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-[#151C2C] border border-slate-800/90 rounded-xl p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="relative lg:col-span-2">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={filters.search || ''}
            onChange={(e) => updateField('search', e.target.value)}
            placeholder="Search tasks by title..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0B0F19] border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          aria-label="Filter by status"
          value={filters.status || 'All'}
          onChange={(e) => updateField('status', e.target.value)}
          className="px-3 py-2 rounded-lg bg-[#0B0F19] border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="All">All Statuses</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          aria-label="Filter by priority"
          value={filters.priority || 'All'}
          onChange={(e) => updateField('priority', e.target.value)}
          className="px-3 py-2 rounded-lg bg-[#0B0F19] border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="All">All Priorities</option>
          <option value="High">High Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="Low">Low Priority</option>
        </select>

        <select
          aria-label="Filter by deadline"
          value={filters.dueDate || ''}
          onChange={(e) => updateField('dueDate', e.target.value)}
          className="px-3 py-2 rounded-lg bg-[#0B0F19] border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Deadlines</option>
          <option value="overdue">Overdue</option>
          <option value="dueSoon">Due in 3 Days</option>
          <option value="today">Due Today</option>
        </select>

        <div className="flex items-center gap-2">
          {!hideProjectFilter ? (
            <select
              aria-label="Filter by project"
              value={filters.project || ''}
              onChange={(e) => updateField('project', e.target.value)}
              className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-[#0B0F19] border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          ) : (
            <select
              aria-label="Filter by member"
              value={filters.assignedTo || 'All'}
              onChange={(e) => updateField('assignedTo', e.target.value)}
              className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-[#0B0F19] border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={onReset}
            title="Reset filters"
            className="p-2 rounded-lg bg-[#0B0F19] border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors shrink-0"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
