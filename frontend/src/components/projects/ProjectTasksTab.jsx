import { Plus } from 'lucide-react';
import Button from '../common/Button';
import KanbanBoard from '../tasks/KanbanBoard';
import TaskFilters from '../tasks/TaskFilters';

export default function ProjectTasksTab({
  tasks,
  filters,
  onFilterChange,
  onResetFilters,
  members,
  onCreateTask,
  onStatusChange,
  onSelectTask,
  onEditTask,
  onDeleteTask,
  loading,
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">Project Tasks Board</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Track progress across To Do, In Progress, and Completed stages
          </p>
        </div>
        <Button onClick={onCreateTask}>
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      <TaskFilters
        filters={filters}
        onChange={onFilterChange}
        onReset={onResetFilters}
        members={members}
        hideProjectFilter
      />

      <KanbanBoard
        tasks={tasks}
        loading={loading}
        onStatusChange={onStatusChange}
        onSelectTask={onSelectTask}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        showProjectName={false}
      />
    </div>
  );
}
