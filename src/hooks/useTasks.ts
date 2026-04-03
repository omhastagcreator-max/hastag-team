import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Task {
  id: string;
  title: string;
  category: string | null;
  status: string;
  time_spent: number | null;
  task_type: string;
  created_at: string;
  assigned_to: string | null;
  assigned_by: string | null;
  project_id: string | null;
}

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    
    // Fetch all tasks assigned to the employee
    const { data } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('assigned_to', user.id)
      .order('created_at', { ascending: false });
    
    setTasks(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (task: { title: string; category?: string; time_spent?: number; status?: string }) => {
    if (!user) return;
    const { data } = await supabase
      .from('project_tasks')
      .insert({
        assigned_to: user.id,
        title: task.title,
        category: task.category || null,
        time_spent: task.time_spent || null,
        status: task.status || 'pending',
        task_type: 'personal', // By default, adding from task list makes it personal
      })
      .select()
      .single();
    if (data) setTasks((prev) => [data, ...prev]);
    return data;
  };

  const updateTask = async (id: string, updates: Partial<Pick<Task, 'title' | 'category' | 'status' | 'time_spent'>>) => {
    const { data } = await supabase
      .from('project_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (data) setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
  };

  const deleteTask = async (id: string) => {
    await supabase.from('project_tasks').delete().eq('id', id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return { tasks, loading, addTask, updateTask, deleteTask, refresh: fetchTasks };
}
