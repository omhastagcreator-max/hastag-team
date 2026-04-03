import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Video } from 'lucide-react';
import { JitsiMeeting } from '@jitsi/react-sdk';

export default function WorkRoom() {
  return (
    <AppLayout requiredRole="employee">
      <div className="max-w-6xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Video className="h-6 w-6 text-primary" />
          Work Room
        </h1>
        <Card className="overflow-hidden">
          <CardContent className="p-0" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
            <JitsiMeeting
              domain="meet.jit.si"
              roomName="agency-work-room"
              configOverwrite={{
                startWithAudioMuted: true,
                disableModeratorIndicator: true,
                startScreenSharing: true,
                enableEmailInStats: false
              }}
              interfaceConfigOverwrite={{
                DISABLE_JOIN_LEAVE_NOTIFICATIONS: true
              }}
              getIFrameRef={(iframeRef) => {
                iframeRef.style.height = '100%';
                iframeRef.style.width = '100%';
              }}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
