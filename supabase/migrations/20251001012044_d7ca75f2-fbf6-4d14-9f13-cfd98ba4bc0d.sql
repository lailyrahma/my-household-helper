-- Enable Row Level Security on pengguna table
ALTER TABLE public.pengguna ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own profile
-- Note: This assumes id_pengguna maps to auth.uid() somehow
-- If this table is not used with Supabase Auth, these policies will deny all access by default
CREATE POLICY "Users can view their own data"
  ON public.pengguna
  FOR SELECT
  TO authenticated
  USING (false); -- Deny by default until proper user mapping is established

-- Policy: Users can update their own profile (excluding password changes via this method)
CREATE POLICY "Users can update their own data"
  ON public.pengguna
  FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false); -- Deny by default until proper user mapping is established

-- Policy: Allow insert for new user registration
CREATE POLICY "Service role can manage users"
  ON public.pengguna
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add comment to table explaining the security concern
COMMENT ON TABLE public.pengguna IS 'SECURITY NOTE: This table stores user credentials manually. Consider migrating to Supabase Auth (auth.users) for better security. Current RLS policies deny access by default until proper authentication mapping is established.';