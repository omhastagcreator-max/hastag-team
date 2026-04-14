import { useEffect, useRef } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { CardContent } from '@/components/ui/card';
import { Video } from 'lucide-react';
import { PageTransition } from '@/components/ui/PageTransition';
import { MotionCard } from '@/components/ui/MotionCard';
import { useAuth } from '@/contexts/AuthContext';

export default function WorkRoom() {
  const { profile } = useAuth();
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);

  useEffect(() => {
    // Cleanup any existing instance (deals with React 18 strict mode double-mounts)
    if (jitsiApiRef.current) return;

    const loadJitsiScript = () => {
      const script = document.createElement('script');
      script.src = 'https://8x8.vc/vpaas-magic-cookie-ea738a18dfd84cb5a3ac1925aa61ea3b/external_api.js';
      script.async = true;
      script.onload = () => {
        if (!(window as any).JitsiMeetExternalAPI || !jitsiContainerRef.current) return;
        
        jitsiApiRef.current = new (window as any).JitsiMeetExternalAPI("8x8.vc", {
          roomName: "vpaas-magic-cookie-ea738a18dfd84cb5a3ac1925aa61ea3b/SampleAppCertainLungsFailConsiderably",
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: profile?.name || 'Authorized Member'
          },
          configOverwrite: {
            startWithAudioMuted: true,
            disableModeratorIndicator: true
          }
        });
      };
      
      document.body.appendChild(script);
      return script;
    };

    const scriptElement = loadJitsiScript();

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
      if (document.body.contains(scriptElement)) {
        document.body.removeChild(scriptElement);
      }
    };
  }, [profile?.name]);

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
              <div ref={jitsiContainerRef} className="w-full h-full bg-black/90 flex items-center justify-center">
                {/* Jitsi SDK will inject the iframe here natively */}
                {!jitsiApiRef.current && <div className="text-muted-foreground animate-pulse">Initializing JaaS Secure Room...</div>}
              </div>
            </CardContent>
          </MotionCard>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
