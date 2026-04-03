import { AppLayout } from '@/components/AppLayout';
import { TaskList } from '@/components/TaskList';

export default function TasksPage() {
  return (
    <AppLayout requiredRole="employee">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">My Tasks</h1>
        <TaskList />
      </div>
    </AppLayout>
  );
}
