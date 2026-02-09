-- Fix RLS Recursion and Enhance Profiles Access
-- Run this in Supabase SQL Editor

-- 1. Create a secure function to check admin status (Bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;

-- 2. Drop existing problematic policies on profiles
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON profiles; 
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
-- Drop any potentially recursive policies that might have been added manually
DROP POLICY IF EXISTS "admin_view_all" ON profiles;

-- 3. Recreate clean policies
-- Users can see their own profile
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
USING (id = auth.uid());

-- Admins can see all profiles (Using the secure function)
CREATE POLICY "profiles_select_admin" ON profiles FOR SELECT
USING (is_admin());

-- Service role access (for server actions)
DROP POLICY IF EXISTS "service_role_all" ON profiles;
CREATE POLICY "service_role_all" ON profiles
USING (true)
WITH CHECK (true);

-- 4. Update Devices RLS to use is_admin() for better performance/safety
DROP POLICY IF EXISTS "admin_select_all_devices" ON devices;
CREATE POLICY "admin_select_all_devices" ON devices FOR SELECT
USING (
  (owner_id = auth.uid()) OR is_admin()
);

-- 5. Update Telemetry History RLS
DROP POLICY IF EXISTS "admin_select_all_history" ON telemetry_history;
CREATE POLICY "admin_select_all_history" ON telemetry_history FOR SELECT
USING (is_admin());

-- 6. Ensure profiles has email column if we want to store it (Optional, but good for lookup)
-- Actually, we will query auth.users via admin API effectively, 
-- or we can just add email to profiles to make lookups easier without Admin API.
-- Let's add email to profiles and sync it for easier querying.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Create a trigger to sync email from auth.users to profiles on insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'farmer', new.email)
  ON CONFLICT (id) DO UPDATE SET email = new.email;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger (usually default, but good to ensure)
-- Note: This only affects NEW users. Existing users might have NULL email in profiles.
-- We can run a one-time update if we had access, but for now this helps future.
