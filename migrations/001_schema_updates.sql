-- SmartMocaf Database Schema Updates
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. Add device status tracking columns
-- =====================================================
ALTER TABLE devices ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;
ALTER TABLE devices ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ;
ALTER TABLE devices ADD COLUMN IF NOT EXISTS device_code VARCHAR(10);

-- =====================================================
-- 2. Add water level to telemetry
-- =====================================================
ALTER TABLE telemetry ADD COLUMN IF NOT EXISTS water_level REAL;

-- =====================================================
-- 3. Add mode to fermentation runs
-- =====================================================
ALTER TABLE fermentation_runs ADD COLUMN IF NOT EXISTS mode VARCHAR(10) DEFAULT 'auto';
ALTER TABLE fermentation_runs ADD COLUMN IF NOT EXISTS leak_detected BOOLEAN DEFAULT false;
ALTER TABLE fermentation_runs ADD COLUMN IF NOT EXISTS water_level_at_start REAL;

-- =====================================================
-- 4. Telemetry History table (30-minute aggregated data)
-- =====================================================
CREATE TABLE IF NOT EXISTS telemetry_history (
  id BIGSERIAL PRIMARY KEY,
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  run_id UUID REFERENCES fermentation_runs(id) ON DELETE SET NULL,
  avg_temp_c REAL,
  avg_ph REAL,
  avg_water_level REAL,
  min_temp_c REAL,
  max_temp_c REAL,
  min_ph REAL,
  max_ph REAL,
  sample_count INTEGER DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_telemetry_history_device_time 
ON telemetry_history(device_id, recorded_at DESC);

-- =====================================================
-- 5. RLS policies for telemetry_history
-- =====================================================
ALTER TABLE telemetry_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "history_select_own_device" ON telemetry_history;
CREATE POLICY "history_select_own_device" ON telemetry_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM devices d 
    WHERE d.id = telemetry_history.device_id 
    AND d.owner_id = auth.uid()
  )
);

-- Admin can see all history
DROP POLICY IF EXISTS "admin_select_all_history" ON telemetry_history;
CREATE POLICY "admin_select_all_history" ON telemetry_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'admin'
  )
);

-- =====================================================
-- 6. Update devices RLS to allow admin access
-- =====================================================
DROP POLICY IF EXISTS "admin_select_all_devices" ON devices;
CREATE POLICY "admin_select_all_devices" ON devices FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'admin'
  )
);

-- =====================================================
-- 7. Function to update device online status
-- =====================================================
CREATE OR REPLACE FUNCTION update_device_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE devices 
  SET last_seen = NOW(), is_online = true 
  WHERE id = NEW.device_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update last_seen on telemetry insert
DROP TRIGGER IF EXISTS trigger_update_device_last_seen ON telemetry;
CREATE TRIGGER trigger_update_device_last_seen
AFTER INSERT ON telemetry
FOR EACH ROW
EXECUTE FUNCTION update_device_last_seen();

-- =====================================================
-- 8. Function to mark devices offline (run via cron)
-- =====================================================
CREATE OR REPLACE FUNCTION mark_devices_offline()
RETURNS void AS $$
BEGIN
  UPDATE devices 
  SET is_online = false 
  WHERE last_seen < NOW() - INTERVAL '10 seconds' 
  AND is_online = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. Profiles table (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  role VARCHAR(20) DEFAULT 'farmer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- =====================================================
-- 10. Allow service role to insert telemetry (for MQTT webhook)
-- =====================================================
DROP POLICY IF EXISTS "service_insert_telemetry" ON telemetry;
CREATE POLICY "service_insert_telemetry" ON telemetry FOR INSERT
WITH CHECK (true);

-- =====================================================
-- 11. Add username column to profiles
-- =====================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

-- Index for username lookup
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- =====================================================
-- 12. Allow service role to insert profiles (for registration API)
-- =====================================================
DROP POLICY IF EXISTS "service_insert_profiles" ON profiles;
CREATE POLICY "service_insert_profiles" ON profiles FOR INSERT
WITH CHECK (true);

-- Allow service role to select profiles (for username check)
DROP POLICY IF EXISTS "service_select_profiles" ON profiles;
CREATE POLICY "service_select_profiles" ON profiles FOR SELECT
USING (true);
