import { supabase } from '@/integrations/supabase/client';

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee_id: string | null;
  assigned_by_id: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'escalated';
  type: 'billable' | 'non-billable';
  category: string;
  client: string | null;
  due_date: string;
  due_time: string | null;
  estimated_hours: number;
  actual_hours: number;
  tags: string[];
  task_type: string;
  started_at: string | null;
  completed_at: string | null;
  is_overdue: boolean;
  overdue_minutes: number;
  escalation_reason: string | null;
  created_at: string;
  updated_at: string;
  assignee?: {
    full_name: string;
  };
  assigned_by?: {
    full_name: string;
  };
  comments?: TaskComment[];
}

export interface TaskComment {
  id: string;
  task_id: string;
  author_id: string;
  comment_text: string;
  created_at: string;
  author?: {
    full_name: string;
  };
}

export const taskService = {
  async getTasks(userId?: string): Promise<Task[]> {
    let query = supabase
      .from('tasks')
      .select(`
        *,
        assignee:profiles!tasks_assignee_id_fkey(full_name),
        assigned_by:profiles!tasks_assigned_by_id_fkey(full_name),
        comments:task_comments(
          *,
          author:profiles(full_name)
        )
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('assignee_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getTaskById(id: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:profiles!tasks_assignee_id_fkey(full_name),
        assigned_by:profiles!tasks_assigned_by_id_fkey(full_name),
        comments:task_comments(
          *,
          author:profiles(full_name)
        )
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'assignee' | 'assigned_by' | 'comments'>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...task,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(`
        *,
        assignee:profiles!tasks_assignee_id_fkey(full_name),
        assigned_by:profiles!tasks_assigned_by_id_fkey(full_name)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        assignee:profiles!tasks_assignee_id_fkey(full_name),
        assigned_by:profiles!tasks_assigned_by_id_fkey(full_name)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async addComment(comment: Omit<TaskComment, 'id' | 'created_at' | 'author'>): Promise<TaskComment> {
    const { data, error } = await supabase
      .from('task_comments')
      .insert({
        ...comment,
        created_at: new Date().toISOString(),
      })
      .select(`
        *,
        author:profiles(full_name)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async getTasksForDate(date: string, userId?: string): Promise<Task[]> {
    let query = supabase
      .from('tasks')
      .select(`
        *,
        assignee:profiles!tasks_assignee_id_fkey(full_name),
        assigned_by:profiles!tasks_assigned_by_id_fkey(full_name)
      `)
      .eq('due_date', date);

    if (userId) {
      query = query.eq('assignee_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },
};