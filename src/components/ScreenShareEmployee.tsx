import { useWebRTCSender } from '@/hooks/useWebRTC';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { MonitorUp, MonitorOff } from 'lucide-react';
import { MotionCard } from '@/components/ui/MotionCard';
import { CardContent } from '@/components/ui/card';

export function ScreenShareEmployee() {
  const { user } = useAuth();
  
  // We only run this if user exists, safely conditionally calling hooks is tricky, 
  // but since an Employee is always logged in here, user.id is safe.
  const { startSharing, stopSharing, isSharing } = useWebRTCSender(user?.id || '');

  if (!user) return null;

  return (
    <MotionCard delay={0.1} className={`border ${isSharing ? 'border-green-500/50 shadow-green-500/20 shadow-lg' : 'border-border/50'}`}>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isSharing ? 'bg-green-500/20 text-green-500 animate-pulse' : 'bg-muted text-muted-foreground'}`}>
            {isSharing ? <MonitorUp className="h-5 w-5" /> : <MonitorOff className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="font-semibold text-sm">Screen Sharing</h3>
            <p className="text-xs text-muted-foreground">
              {isSharing ? 'Your screen is currently live and viewable by Admins.' : 'Screen share is off. Admins cannot see your screen.'}
            </p>
          </div>
        </div>
        
        <Button 
          variant={isSharing ? "destructive" : "default"} 
          onClick={isSharing ? stopSharing : startSharing}
          className="gap-2 shadow-sm transition-all"
        >
          {isSharing ? (
            <>Stop Sharing <MonitorOff className="h-4 w-4" /></>
          ) : (
            <>Start Sharing <MonitorUp className="h-4 w-4" /></>
          )}
        </Button>
      </CardContent>
    </MotionCard>
  );
}
