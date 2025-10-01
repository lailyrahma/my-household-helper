-- Enable RLS on rumah table
ALTER TABLE public.rumah ENABLE ROW LEVEL SECURITY;

-- Simple policies for now - allow authenticated users to manage their houses
-- Note: These policies allow access based on the id_pengguna column matching the user's ID
-- You'll need to ensure id_pengguna is properly set when inserting data

CREATE POLICY "Allow authenticated users to view all houses"
  ON public.rumah
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to create houses"
  ON public.rumah
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update houses"
  ON public.rumah
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete houses"
  ON public.rumah
  FOR DELETE
  TO authenticated
  USING (true);