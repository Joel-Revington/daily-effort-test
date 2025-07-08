import { supabase } from '@/integrations/supabase/client';
import type { 
  Profile, 
  Software, 
  DailyReport, 
  ReportActivity, 
  Task, 
  TaskComment, 
  UserSkill, 
  SkillRequest, 
  KPIEntry, 
  SalesLead, 
  FeedbackRequest,
  UserRole,
  DomainType,
  TaskStatus,
  TaskPriority,
  TaskType,
  LeadStatus,
  SkillLevel,
  RequestStatus
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

// Profile operations
export const profileService = {
  async getCurrentProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  async getAllProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name');

    if (error) throw error;
    return data || [];
  },

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Software operations
export const softwareService = {
  async getAllSoftware(): Promise<Software[]> {
    const { data, error } = await supabase
      .from('software')
      .select('*')
      .order('domain', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createSoftware(software: Omit<Software, 'id' | 'created_at' | 'updated_at'>): Promise<Software> {
    const { data, error } = await supabase
      .from('software')
      .insert(software)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteSoftware(id: string): Promise<void> {
    const { error } = await supabase
      .from('software')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Daily reports operations
export const dailyReportService = {
  async getUserReports(userId: string, startDate?: string, endDate?: string): Promise<DailyReport[]> {
    let query = supabase
      .from('daily_reports')
      .select(`
        *,
        activities:report_activities(*),
        user:profiles(*)
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getAllReports(startDate?: string, endDate?: string): Promise<DailyReport[]> {
    let query = supabase
      .from('daily_reports')
      .select(`
        *,
        activities:report_activities(*),
        user:profiles(*)
      `)
      .order('date', { ascending: false });

    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async createOrUpdateReport(report: Omit<DailyReport, 'id' | 'created_at' | 'updated_at'>, activities: Omit<ReportActivity, 'id' | 'report_id' | 'created_at'>[]): Promise<DailyReport> {
    // First, create or update the report
    const { data: reportData, error: reportError } = await supabase
      .from('daily_reports')
      .upsert(report, { onConflict: 'user_id,date' })
      .select()
      .single();

    if (reportError) throw reportError;

    // Delete existing activities
    await supabase
      .from('report_activities')
      .delete()
      .eq('report_id', reportData.id);

    // Insert new activities
    if (activities.length > 0) {
      const activitiesWithReportId = activities.map(activity => ({
        ...activity,
        report_id: reportData.id
      }));

      const { error: activitiesError } = await supabase
        .from('report_activities')
        .insert(activitiesWithReportId);

      if (activitiesError) throw activitiesError;
    }

    return reportData;
  },

  async getReportByUserAndDate(userId: string, date: string): Promise<DailyReport | null> {
    const { data, error } = await supabase
      .from('daily_reports')
      .select(`
        *,
        activities:report_activities(*)
      `)
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
};

// Task operations
export const taskService = {
  async getUserTasks(userId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:profiles!tasks_assignee_id_fkey(*),
        assigned_by:profiles!tasks_assigned_by_id_fkey(*),
        comments:task_comments(*, author:profiles(*))
      `)
      .eq('assignee_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getAllTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:profiles!tasks_assignee_id_fkey(*),
        assigned_by:profiles!tasks_assigned_by_id_fkey(*),
        comments:task_comments(*, author:profiles(*))
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select(`
        *,
        assignee:profiles!tasks_assignee_id_fkey(*),
        assigned_by:profiles!tasks_assigned_by_id_fkey(*)
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
        assignee:profiles!tasks_assignee_id_fkey(*),
        assigned_by:profiles!tasks_assigned_by_id_fkey(*),
        comments:task_comments(*, author:profiles(*))
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async addComment(taskId: string, authorId: string, comment: string): Promise<TaskComment> {
    const { data, error } = await supabase
      .from('task_comments')
      .insert({
        task_id: taskId,
        author_id: authorId,
        comment
      })
      .select(`
        *,
        author:profiles(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }
};

// User skills operations
export const userSkillService = {
  async getUserSkills(userId: string): Promise<UserSkill[]> {
    const { data, error } = await supabase
      .from('user_skills')
      .select(`
        *,
        software:software(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getAllUserSkills(): Promise<UserSkill[]> {
    const { data, error } = await supabase
      .from('user_skills')
      .select(`
        *,
        software:software(*),
        user:profiles(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async upsertUserSkill(skill: Omit<UserSkill, 'id' | 'created_at' | 'updated_at'>): Promise<UserSkill> {
    const { data, error } = await supabase
      .from('user_skills')
      .upsert(skill, { onConflict: 'user_id,software_id' })
      .select(`
        *,
        software:software(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }
};

// Skill requests operations
export const skillRequestService = {
  async getUserSkillRequests(userId: string): Promise<SkillRequest[]> {
    const { data, error } = await supabase
      .from('skill_requests')
      .select(`
        *,
        software:software(*),
        approved_by:profiles!skill_requests_approved_by_id_fkey(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getAllSkillRequests(): Promise<SkillRequest[]> {
    const { data, error } = await supabase
      .from('skill_requests')
      .select(`
        *,
        user:profiles!skill_requests_user_id_fkey(*),
        software:software(*),
        approved_by:profiles!skill_requests_approved_by_id_fkey(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createSkillRequest(request: Omit<SkillRequest, 'id' | 'created_at' | 'status' | 'approved_by_id' | 'approved_at'>): Promise<SkillRequest> {
    const { data, error } = await supabase
      .from('skill_requests')
      .insert(request)
      .select(`
        *,
        software:software(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async updateSkillRequest(id: string, updates: Partial<SkillRequest>): Promise<SkillRequest> {
    const { data, error } = await supabase
      .from('skill_requests')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        user:profiles!skill_requests_user_id_fkey(*),
        software:software(*),
        approved_by:profiles!skill_requests_approved_by_id_fkey(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }
};

// KPI operations
export const kpiService = {
  async getUserKPIEntries(userId: string, startDate?: string, endDate?: string): Promise<KPIEntry[]> {
    let query = supabase
      .from('kpi_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getAllKPIEntries(startDate?: string, endDate?: string): Promise<KPIEntry[]> {
    let query = supabase
      .from('kpi_entries')
      .select(`
        *,
        user:profiles(*)
      `)
      .order('date', { ascending: false });

    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async createOrUpdateKPIEntry(entry: Omit<KPIEntry, 'id' | 'created_at'>): Promise<KPIEntry> {
    const { data, error } = await supabase
      .from('kpi_entries')
      .upsert(entry, { onConflict: 'user_id,date' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Sales leads operations
export const salesLeadService = {
  async getUserLeads(userId: string): Promise<SalesLead[]> {
    const { data, error } = await supabase
      .from('sales_leads')
      .select(`
        *,
        assigned_to:profiles(*)
      `)
      .eq('assigned_to_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getAllLeads(): Promise<SalesLead[]> {
    const { data, error } = await supabase
      .from('sales_leads')
      .select(`
        *,
        assigned_to:profiles(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createLead(lead: Omit<SalesLead, 'id' | 'created_at' | 'updated_at'>): Promise<SalesLead> {
    const { data, error } = await supabase
      .from('sales_leads')
      .insert(lead)
      .select(`
        *,
        assigned_to:profiles(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async updateLead(id: string, updates: Partial<SalesLead>): Promise<SalesLead> {
    const { data, error } = await supabase
      .from('sales_leads')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        assigned_to:profiles(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async deleteLead(id: string): Promise<void> {
    const { error } = await supabase
      .from('sales_leads')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Feedback requests operations
export const feedbackService = {
  async createFeedbackRequest(request: Omit<FeedbackRequest, 'id' | 'created_at'>): Promise<FeedbackRequest> {
    const { data, error } = await supabase
      .from('feedback_requests')
      .insert(request)
      .select(`
        *,
        task:tasks(*),
        requested_by:profiles(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async getUserFeedbackRequests(userId: string): Promise<FeedbackRequest[]> {
    const { data, error } = await supabase
      .from('feedback_requests')
      .select(`
        *,
        task:tasks(*),
        requested_by:profiles(*)
      `)
      .eq('requested_by_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};

// Real-time subscriptions
export const subscribeToTable = (table: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`public:${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
    .subscribe();
};