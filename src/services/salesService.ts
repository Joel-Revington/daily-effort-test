import { supabase } from '@/integrations/supabase/client';

export interface SalesLead {
  id: string;
  company_name: string;
  contact_person: string;
  email: string | null;
  phone: string | null;
  lead_source: string;
  assigned_to_id: string | null;
  status: 'new' | 'contacted' | 'demo-scheduled' | 'demo-given' | 'quoted' | 'negotiation' | 'closed-won' | 'closed-lost';
  priority: 'Low' | 'Medium' | 'High';
  requirement: string;
  demo_date: string | null;
  demo_notes: string | null;
  quote_amount: number | null;
  quoted_date: string | null;
  quote_sent: boolean;
  order_value: number | null;
  closed_date: string | null;
  expected_close_date: string | null;
  lost_reason: string | null;
  follow_up: boolean;
  follow_up_date: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
  assigned_to?: {
    full_name: string;
  };
}

export const salesService = {
  async getLeads(userId?: string): Promise<SalesLead[]> {
    let query = supabase
      .from('sales_leads')
      .select(`
        *,
        assigned_to:profiles!sales_leads_assigned_to_id_fkey(full_name)
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('assigned_to_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getLeadById(id: string): Promise<SalesLead | null> {
    const { data, error } = await supabase
      .from('sales_leads')
      .select(`
        *,
        assigned_to:profiles!sales_leads_assigned_to_id_fkey(full_name)
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createLead(lead: Omit<SalesLead, 'id' | 'created_at' | 'updated_at' | 'assigned_to'>): Promise<SalesLead> {
    const { data, error } = await supabase
      .from('sales_leads')
      .insert({
        ...lead,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(`
        *,
        assigned_to:profiles!sales_leads_assigned_to_id_fkey(full_name)
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
        assigned_to:profiles!sales_leads_assigned_to_id_fkey(full_name)
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
  },

  async getLeadsByStatus(status: string, userId?: string): Promise<SalesLead[]> {
    let query = supabase
      .from('sales_leads')
      .select(`
        *,
        assigned_to:profiles!sales_leads_assigned_to_id_fkey(full_name)
      `)
      .eq('status', status);

    if (userId) {
      query = query.eq('assigned_to_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },
};