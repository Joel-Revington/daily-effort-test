/*
  # Complete Database Schema for Management System

  1. New Tables
    - `profiles` - User profiles with roles and reporting structure
    - `daily_reports` - Daily activity reports
    - `report_activities` - Individual activities within reports
    - `tasks` - Task management system
    - `task_comments` - Comments on tasks
    - `software` - Software catalog
    - `user_skills` - User skill evaluations
    - `skill_requests` - Skill approval requests
    - `kpi_entries` - KPI tracking
    - `sales_leads` - Sales pipeline management
    - `feedback_requests` - Customer satisfaction feedback

  2. Security
    - Enable RLS on all tables
    - Add policies for user access control
    - Admin users can see all data
    - Regular users see only their own data

  3. Real-time
    - Enable real-time subscriptions for collaborative features
*/

-- Create enum types
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'user');
CREATE TYPE domain_type AS ENUM ('MFG', 'AEC', 'Common');
CREATE TYPE task_status AS ENUM ('pending', 'in-progress', 'completed', 'escalated');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE task_type AS ENUM ('billable', 'non-billable');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'demo-scheduled', 'demo-given', 'quoted', 'negotiation', 'closed-won', 'closed-lost');
CREATE TYPE lead_priority AS ENUM ('Low', 'Medium', 'High');
CREATE TYPE skill_level AS ENUM ('Not Started', 'Basic', 'Advanced', 'POC', 'Handholding', 'Yes', 'No');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected');

-- Update profiles table to include additional fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS designation TEXT,
ADD COLUMN IF NOT EXISTS domain domain_type DEFAULT 'AEC',
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create software table
CREATE TABLE IF NOT EXISTS software (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  domain domain_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create daily_reports table
CREATE TABLE IF NOT EXISTS daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  attendance_status TEXT NOT NULL,
  general_notes TEXT DEFAULT '',
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create report_activities table
CREATE TABLE IF NOT EXISTS report_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES daily_reports(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  from_time TIME NOT NULL,
  to_time TIME NOT NULL,
  hours DECIMAL(4,2) NOT NULL,
  notes TEXT DEFAULT '',
  is_billable BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  priority task_priority DEFAULT 'medium',
  status task_status DEFAULT 'pending',
  type task_type DEFAULT 'billable',
  category TEXT NOT NULL,
  client TEXT,
  due_date DATE NOT NULL,
  due_time TIME,
  estimated_hours DECIMAL(4,2) DEFAULT 0,
  actual_hours DECIMAL(4,2) DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  task_type TEXT DEFAULT 'date-based',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  is_overdue BOOLEAN DEFAULT false,
  overdue_minutes INTEGER DEFAULT 0,
  escalation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create task_comments table
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_skills table
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  software_id UUID REFERENCES software(id) ON DELETE CASCADE,
  demo_level skill_level DEFAULT 'Not Started',
  training_level skill_level DEFAULT 'Not Started',
  implementation_level skill_level DEFAULT 'No',
  event_presentation_level skill_level DEFAULT 'No',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, software_id)
);

-- Create skill_requests table
CREATE TABLE IF NOT EXISTS skill_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  software_id UUID REFERENCES software(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  requested_level skill_level NOT NULL,
  status request_status DEFAULT 'pending',
  approved_by_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create kpi_entries table
CREATE TABLE IF NOT EXISTS kpi_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  customer_satisfaction DECIMAL(2,1) CHECK (customer_satisfaction >= 1 AND customer_satisfaction <= 5),
  timely_delivery DECIMAL(2,1) CHECK (timely_delivery >= 1 AND timely_delivery <= 5),
  certifications TEXT DEFAULT '',
  lead_generation INTEGER DEFAULT 0,
  dcr_maintenance DECIMAL(2,1) CHECK (dcr_maintenance >= 1 AND dcr_maintenance <= 5),
  technical_escalations INTEGER DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create sales_leads table
CREATE TABLE IF NOT EXISTS sales_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  lead_source TEXT NOT NULL,
  assigned_to_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status lead_status DEFAULT 'new',
  priority lead_priority DEFAULT 'Medium',
  requirement TEXT DEFAULT '',
  demo_date DATE,
  demo_notes TEXT,
  quote_amount DECIMAL(12,2),
  quoted_date DATE,
  quote_sent BOOLEAN DEFAULT false,
  order_value DECIMAL(12,2),
  expected_close_date DATE,
  closed_date DATE,
  lost_reason TEXT,
  follow_up BOOLEAN DEFAULT false,
  follow_up_date DATE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create feedback_requests table
CREATE TABLE IF NOT EXISTS feedback_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  emails TEXT[] NOT NULL,
  custom_message TEXT DEFAULT '',
  feedback_link TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE software ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_requests ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can read all profiles" ON profiles FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Software policies (readable by all, manageable by admins)
CREATE POLICY "All users can read software" ON software FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage software" ON software FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Daily reports policies
CREATE POLICY "Users can manage own reports" ON daily_reports FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can read all reports" ON daily_reports FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Report activities policies
CREATE POLICY "Users can manage own activities" ON report_activities FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM daily_reports WHERE id = report_activities.report_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can read all activities" ON report_activities FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Tasks policies
CREATE POLICY "Users can read assigned tasks" ON tasks FOR SELECT TO authenticated USING (
  assignee_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Users can update assigned tasks" ON tasks FOR UPDATE TO authenticated USING (assignee_id = auth.uid());
CREATE POLICY "Admins can manage all tasks" ON tasks FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Task comments policies
CREATE POLICY "Users can read task comments" ON task_comments FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM tasks WHERE id = task_comments.task_id AND (
    assignee_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  ))
);
CREATE POLICY "Users can add comments to assigned tasks" ON task_comments FOR INSERT TO authenticated USING (
  EXISTS (SELECT 1 FROM tasks WHERE id = task_comments.task_id AND assignee_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- User skills policies
CREATE POLICY "Users can manage own skills" ON user_skills FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can read all skills" ON user_skills FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Skill requests policies
CREATE POLICY "Users can manage own requests" ON skill_requests FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all requests" ON skill_requests FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- KPI entries policies
CREATE POLICY "Users can manage own KPI entries" ON kpi_entries FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can read all KPI entries" ON kpi_entries FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Sales leads policies
CREATE POLICY "Users can read assigned leads" ON sales_leads FOR SELECT TO authenticated USING (
  assigned_to_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Users can update assigned leads" ON sales_leads FOR UPDATE TO authenticated USING (assigned_to_id = auth.uid());
CREATE POLICY "Admins can manage all leads" ON sales_leads FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- Feedback requests policies
CREATE POLICY "Users can manage feedback for assigned tasks" ON feedback_requests FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM tasks WHERE id = feedback_requests.task_id AND (
    assignee_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  ))
);

-- Insert default software data
INSERT INTO software (name, category, domain) VALUES
-- MFG Software
('PDMC', 'Manufacturing', 'MFG'),
('Inventor', 'Manufacturing', 'MFG'),
('Fusion', 'Design & Manufacturing', 'MFG'),
('Fusion PCB', 'Electronics', 'MFG'),
('Fusion CAM', 'Manufacturing', 'MFG'),
('Fusion CAE', 'Simulation', 'MFG'),
('Nastran', 'Simulation', 'MFG'),
('Factory', 'Manufacturing', 'MFG'),
('Inventor CAM', 'Manufacturing', 'MFG'),
('Nesting', 'Manufacturing', 'MFG'),
('Tolerance Analysis', 'Manufacturing', 'MFG'),
('Vault Professional', 'Data Management', 'MFG'),
('FlexSIM', 'Simulation', 'MFG'),
('AutoCAD Mechanical', 'Design', 'MFG'),

-- AEC Software
('AEC Collection', 'Design Suite', 'AEC'),
('Revit', 'Design', 'AEC'),
('Civil 3D', 'Civil Engineering', 'AEC'),
('Infraworks', 'Infrastructure', 'AEC'),
('Advance Steel', 'Structural Design', 'AEC'),
('Robot Structural', 'Structural Analysis', 'AEC'),
('Bridge Design', 'Infrastructure', 'AEC'),
('Formit', 'Conceptual Design', 'AEC'),
('Twinmotion', 'Visualization', 'AEC'),
('Forma', 'Planning', 'AEC'),
('Docs', 'Documentation', 'AEC'),
('BIM Collaborate Pro', 'Collaboration', 'AEC'),
('Vehicle Tracking', 'Transportation', 'AEC'),
('AutoCAD Map 3D', 'Mapping', 'AEC'),

-- Common Software
('AutoCAD', 'Design', 'Common'),
('AutoCAD Plant 3D', 'Plant Design', 'Common'),
('Navisworks', 'Project Review', 'Common'),
('Recap', 'Reality Capture', 'Common'),
('AutoCAD Electrical', 'Electrical Design', 'Common')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_reports_user_date ON daily_reports(user_id, date);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_sales_leads_assigned_to ON sales_leads(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_user ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_requests_user ON skill_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_kpi_entries_user_date ON kpi_entries(user_id, date);

-- Enable real-time for collaborative features
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE task_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE sales_leads;
ALTER PUBLICATION supabase_realtime ADD TABLE skill_requests;