import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWebRTCReceiver } from '@/hooks/useWebRTC';
import { useAuth } from '@/contexts/AuthContext';
import { MotionCard } from '@/components/ui/MotionCard';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MonitorPlay, MonitorX, X } from 'lucide-react';

interface EmployeeSession {
  user_id: string;
  name: string;
  isSharing: boolean;
}

export function AdminScreenMonitor() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<EmployeeSession[]>([]);
  const [activeViewTarget, setActiveViewTarget] = useState<string | null>(null);
  
  const { viewScreen, stopViewing, remoteStream, isConnecting } = useWebRTCReceiver(user?.id || '');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Only bind the stream to the video element if we have one
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    const fetchEmployeesAndStatus = async () => {
      // 1. Get employees
      const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'employee');
      if (!roles) return;
      const empIds = roles.map(r => r.user_id);

      const { data: profiles } = await supabase.from('profiles').select('user_id, name').in('user_id', empIds);
      if (!profiles) return;

      // 2. Get active sessions
      const { data: sessions } = await supabase.from('screen_sessions').select('user_id, status');
      
      const mapped = profiles.map(p => {
         const session = sessions?.find(s => s.user_id === p.user_id);
         return {
           user_id: p.user_id,
           name: p.name || 'Unknown',
           isSharing: session?.status === 'active'
         };
      });
      
      setEmployees(mapped);
    };

    fetchEmployeesAndStatus();

    // 3. Listen for real-time status updates explicitly on screen_sessions
    const channel = supabase.channel(`screen_sessions_changes_${Math.random()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'screen_sessions' }, payload => {
          setEmployees(prev => prev.map(emp => {
             if (payload.new && emp.user_id === (payload.new as any).user_id) {
                return { ...emp, isSharing: (payload.new as any).status === 'active' };
             }
             return emp;
          }));
          
          // Auto-stop viewing if they shut it off
          if (payload.new && activeViewTarget === (payload.new as any).user_id && (payload.new as any).status === 'stopped') {
             stopViewing();
             setActiveViewTarget(null);
          }
      }).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeViewTarget]);

  if (!user) return null;

  return (
    <div className="space-y-6">
       {/* ACTIVE STREAM PLAYER */}
       {activeViewTarget && (
         <MotionCard className="border-primary/50 shadow-lg shadow-primary/10 overflow-hidden bg-black/5">
           <CardHeader className="bg-muted/50 border-b flex flex-row items-center justify-between pb-3">
             <CardTitle className="text-lg flex items-center gap-2">
                <MonitorPlay className="h-5 w-5 text-primary animate-pulse" />
                Live: {employees.find(e => e.user_id === activeViewTarget)?.name}
             </CardTitle>
             <Button variant="ghost" size="icon" onClick={() => { stopViewing(); setActiveViewTarget(null); }}>
               <X className="h-5 w-5" />
             </Button>
           </CardHeader>
           <CardContent className="p-0">
             <div className="relative aspect-video bg-black/90 flex items-center justify-center">
               {isConnecting && !remoteStream && (
                 <div className="text-primary animate-pulse">Establishing Peer Connection...</div>
               )}
               <video 
                 ref={videoRef} 
                 autoPlay 
                 playsInline 
                 className={`w-full h-full object-contain ${!remoteStream ? 'hidden' : ''}`} 
               />
             </div>
           </CardContent>
         </MotionCard>
       )}

       {/* EMPLOYEE LIST */}
       <MotionCard delay={0.1}>
         <CardHeader>
           <CardTitle className="text-lg flex items-center gap-2"><MonitorPlay className="h-5 w-5" /> Team Screen Status</CardTitle>
         </CardHeader>
         <CardContent>
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
             {employees.map(emp => (
               <div key={emp.user_id} className={`p-4 border rounded-xl flex items-center justify-between transition-colors ${emp.isSharing ? 'border-green-500/50 bg-green-500/5' : 'border-border/50'}`}>
                 <div>
                   <h4 className="font-semibold">{emp.name}</h4>
                   <div className="flex items-center gap-2 mt-1">
                     {emp.isSharing ? (
                       <><div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /><span className="text-xs text-green-500 font-medium">Sharing</span></>
                     ) : (
                       <><div className="h-2 w-2 rounded-full bg-muted-foreground" /><span className="text-xs text-muted-foreground">Not Sharing</span></>
                     )}
                   </div>
                 </div>
                 <Button 
                    variant={emp.isSharing ? "default" : "secondary"} 
                    disabled={!emp.isSharing || activeViewTarget === emp.user_id}
                    onClick={() => {
                       setActiveViewTarget(emp.user_id);
                       viewScreen(emp.user_id);
                    }}
                    className={emp.isSharing ? 'bg-green-600 hover:bg-green-700' : ''}
                 >
                   View Mode
                 </Button>
               </div>
             ))}
             {employees.length === 0 && <p className="text-muted-foreground text-sm col-span-full">No employees found.</p>}
           </div>
         </CardContent>
       </MotionCard>
    </div>
  );
}
