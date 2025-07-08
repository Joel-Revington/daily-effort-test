
-- Add reporting_to column to profiles table to establish hierarchy
ALTER TABLE public.profiles 
ADD COLUMN reporting_to UUID REFERENCES public.profiles(id);

-- Update mahesh.m@usam.in to super_admin role
UPDATE public.profiles 
SET role = 'super_admin' 
WHERE email = 'mahesh.m@usam.in';

-- Add index for better performance on reporting queries
CREATE INDEX idx_profiles_reporting_to ON public.profiles(reporting_to);

-- Create a function to get all subordinates of a user (recursive)
CREATE OR REPLACE FUNCTION get_subordinates(manager_id UUID)
RETURNS TABLE(user_id UUID) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE subordinates AS (
    -- Base case: direct reports
    SELECT id FROM public.profiles WHERE reporting_to = manager_id
    UNION ALL
    -- Recursive case: reports of reports
    SELECT p.id 
    FROM public.profiles p
    INNER JOIN subordinates s ON p.reporting_to = s.user_id
  )
  SELECT subordinates.id FROM subordinates;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
