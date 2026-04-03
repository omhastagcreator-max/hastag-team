import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video } from 'lucide-react';

export default function WorkRoom() {
  return (
    <AppLayout requiredRole="employee">
      <div className="max-w-6xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Video className="h-6 w-6 text-primary" />
          Work Room
        </h1>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <iframe
              src="https://meet.jit.si/agency-work-room"
              className="w-full border-0"
              style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              title="Agency Work Room"
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
