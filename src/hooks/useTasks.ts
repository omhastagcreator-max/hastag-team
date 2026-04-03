import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Task {
  id: string;
  title: string;
  category: string | null;
  status: string;
  time_spent: number | null;
  created_at: string;
  user_id: string;
}

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodayTasks = useCallback(async () => {
    if (!user) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false });
    
    setTasks(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTodayTasks();
  }, [fetchTodayTasks]);

  const addTask = async (task: { title: string; category?: string; time_spent?: number; status?: string }) => {
    if (!user) return;
    const { data } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: task.title,
        category: task.category || null,
        time_spent: task.time_spent || null,
        status: task.status || 'Ongoing',
      })
      .select()
      .single();
    if (data) setTasks((prev) => [data, ...prev]);
    return data;
  };

  const updateTask = async (id: string, updates: Partial<Pick<Task, 'title' | 'category' | 'status' | 'time_spent'>>) => {
    const { data } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (data) setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
  };

  const deleteTask = async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return { tasks, loading, addTask, updateTask, deleteTask, refresh: fetchTodayTasks };
}
