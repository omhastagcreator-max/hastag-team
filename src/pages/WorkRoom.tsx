import { AppLayout } from '@/components/AppLayout';
import { CardContent } from '@/components/ui/card';
import { Video } from 'lucide-react';
import { PageTransition } from '@/components/ui/PageTransition';
import { MotionCard } from '@/components/ui/MotionCard';
import { useAuth } from '@/contexts/AuthContext';

export default function WorkRoom() {
  const { profile } = useAuth();
  const roomName = `agency-work-room-global-hub`;

  return (
    <AppLayout>
      <PageTransition>
        <div className="max-w-6xl mx-auto space-y-4">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 flex items-center gap-2 drop-shadow-sm">
            <Video className="h-8 w-8 text-primary animate-pulse" />
            Work Room
          </h1>
          <MotionCard delay={0.1} className="overflow-hidden border-border/50">
            <CardContent className="p-0" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
              <iframe
                src={`https://meet.jit.si/${roomName}#userInfo.displayName="${encodeURIComponent(profile?.name || 'Authorized Member')}"&config.startWithAudioMuted=true&config.disableModeratorIndicator=true&config.startScreenSharing=true&interfaceConfig.DISABLE_JOIN_LEAVE_NOTIFICATIONS=true`}
                allow="camera; microphone; fullscreen; display-capture"
                style={{ width: '100%', height: '100%', border: '0px' }}
                title="Secure Work Room"
              />
            </CardContent>
          </MotionCard>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
