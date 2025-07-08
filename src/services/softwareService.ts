import { supabase } from '@/integrations/supabase/client';

export interface Software {
  id: string;
  name: string;
  category: string;
  domain: 'MFG' | 'AEC' | 'Common';
  created_at: string;
  updated_at: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  software_id: string;
  demo_level: 'Not Started' | 'Basic' | 'Advanced' | 'POC';
  training_level: 'Not Started' | 'Basic' | 'Advanced' | 'Handholding';
  implementation_level: 'No' | 'Yes';
  event_presentation_level: 'No' | 'Yes';
  created_at: string;
  updated_at: string;
  software?: Software;
  user?: {
    full_name: string;
  };
}

export interface SkillRequest {
  id: string;
  user_id: string;
  software_id: string;
  category: string;
  requested_level: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by_id: string | null;
  approved_at: string | null;
  created_at: string;
  software?: Software;
  user?: {
    full_name: string;
  };
  approved_by?: {
    full_name: string;
  };
}

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
      .insert({
        ...software,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSoftware(id: string, updates: Partial<Software>): Promise<Software> {
    const { data, error } = await supabase
      .from('software')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
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
  },

  async getUserSkills(userId: string): Promise<UserSkill[]> {
    const { data, error } = await supabase
      .from('user_skills')
      .select(`
        *,
        software(*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  },

  async getAllUserSkills(): Promise<UserSkill[]> {
    const { data, error } = await supabase
      .from('user_skills')
      .select(`
        *,
        software(*),
        user:profiles(full_name)
      `);

    if (error) throw error;
    return data || [];
  },

  async upsertUserSkill(skill: Omit<UserSkill, 'id' | 'created_at' | 'updated_at' | 'software' | 'user'>): Promise<UserSkill> {
    const { data, error } = await supabase
      .from('user_skills')
      .upsert({
        ...skill,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,software_id'
      })
      .select(`
        *,
        software(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async createSkillRequest(request: Omit<SkillRequest, 'id' | 'created_at' | 'software' | 'user' | 'approved_by'>): Promise<SkillRequest> {
    const { data, error } = await supabase
      .from('skill_requests')
      .insert({
        ...request,
        created_at: new Date().toISOString(),
      })
      .select(`
        *,
        software(*),
        user:profiles!skill_requests_user_id_fkey(full_name)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async getSkillRequests(userId?: string): Promise<SkillRequest[]> {
    let query = supabase
      .from('skill_requests')
      .select(`
        *,
        software(*),
        user:profiles!skill_requests_user_id_fkey(full_name),
        approved_by:profiles!skill_requests_approved_by_id_fkey(full_name)
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async updateSkillRequest(id: string, updates: Partial<SkillRequest>): Promise<SkillRequest> {
    const { data, error } = await supabase
      .from('skill_requests')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        software(*),
        user:profiles!skill_requests_user_id_fkey(full_name),
        approved_by:profiles!skill_requests_approved_by_id_fkey(full_name)
      `)
      .single();

    if (error) throw error;
    return data;
  },
};