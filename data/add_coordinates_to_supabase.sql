-- Run this in your Supabase SQL editor (supabase.com → project → SQL Editor)
-- Adds latitude and longitude columns to the schools table

ALTER TABLE schools
  ADD COLUMN IF NOT EXISTS latitude  FLOAT,
  ADD COLUMN IF NOT EXISTS longitude FLOAT;

-- After running generate_update_file.py and getting the new CSV,
-- use the Supabase Table Editor to import or run an UPDATE from the CSV.
--
-- Quick update pattern (if you have a staging table):
--   UPDATE schools s
--   SET latitude  = u.latitude::float,
--       longitude = u.longitude::float
--   FROM schools_update u
--   WHERE s.unitid = u.unitid;
