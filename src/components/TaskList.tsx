import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Check, Pencil, Trash2, ListTodo } from 'lucide-react';
import { useTasks, Task } from '@/hooks/useTasks';

const categories = ['SEO', 'Ads', 'Design', 'Dev', 'Other'];

function TaskForm({ onSubmit, initial, onCancel }: {
  onSubmit: (t: { title: string; category?: string; time_spent?: number; status?: string }) => void;
  initial?: Task;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState(initial?.title || '');
  const [category, setCategory] = useState(initial?.category || '');
  const [timeSpent, setTimeSpent] = useState(initial?.time_spent?.toString() || '');
  const [status, setStatus] = useState(initial?.status || 'pending');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      category: category || undefined,
      time_spent: timeSpent ? parseInt(timeSpent) : undefined,
      status,
    });
    if (!initial) { setTitle(''); setCategory(''); setTimeSpent(''); setStatus('pending'); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input placeholder="Task title *" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <div className="grid grid-cols-3 gap-2">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="number" placeholder="Min spent" value={timeSpent} onChange={(e) => setTimeSpent(e.target.value)} min={0} />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="gap-1">
          {initial ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
          {initial ? 'Update' : 'Add Task'}
        </Button>
        {onCancel && <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  );
}

export function TaskList() {
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const doneTasks = tasks.filter((t) => t.status === 'done').length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-primary" />
            Today's Tasks
            <Badge variant="secondary" className="ml-1">{doneTasks}/{tasks.length}</Badge>
          </CardTitle>
          <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)} className="gap-1">
            <Plus className="h-3 w-3" /> Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && (
          <div className="p-3 border rounded-lg bg-muted/30">
            <TaskForm onSubmit={(t) => { addTask(t); setShowForm(false); }} onCancel={() => setShowForm(false)} />
          </div>
        )}
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No tasks yet today. Start adding!</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div key={task.id} className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                {editingId === task.id ? (
                  <TaskForm
                    initial={task}
                    onSubmit={(t) => { updateTask(task.id, t); setEditingId(null); }}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium text-sm ${task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {task.title}
                        </span>
                        {tasks.filter(t => t.title.toLowerCase().trim() === task.title.toLowerCase().trim()).length > 1 && (
                          <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-500 border-orange-500/20">
                            Repeat: {tasks.filter(t => t.title.toLowerCase().trim() === task.title.toLowerCase().trim()).length}
                          </Badge>
                        )}
                        {task.category && (
                          <Badge variant="outline" className="text-xs">{task.category}</Badge>
                        )}
                        <Badge variant={task.status === 'done' ? 'default' : 'secondary'} className="text-xs">
                          {task.status}
                        </Badge>
                      </div>
                      {task.time_spent && (
                        <span className="text-xs text-muted-foreground">{task.time_spent} min</span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(task.id)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteTask(task.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
