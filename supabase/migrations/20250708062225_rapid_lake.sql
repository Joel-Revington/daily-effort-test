/*
  # Complete Database Schema for Daily Effort Compass

  1. New Tables
    - `daily_reports` - Store daily activity reports
    - `tasks` - Task management system
    - `software` - Software catalog
    - `leads` - Sales lead tracking
    - `kpi_entries` - KPI performance tracking
    - `skill_evaluations` - Engineer skill assessments
    - `skill_requests` - Skill approval requests
    - `feedback_requests` - Customer satisfaction feedback

  2. Security
    - Enable RLS on all tables
    - Add policies for user access control
    - Admin users can see all data
    - Regular users see only their own data

  3. Indexes
    - Add performance indexes for common queries
*/

-- Daily Reports Table
CREATE TABLE IF NOT EXISTS daily_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  attendance_status text NOT NULL,
  activities jsonb NOT NULL DEFAULT '[]',
  general_notes text DEFAULT '',
  submitted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id bigserial PRIMARY KEY,
  title text NOT NULL,
  description text DEFAULT '',
  assignee_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'escalated')),
  type text NOT NULL DEFAULT 'billable' CHECK (type IN ('billable', 'non-billable')),
  category text NOT NULL,
  client text,
  due_date date NOT NULL,
  due_time time,
  estimated_hours numeric DEFAULT 0,
  actual_hours numeric DEFAULT 0,
  tags text[] DEFAULT '{}',
  task_type text NOT NULL DEFAULT 'date-based' CHECK (task_type IN ('date-based', 'time-based')),
  started_at timestamptz,
  completed_at timestamptz,
  is_overdue boolean DEFAULT false,
  overdue_minutes integer DEFAULT 0,
  escalation_reason text,
  comments jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Software Catalog Table
CREATE TABLE IF NOT EXISTS software (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text NOT NULL,
  domain text NOT NULL CHECK (domain IN ('MFG', 'AEC', 'Common')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sales Leads Table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_person text NOT NULL,
  email text,
  phone text,
  lead_source text NOT NULL,
  assigned_to_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'demo-scheduled', 'demo-given', 'quoted', 'negotiation', 'closed-won', 'closed-lost')),
  priority text DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  requirement text,
  demo_date date,
  demo_notes text,
  quote_amount numeric,
  quoted_date date,
  quote_sent boolean DEFAULT false,
  order_value numeric,
  closed_date date,
  expected_close_date date,
  lost_reason text,
  follow_up boolean DEFAULT false,
  follow_up_date date,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- KPI Entries Table
CREATE TABLE IF NOT EXISTS kpi_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  customer_satisfaction numeric NOT NULL CHECK (customer_satisfaction >= 1 AND customer_satisfaction <= 5),
  timely_delivery numeric NOT NULL CHECK (timely_delivery >= 1 AND timely_delivery <= 5),
  certifications text DEFAULT '',
  lead_generation integer DEFAULT 0,
  dcr_maintenance numeric DEFAULT 3 CHECK (dcr_maintenance >= 1 AND dcr_maintenance <= 5),
  technical_escalations integer DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Skill Evaluations Table
CREATE TABLE IF NOT EXISTS skill_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  software_id uuid REFERENCES software(id) ON DELETE CASCADE,
  demo_level text DEFAULT 'Not Started' CHECK (demo_level IN ('Not Started', 'Basic', 'Advanced', 'POC')),
  training_level text DEFAULT 'Not Started' CHECK (training_level IN ('Not Started', 'Basic', 'Advanced', 'Handholding')),
  implementation text DEFAULT 'No' CHECK (implementation IN ('No', 'Yes')),
  event_presentation text DEFAULT 'No' CHECK (event_presentation IN ('No', 'Yes')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, software_id)
);

-- Skill Approval Requests Table
CREATE TABLE IF NOT EXISTS skill_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  software_id uuid REFERENCES software(id) ON DELETE CASCADE,
  category text NOT NULL,
  level text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by_id uuid REFERENCES auth.users(id)
);

-- Feedback Requests Table
CREATE TABLE IF NOT EXISTS feedback_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id bigint REFERENCES tasks(id) ON DELETE CASCADE,
  task_title text NOT NULL,
  emails text[] NOT NULL,
  custom_message text DEFAULT '',
  feedback_link text NOT NULL,
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'completed')),
  sent_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE software ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_requests ENABLE ROW LEVEL SECURITY;

-- Daily Reports Policies
CREATE POLICY "Users can view own daily reports" ON daily_reports
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Users can insert own daily reports" ON daily_reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily reports" ON daily_reports
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Tasks Policies
CREATE POLICY "Users can view assigned tasks or all if admin" ON tasks
  FOR SELECT TO authenticated
  USING (
    auth.uid() = assignee_id OR 
    auth.uid() = assigned_by_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can insert tasks" ON tasks
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Users can update assigned tasks or admins can update all" ON tasks
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = assignee_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Software Policies (read-only for users, full access for admins)
CREATE POLICY "Everyone can view software" ON software
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage software" ON software
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Leads Policies
CREATE POLICY "Users can view assigned leads or all if admin" ON leads
  FOR SELECT TO authenticated
  USING (
    assigned_to_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Users can manage assigned leads or admins can manage all" ON leads
  FOR ALL TO authenticated
  USING (
    assigned_to_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- KPI Entries Policies
CREATE POLICY "Users can view own KPI entries or admins can view all" ON kpi_entries
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Users can manage own KPI entries" ON kpi_entries
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Skill Evaluations Policies
CREATE POLICY "Users can view own evaluations or admins can view all" ON skill_evaluations
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Users can manage own evaluations" ON skill_evaluations
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Skill Requests Policies
CREATE POLICY "Users can view own requests or admins can view all" ON skill_requests
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Users can create own requests" ON skill_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update requests" ON skill_requests
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Feedback Requests Policies
CREATE POLICY "Users can view feedback requests for their tasks" ON feedback_requests
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND assignee_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Users can create feedback requests for their tasks" ON feedback_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM tasks WHERE id = task_id AND assignee_id = auth.uid())
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_reports_user_date ON daily_reports(user_id, date);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_kpi_entries_user_date ON kpi_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_skill_evaluations_user ON skill_evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_requests_user ON skill_requests(user_id);

-- Insert default software catalog
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

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_daily_reports_updated_at BEFORE UPDATE ON daily_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_software_updated_at BEFORE UPDATE ON software FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kpi_entries_updated_at BEFORE UPDATE ON kpi_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_skill_evaluations_updated_at BEFORE UPDATE ON skill_evaluations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();