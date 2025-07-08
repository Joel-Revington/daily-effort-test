import { supabase } from '@/integrations/supabase/client';
import type { 
  DailyReport, 
  Task, 
  Software, 
  Lead, 
  KPIEntry, 
  SkillEvaluation, 
  SkillRequest, 
  FeedbackRequest,
  Profile 
} from './supabase-types';

// Helper function to check if user is admin
export const isAdmin = async (userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  
  return data?.role === 'admin' || data?.role === 'super_admin';
};

// Daily Reports API
export const dailyReportsApi = {
  async getAll(userId?: string): Promise<DailyReport[]> {
    let query = supabase.from('daily_reports').select('*');
    
    if (userId && !(await isAdmin(userId))) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query.order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getByDateRange(startDate: string, endDate: string, userId?: string): Promise<DailyReport[]> {
    let query = supabase
      .from('daily_reports')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (userId && !(await isAdmin(userId))) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query.order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(report: Omit<DailyReport, 'id' | 'created_at' | 'updated_at'>): Promise<DailyReport> {
    const { data, error } = await supabase
      .from('daily_reports')
      .insert(report)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<DailyReport>): Promise<DailyReport> {
    const { data, error } = await supabase
      .from('daily_reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('daily_reports')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Tasks API
export const tasksApi = {
  async getAll(userId?: string): Promise<Task[]> {
    let query = supabase.from('tasks').select('*');
    
    if (userId && !(await isAdmin(userId))) {
      query = query.eq('assignee_id', userId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: number, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Software API
export const softwareApi = {
  async getAll(): Promise<Software[]> {
    const { data, error } = await supabase
      .from('software')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async create(software: Omit<Software, 'id' | 'created_at' | 'updated_at'>): Promise<Software> {
    const { data, error } = await supabase
      .from('software')
      .insert(software)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Software>): Promise<Software> {
    const { data, error } = await supabase
      .from('software')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('software')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Leads API
export const leadsApi = {
  async getAll(userId?: string): Promise<Lead[]> {
    let query = supabase.from('leads').select('*');
    
    if (userId && !(await isAdmin(userId))) {
      query = query.eq('assigned_to_id', userId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead> {
    const { data, error } = await supabase
      .from('leads')
      .insert(lead)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Lead>): Promise<Lead> {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// KPI Entries API
export const kpiApi = {
  async getAll(userId?: string): Promise<KPIEntry[]> {
    let query = supabase.from('kpi_entries').select('*');
    
    if (userId && !(await isAdmin(userId))) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query.order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(entry: Omit<KPIEntry, 'id' | 'created_at' | 'updated_at'>): Promise<KPIEntry> {
    const { data, error } = await supabase
      .from('kpi_entries')
      .insert(entry)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<KPIEntry>): Promise<KPIEntry> {
    const { data, error } = await supabase
      .from('kpi_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Skill Evaluations API
export const skillEvaluationsApi = {
  async getAll(userId?: string): Promise<SkillEvaluation[]> {
    let query = supabase.from('skill_evaluations').select('*');
    
    if (userId && !(await isAdmin(userId))) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  async upsert(evaluation: Omit<SkillEvaluation, 'id' | 'created_at' | 'updated_at'>): Promise<SkillEvaluation> {
    const { data, error } = await supabase
      .from('skill_evaluations')
      .upsert(evaluation, { onConflict: 'user_id,software_id' })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Skill Requests API
export const skillRequestsApi = {
  async getAll(userId?: string): Promise<SkillRequest[]> {
    let query = supabase.from('skill_requests').select('*');
    
    if (userId && !(await isAdmin(userId))) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query.order('requested_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(request: Omit<SkillRequest, 'id' | 'requested_at'>): Promise<SkillRequest> {
    const { data, error } = await supabase
      .from('skill_requests')
      .insert(request)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<SkillRequest>): Promise<SkillRequest> {
    const { data, error } = await supabase
      .from('skill_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Feedback Requests API
export const feedbackRequestsApi = {
  async create(request: Omit<FeedbackRequest, 'id' | 'sent_at'>): Promise<FeedbackRequest> {
    const { data, error } = await supabase
      .from('feedback_requests')
      .insert(request)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Profiles API
export const profilesApi = {
  async getAll(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name');
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  }
};