import { useState } from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import TaskCard from './TaskCard';
import { Skeleton } from '../common/Skeleton';

const COLUMNS = [
  {
    key: 'To Do',
    label: 'To Do',
    icon: Circle,
    accent: 'text-slate-300',
    dot: 'bg-slate-400',
  },
  {
    key: 'In Progress',
    label: 'In Progress',
    icon: Clock,
    accent: 'text-indigo-300',
    dot: 'bg-indigo-400',
  },
  {
    key: 'Completed',
    label: 'Completed',
    icon: CheckCircle2,
    accent: 'text-emerald-300',
    dot: 'bg-emerald-400',
  },
];

export default function KanbanBoard({
  tasks = [],
  loading = false,
  onStatusChange,
  onSelectTask,
  onEditTask,
  onDeleteTask,
  showProjectName = true,
}) {
  const [dragOverCol, setDragOverCol] = useState(null);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            className="bg-[#151C2C] border border-slate-800 rounded-xl p-4 space-y-3"
          >
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.key);
        const isDragTarget = dragOverCol === col.key;

        return (
          <div
            key={col.key}
            onDragOver={(e) => {
              e.preventDefault();
              if (dragOverCol !== col.key) setDragOverCol(col.key);
            }}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverCol(null);
              const droppedTaskId = e.dataTransfer.getData('text/plain');
              const existing = tasks.find((t) => t._id === droppedTaskId);
              if (existing && existing.status !== col.key) {
                onStatusChange(droppedTaskId, col.key);
              }
            }}
            className={`bg-[#151C2C] border rounded-xl p-4 min-h-[320px] transition-colors ${
              isDragTarget ? 'border-indigo-500 bg-indigo-500/[0.04]' : 'border-slate-800/90'
            }`}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                <h3 className={`text-sm font-semibold ${col.accent}`}>{col.label}</h3>
              </div>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#0B0F19] border border-slate-800 text-slate-300 tabular-nums">
                {columnTasks.length}
              </span>
            </div>

            {columnTasks.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                No tasks in {col.label}
              </div>
            ) : (
              <div className="space-y-3">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onSelect={onSelectTask}
                    onStatusChange={onStatusChange}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    showProjectName={showProjectName}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
