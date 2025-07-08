import { supabase } from '@/integrations/supabase/client';

export interface UserSkill {
  id?: string;
  user_id: string;
  software_id: string;
  demo_level: string;
  training_level: string;
  implementation_level: string;
  event_presentation_level: string;
  updated_at?: string;
  software?: { name: string; category: string; domain: string };
}

export interface SkillRequest {
  id?: string;
  user_id: string;
  software_id: string;
  category: string;
  requested_level: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by_id?: string;
  reviewed_at?: string;
  created_at?: string;
  software?: { name: string; category: string; domain: string };
  user?: { full_name: string; email: string };
  reviewed_by?: { full_name: string; email: string };
}

export interface Software {
  id?: string;
  name: string;
  category: string;
  domain: 'MFG' | 'AEC' | 'Common';
  created_at?: string;
}

class SkillService {
  // Software management
  async getAllSoftware(): Promise<Software[]> {
    const { data, error } = await supabase
      .from('software')
      .select('*')
      .order('domain', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createSoftware(software: Omit<Software, 'id' | 'created_at'>): Promise<Software> {
    const { data, error } = await supabase
      .from('software')
      .insert(software)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteSoftware(softwareId: string): Promise<void> {
    const { error } = await supabase
      .from('software')
      .delete()
      .eq('id', softwareId);

    if (error) throw error;
  }

  // User skills management
  async getUserSkills(userId: string): Promise<UserSkill[]> {
    const { data, error } = await supabase
      .from('user_skills')
      .select(`
        *,
        software:software(name, category, domain)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateUserSkill(userId: string, softwareId: string, skillData: Partial<UserSkill>): Promise<UserSkill> {
    const { data, error } = await supabase
      .from('user_skills')
      .upsert({
        user_id: userId,
        software_id: softwareId,
        ...skillData,
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        software:software(name, category, domain)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async getAllUserSkills(): Promise<UserSkill[]> {
    const { data, error } = await supabase
      .from('user_skills')
      .select(`
        *,
        software:software(name, category, domain),
        user:profiles(full_name, email)
      `)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Skill requests management
  async createSkillRequest(request: Omit<SkillRequest, 'id' | 'created_at'>): Promise<SkillRequest> {
    const { data, error } = await supabase
      .from('skill_requests')
      .insert(request)
      .select(`
        *,
        software:software(name, category, domain),
        user:profiles(full_name, email)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async getUserSkillRequests(userId: string): Promise<SkillRequest[]> {
    const { data, error } = await supabase
      .from('skill_requests')
      .select(`
        *,
        software:software(name, category, domain)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getAllSkillRequests(): Promise<SkillRequest[]> {
    const { data, error } = await supabase
      .from('skill_requests')
      .select(`
        *,
        software:software(name, category, domain),
        user:profiles(full_name, email),
        reviewed_by:profiles!reviewed_by_id(full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getPendingSkillRequests(): Promise<SkillRequest[]> {
    const { data, error } = await supabase
      .from('skill_requests')
      .select(`
        *,
        software:software(name, category, domain),
        user:profiles(full_name, email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async reviewSkillRequest(
    requestId: string, 
    status: 'approved' | 'rejected', 
    reviewerId: string
  ): Promise<SkillRequest> {
    const { data, error } = await supabase
      .from('skill_requests')
      .update({
        status,
        reviewed_by_id: reviewerId,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select(`
        *,
        software:software(name, category, domain),
        user:profiles(full_name, email),
        reviewed_by:profiles!reviewed_by_id(full_name, email)
      `)
      .single();

    if (error) throw error;

    // If approved, update the user's skill level
    if (status === 'approved') {
      await this.updateUserSkill(data.user_id, data.software_id, {
        [data.category.toLowerCase() + '_level']: data.requested_level
      });
    }

    return data;
  }

  async getSkillProgress(userId: string) {
    const skills = await this.getUserSkills(userId);
    const allSoftware = await this.getAllSoftware();
    
    const totalPossible = allSoftware.length * 4; // 4 categories per software
    let completed = 0;

    skills.forEach(skill => {
      if (skill.demo_level !== 'Not Started') completed++;
      if (skill.training_level !== 'Not Started') completed++;
      if (skill.implementation_level !== 'No') completed++;
      if (skill.event_presentation_level !== 'No') completed++;
    });

    return {
      completed,
      total: totalPossible,
      percentage: totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0
    };
  }
}

export const skillService = new SkillService();