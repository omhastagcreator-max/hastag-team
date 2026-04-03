import { AppLayout } from '@/components/AppLayout';
import { TaskList } from '@/components/TaskList';
import { PageTransition } from '@/components/ui/PageTransition';

export default function TasksPage() {
  return (
    <AppLayout requiredRole="employee">
      <PageTransition>
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 drop-shadow-sm">My Tasks</h1>
          <TaskList />
        </div>
      </PageTransition>
    </AppLayout>
  );
}
