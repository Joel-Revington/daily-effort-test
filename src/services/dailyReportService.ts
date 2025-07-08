import { supabase } from '@/integrations/supabase/client';

export interface DailyReport {
  id: string;
  user_id: string;
  date: string;
  attendance_status: string;
  general_notes: string;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  activities?: ReportActivity[];
  user_profile?: {
    full_name: string;
    role: string;
  };
}

export interface ReportActivity {
  id: string;
  report_id: string;
  category: string;
  from_time: string;
  to_time: string;
  hours: number;
  notes: string;
  is_billable: boolean;
  created_at: string;
}

export const dailyReportService = {
  async getReports(userId?: string, startDate?: string, endDate?: string): Promise<DailyReport[]> {
    let query = supabase
      .from('daily_reports')
      .select(`
        *,
        activities:report_activities(*),
        user_profile:profiles(full_name, role)
      `)
      .order('date', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
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
  },

  async createReport(report: Omit<DailyReport, 'id' | 'created_at' | 'updated_at'>): Promise<DailyReport> {
    const { data, error } = await supabase
      .from('daily_reports')
      .insert({
        ...report,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateReport(id: string, updates: Partial<DailyReport>): Promise<DailyReport> {
    const { data, error } = await supabase
      .from('daily_reports')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async upsertReport(report: Omit<DailyReport, 'id' | 'created_at' | 'updated_at'>): Promise<DailyReport> {
    const { data, error } = await supabase
      .from('daily_reports')
      .upsert({
        ...report,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,date'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addActivity(activity: Omit<ReportActivity, 'id' | 'created_at'>): Promise<ReportActivity> {
    const { data, error } = await supabase
      .from('report_activities')
      .insert({
        ...activity,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateActivity(id: string, updates: Partial<ReportActivity>): Promise<ReportActivity> {
    const { data, error } = await supabase
      .from('report_activities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteActivity(id: string): Promise<void> {
    const { error } = await supabase
      .from('report_activities')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async clearActivities(reportId: string): Promise<void> {
    const { error } = await supabase
      .from('report_activities')
      .delete()
      .eq('report_id', reportId);

    if (error) throw error;
  },
};