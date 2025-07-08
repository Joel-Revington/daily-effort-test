import { supabase } from '@/integrations/supabase/client';

export interface KPIEntry {
  id: string;
  user_id: string;
  date: string;
  customer_satisfaction: number;
  timely_delivery: number;
  certifications: string;
  lead_generation: number;
  dcr_maintenance: number;
  technical_escalations: number;
  notes: string;
  created_at: string;
  user?: {
    full_name: string;
  };
}

export const kpiService = {
  async getKPIEntries(userId?: string, startDate?: string, endDate?: string): Promise<KPIEntry[]> {
    let query = supabase
      .from('kpi_entries')
      .select(`
        *,
        user:profiles(full_name)
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

  async getKPIEntryByUserAndDate(userId: string, date: string): Promise<KPIEntry | null> {
    const { data, error } = await supabase
      .from('kpi_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createKPIEntry(entry: Omit<KPIEntry, 'id' | 'created_at' | 'user'>): Promise<KPIEntry> {
    const { data, error } = await supabase
      .from('kpi_entries')
      .insert({
        ...entry,
        created_at: new Date().toISOString(),
      })
      .select(`
        *,
        user:profiles(full_name)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async updateKPIEntry(id: string, updates: Partial<KPIEntry>): Promise<KPIEntry> {
    const { data, error } = await supabase
      .from('kpi_entries')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        user:profiles(full_name)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async upsertKPIEntry(entry: Omit<KPIEntry, 'id' | 'created_at' | 'user'>): Promise<KPIEntry> {
    const { data, error } = await supabase
      .from('kpi_entries')
      .upsert(entry, {
        onConflict: 'user_id,date'
      })
      .select(`
        *,
        user:profiles(full_name)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async deleteKPIEntry(id: string): Promise<void> {
    const { error } = await supabase
      .from('kpi_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};