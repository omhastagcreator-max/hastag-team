import { AppLayout } from '@/components/AppLayout';
import { CardContent } from '@/components/ui/card';
import { Video } from 'lucide-react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { PageTransition } from '@/components/ui/PageTransition';
import { MotionCard } from '@/components/ui/MotionCard';

export default function WorkRoom() {
  return (
    <AppLayout requiredRole="employee">
      <PageTransition>
        <div className="max-w-6xl mx-auto space-y-4">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 flex items-center gap-2 drop-shadow-sm">
            <Video className="h-8 w-8 text-primary animate-pulse" />
            Work Room
          </h1>
          <MotionCard delay={0.1} className="overflow-hidden border-border/50">
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
          </MotionCard>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
