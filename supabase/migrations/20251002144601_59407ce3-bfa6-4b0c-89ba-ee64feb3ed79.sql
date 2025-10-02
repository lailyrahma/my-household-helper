-- Create security definer functions to check house membership and admin status
-- These prevent infinite recursion in RLS policies by using SECURITY DEFINER

-- Function to check if a user is a member of a specific house
CREATE OR REPLACE FUNCTION public.is_house_member(house_id INTEGER, user_id INTEGER)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.anggota_rumah
    WHERE id_rumah = house_id
      AND id_pengguna = user_id
      AND status = 'aktif'
      AND tanggal_dihapus IS NULL
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

-- Function to check if a user is an admin of a specific house
CREATE OR REPLACE FUNCTION public.is_house_admin(house_id INTEGER, user_id INTEGER)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.anggota_rumah
    WHERE id_rumah = house_id
      AND id_pengguna = user_id
      AND peran = 'admin'
      AND status = 'aktif'
      AND tanggal_dihapus IS NULL
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

-- Add RLS policies to anggota_rumah table
-- Members can view other members of their houses
CREATE POLICY "Members can view house members"
  ON public.anggota_rumah
  FOR SELECT
  TO authenticated
  USING (
    public.is_house_member(id_rumah, (SELECT id_pengguna FROM public.pengguna WHERE email_pengguna = auth.email()))
  );

-- Only admins can add new members to their houses
CREATE POLICY "Admins can add members"
  ON public.anggota_rumah
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_house_admin(id_rumah, (SELECT id_pengguna FROM public.pengguna WHERE email_pengguna = auth.email()))
  );

-- Only admins can update member information (roles, status)
CREATE POLICY "Admins can update members"
  ON public.anggota_rumah
  FOR UPDATE
  TO authenticated
  USING (
    public.is_house_admin(id_rumah, (SELECT id_pengguna FROM public.pengguna WHERE email_pengguna = auth.email()))
  );

-- Only admins can remove members (soft delete by setting tanggal_dihapus)
CREATE POLICY "Admins can delete members"
  ON public.anggota_rumah
  FOR DELETE
  TO authenticated
  USING (
    public.is_house_admin(id_rumah, (SELECT id_pengguna FROM public.pengguna WHERE email_pengguna = auth.email()))
  );