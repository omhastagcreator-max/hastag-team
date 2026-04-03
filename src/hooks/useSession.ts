import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SessionData {
  id: string;
  start_time: string;
  end_time: string | null;
  break_time: number;
}

export function useSession() {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<SessionData | null>(null);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakStart, setBreakStart] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveSession = useCallback(async () => {
    if (!user) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .is('end_time', null)
      .gte('start_time', today.toISOString())
      .order('start_time', { ascending: false })
      .limit(1)
      .single();
    
    setActiveSession(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchActiveSession();
  }, [fetchActiveSession]);

  const startWork = async () => {
    if (!user || activeSession) return;
    const { data } = await supabase
      .from('sessions')
      .insert({ user_id: user.id })
      .select()
      .single();
    if (data) setActiveSession(data);
  };

  const startBreak = () => {
    if (!activeSession || isOnBreak) return;
    setIsOnBreak(true);
    setBreakStart(new Date());
  };

  const endBreak = async () => {
    if (!activeSession || !isOnBreak || !breakStart) return;
    const breakMinutes = Math.round((Date.now() - breakStart.getTime()) / 60000);
    const newBreakTime = activeSession.break_time + breakMinutes;
    
    await supabase
      .from('sessions')
      .update({ break_time: newBreakTime })
      .eq('id', activeSession.id);
    
    setActiveSession({ ...activeSession, break_time: newBreakTime });
    setIsOnBreak(false);
    setBreakStart(null);
  };

  const endWork = async () => {
    if (!activeSession) return;
    if (isOnBreak) await endBreak();
    
    const now = new Date().toISOString();
    await supabase
      .from('sessions')
      .update({ end_time: now })
      .eq('id', activeSession.id);
    
    setActiveSession(null);
  };

  return {
    activeSession,
    isOnBreak,
    breakStart,
    loading,
    startWork,
    startBreak,
    endBreak,
    endWork,
    refreshSession: fetchActiveSession,
  };
}
