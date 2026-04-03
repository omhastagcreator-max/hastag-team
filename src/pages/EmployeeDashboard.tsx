import { AppLayout } from '@/components/AppLayout';
import { SessionTracker } from '@/components/SessionTracker';
import { TaskList } from '@/components/TaskList';
import { TodaySummary } from '@/components/TodaySummary';

export default function EmployeeDashboard() {
  return (
    <AppLayout requiredRole="employee">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">My Dashboard</h1>
        <TodaySummary />
        <div className="grid md:grid-cols-2 gap-6">
          <SessionTracker />
          <TaskList />
        </div>
      </div>
    </AppLayout>
  );
}
