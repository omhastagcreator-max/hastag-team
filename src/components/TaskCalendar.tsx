import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Task } from '@/hooks/useTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TaskCard } from '@/components/TaskCard';
import { format, isSameDay } from 'date-fns';
import { CalendarDays } from 'lucide-react';

interface TaskCalendarProps {
  tasks: Task[];
  onToggleTask?: (task: Task, nextStatus: string) => void;
}

export function TaskCalendar({ tasks, onToggleTask }: TaskCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Custom modifiers to show dots
  const taskDates = tasks
    .map(t => t.due_date ? new Date(t.due_date) : (t.created_at ? new Date(t.created_at) : null))
    .filter((d): d is Date => d !== null);

  const selectedTasks = tasks.filter(t => {
    if (!selectedDate) return false;
    const taskDate = t.due_date ? new Date(t.due_date) : new Date(t.created_at);
    return isSameDay(taskDate, selectedDate);
  });

  return (
    <Card>
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Task Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border">
        <div className="p-4 flex-shrink-0 flex justify-center bg-card">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{ hasTask: taskDates }}
            modifiersClassNames={{ hasTask: "font-bold text-primary underline underline-offset-4 decoration-primary" }}
          />
        </div>
        <div className="p-4 flex-1 bg-muted/10 h-[350px] overflow-auto">
          <h3 className="font-semibold text-sm mb-4">
            {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
            {selectedDate && <Badge variant="secondary" className="ml-2">{selectedTasks.length}</Badge>}
          </h3>
          {selectedTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks scheduled for this date.</p>
          ) : (
            <div className="space-y-2">
              {selectedTasks.map(t => (
                <TaskCard 
                  key={t.id} 
                  task={{ 
                    id: t.id, 
                    title: t.title, 
                    status: t.status, 
                    project_name: t.category || undefined,
                    due_date: t.due_date
                  }} 
                  onToggle={(next) => onToggleTask?.(t, next)}
                  compact 
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
