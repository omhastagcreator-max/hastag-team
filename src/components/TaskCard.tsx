import { Badge } from '@/components/ui/badge';
import { Check, Circle, Clock, AlertTriangle } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

/**
 * Unified task card.
 *
 * UI/UX rules:
 *  - One click to toggle status (no modal, no loader).
 *  - Visual hierarchy by deadline:
 *      Overdue → red border + red dot
 *      Due today → orange accent
 *      Future → neutral
 *  - Priority badge only shown if `priority` is set, never decorative.
 *  - All optional metadata renders as a single muted line.
 */

export type TaskStatus = 'pending' | 'ongoing' | 'done';

export interface TaskCardData {
  id: string;
  title: string;
  status: TaskStatus | string;
  due_date?: string | null;
  project_name?: string | null;
  priority?: 'low' | 'normal' | 'high' | null;
}

interface TaskCardProps {
  task: TaskCardData;
  onToggle?: (next: TaskStatus) => void;
  onClick?: () => void;
  compact?: boolean;
}

function nextStatus(s: string): TaskStatus {
  if (s === 'pending') return 'ongoing';
  if (s === 'ongoing') return 'done';
  return 'pending';
}

export function TaskCard({ task, onToggle, onClick, compact }: TaskCardProps) {
  const due = task.due_date ? new Date(task.due_date) : null;
  const overdue = due && task.status !== 'done' && isPast(due) && !isToday(due);
  const today = due && isToday(due);

  const tone = overdue
    ? 'border-l-red-500 bg-red-500/[0.04]'
    : today
    ? 'border-l-amber-500 bg-amber-500/[0.04]'
    : 'border-l-border';

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle?.(nextStatus(task.status));
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'group flex items-center gap-3 rounded-md border border-border border-l-4 bg-card px-3 transition-colors hover:bg-muted/40',
        compact ? 'py-2' : 'py-3',
        onClick && 'cursor-pointer',
        tone,
      )}
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-label={`Mark task ${task.title} as ${nextStatus(task.status)}`}
        className="shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
      >
        {task.status === 'done' ? (
          <Check className="h-5 w-5 text-green-500" />
        ) : task.status === 'ongoing' ? (
          <div className="h-5 w-5 rounded-full border-2 border-amber-500 bg-amber-500/30" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-sm font-medium truncate',
            task.status === 'done' && 'line-through text-muted-foreground',
          )}
        >
          {task.title}
        </p>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
          {task.project_name && <span className="truncate">{task.project_name}</span>}
          {task.project_name && due && <span aria-hidden>·</span>}
          {due && (
            <span className={cn('flex items-center gap-1', overdue && 'text-red-500 font-medium')}>
              {overdue ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              {format(due, 'MMM dd')}
            </span>
          )}
        </div>
      </div>

      {task.priority === 'high' && (
        <Badge variant="outline" className="shrink-0 border-orange-500/40 text-orange-500 text-[10px]">
          HIGH
        </Badge>
      )}
    </div>
  );
}
