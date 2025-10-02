-- Drop the overly permissive policies on rumah table
DROP POLICY IF EXISTS "Allow authenticated users to view all houses" ON public.rumah;
DROP POLICY IF EXISTS "Allow authenticated users to create houses" ON public.rumah;
DROP POLICY IF EXISTS "Allow authenticated users to update houses" ON public.rumah;
DROP POLICY IF EXISTS "Allow authenticated users to delete houses" ON public.rumah;

-- Create secure policies that restrict access to house owners and members

-- Users can only view houses they own OR are members of
CREATE POLICY "Users can view their houses"
  ON public.rumah
  FOR SELECT
  TO authenticated
  USING (
    -- User is the owner
    id_pengguna = (SELECT id_pengguna FROM public.pengguna WHERE email_pengguna = auth.email())
    OR
    -- User is a member of the house
    public.is_house_member(id_rumah, (SELECT id_pengguna FROM public.pengguna WHERE email_pengguna = auth.email()))
  );

-- Users can create houses (they will be the owner)
CREATE POLICY "Users can create houses"
  ON public.rumah
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User creating the house must be the owner
    id_pengguna = (SELECT id_pengguna FROM public.pengguna WHERE email_pengguna = auth.email())
  );

-- Only house owners can update their houses
CREATE POLICY "House owners can update"
  ON public.rumah
  FOR UPDATE
  TO authenticated
  USING (
    id_pengguna = (SELECT id_pengguna FROM public.pengguna WHERE email_pengguna = auth.email())
  )
  WITH CHECK (
    id_pengguna = (SELECT id_pengguna FROM public.pengguna WHERE email_pengguna = auth.email())
  );

-- Only house owners can delete their houses
CREATE POLICY "House owners can delete"
  ON public.rumah
  FOR DELETE
  TO authenticated
  USING (
    id_pengguna = (SELECT id_pengguna FROM public.pengguna WHERE email_pengguna = auth.email())
  );