// Enhanced types for our Supabase schema
export type UserRole = 'super_admin' | 'admin' | 'user';
export type DomainType = 'MFG' | 'AEC' | 'Common';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'escalated';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskType = 'billable' | 'non-billable';
export type LeadStatus = 'new' | 'contacted' | 'demo-scheduled' | 'demo-given' | 'quoted' | 'negotiation' | 'closed-won' | 'closed-lost';
export type LeadPriority = 'Low' | 'Medium' | 'High';
export type SkillLevel = 'Not Started' | 'Basic' | 'Advanced' | 'POC' | 'Handholding' | 'Yes' | 'No';
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  designation: string | null;
  domain: DomainType | null;
  username: string | null;
  role: UserRole | null;
  reporting_to: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Software {
  id: string;
  name: string;
  category: string;
  domain: DomainType;
  created_at: string;
  updated_at: string;
}

export interface DailyReport {
  id: string;
  user_id: string;
  date: string;
  attendance_status: string;
  general_notes: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  activities?: ReportActivity[];
  user?: Profile;
}

export interface ReportActivity {
  id: string;
  report_id: string;
  category: string;
  from_time: string;
  to_time: string;
  hours: number;
  notes: string | null;
  is_billable: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  assignee_id: string | null;
  assigned_by_id: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  type: TaskType;
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
  assignee?: Profile;
  assigned_by?: Profile;
  comments?: TaskComment[];
}

export interface TaskComment {
  id: string;
  task_id: string;
  author_id: string;
  comment: string;
  created_at: string;
  author?: Profile;
}

export interface UserSkill {
  id: string;
  user_id: string;
  software_id: string;
  demo_level: SkillLevel;
  training_level: SkillLevel;
  implementation_level: SkillLevel;
  event_presentation_level: SkillLevel;
  created_at: string;
  updated_at: string;
  software?: Software;
  user?: Profile;
}

export interface SkillRequest {
  id: string;
  user_id: string;
  software_id: string;
  category: string;
  requested_level: SkillLevel;
  status: RequestStatus;
  approved_by_id: string | null;
  approved_at: string | null;
  created_at: string;
  user?: Profile;
  software?: Software;
  approved_by?: Profile;
}

export interface KPIEntry {
  id: string;
  user_id: string;
  date: string;
  customer_satisfaction: number;
  timely_delivery: number;
  certifications: string | null;
  lead_generation: number;
  dcr_maintenance: number;
  technical_escalations: number;
  notes: string | null;
  created_at: string;
  user?: Profile;
}

export interface SalesLead {
  id: string;
  company_name: string;
  contact_person: string;
  email: string | null;
  phone: string | null;
  lead_source: string;
  assigned_to_id: string | null;
  status: LeadStatus;
  priority: LeadPriority;
  requirement: string | null;
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
  notes: string | null;
  created_at: string;
  updated_at: string;
  assigned_to?: Profile;
}

export interface FeedbackRequest {
  id: string;
  task_id: string;
  requested_by_id: string;
  emails: string[];
  custom_message: string | null;
  feedback_link: string;
  status: string;
  created_at: string;
  task?: Task;
  requested_by?: Profile;
}