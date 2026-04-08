import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, Coffee } from 'lucide-react';
import { useSession } from '@/hooks/useSession';
import { useTasks } from '@/hooks/useTasks';
import { toast } from 'sonner';
function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function SessionTracker() {
  const { activeSession, isOnBreak, breakStart, startWork, startBreak, endBreak, endWork } = useSession();
  const { tasks } = useTasks();
  const [elapsed, setElapsed] = useState(0);
  const [breakElapsed, setBreakElapsed] = useState(0);

  useEffect(() => {
    if (!activeSession) { setElapsed(0); return; }
    const tick = () => {
      const start = new Date(activeSession.start_time).getTime();
      setElapsed(Date.now() - start);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  useEffect(() => {
    if (!isOnBreak || !breakStart) { setBreakElapsed(0); return; }
    const tick = () => setBreakElapsed(Date.now() - breakStart.getTime());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isOnBreak, breakStart]);

  const totalBreakMs = (activeSession?.break_time || 0) * 60000 + breakElapsed;
  const workingMs = elapsed - totalBreakMs;

  const todayTasks = tasks.filter(t => new Date(t.created_at).toDateString() === new Date().toDateString());
  const canStartWork = todayTasks.length >= 3;

  const handleStartWork = () => {
    if (todayTasks.length < 3) {
      toast.error('You must add at least 3 tasks for today before starting work.');
      return;
    }
    startWork();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Play className="h-5 w-5 text-primary" />
          Session Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!activeSession ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              {canStartWork ? "Ready to start your workday?" : "You must add at least 3 tasks to start your workday."}
            </p>
            <Button onClick={handleStartWork} size="lg" className="gap-2" disabled={!canStartWork}>
              <Play className="h-4 w-4" /> Start Work
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Working</p>
                <p className="text-2xl font-mono font-bold text-foreground">
                  {formatDuration(Math.max(0, workingMs))}
                </p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Break</p>
                <p className="text-2xl font-mono font-bold text-muted-foreground">
                  {formatDuration(totalBreakMs)}
                </p>
              </div>
            </div>
            {isOnBreak && (
              <div className="text-center p-2 bg-accent/10 rounded-lg">
                <p className="text-sm text-accent font-medium flex items-center justify-center gap-1">
                  <Coffee className="h-4 w-4" /> On break...
                </p>
              </div>
            )}
            <div className="flex gap-2">
              {!isOnBreak ? (
                <Button onClick={startBreak} variant="outline" className="flex-1 gap-2">
                  <Coffee className="h-4 w-4" /> Break
                </Button>
              ) : (
                <Button onClick={endBreak} variant="outline" className="flex-1 gap-2">
                  <Pause className="h-4 w-4" /> End Break
                </Button>
              )}
              <Button onClick={endWork} variant="destructive" className="flex-1 gap-2">
                <Square className="h-4 w-4" /> End Work
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
