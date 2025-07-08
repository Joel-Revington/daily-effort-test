
-- Update the user mahesh.m@usam.in to have admin role
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'mahesh.m@usam.in';
