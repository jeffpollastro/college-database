-- Run this in your Supabase SQL editor, AFTER schools_staging has been imported
-- and the main annual UPDATE has already run (see ANNUAL_DATA_UPDATE_GUIDE.md).
--
-- These 6 schools are new to the Sept 2026 College Scorecard pull and passed
-- manual review (not religious-mission, no reputational/outcomes red flags,
-- have usable cost data). See the chat/session notes from 2026-09-09 for the
-- full 34-school review -- the rest were deliberately excluded (religious
-- seminaries, schools with FTC/deceptive-marketing histories, technical
-- colleges and nursing schools held for a separate decision, and several
-- with no cost data at all).

INSERT INTO schools (
  unitid, name, city, state, control, size,
  website_url, npc_url,
  cost_of_attendance, tuition_in_state, tuition_out_state,
  gap_0_30k, gap_30_48k, gap_48_75k, gap_75_110k, gap_110k_plus,
  gap_severity,
  grad_rate_4yr, grad_rate_pell, median_debt, median_earnings_10yr,
  admission_rate,
  sat_read_25, sat_read_75, sat_math_25, sat_math_75,
  act_25, act_75,
  latitude, longitude,
  travel_type, annual_travel_cost
)
SELECT
  unitid::text, name, city, state, control::int, size::int,
  website_url, npc_url,
  cost_of_attendance::numeric, tuition_in_state::numeric, tuition_out_state::numeric,
  gap_0_30k::numeric, gap_30_48k::numeric, gap_48_75k::numeric, gap_75_110k::numeric, gap_110k_plus::numeric,
  gap_severity,
  grad_rate_4yr::numeric, grad_rate_pell::numeric, median_debt::numeric, median_earnings_10yr::numeric,
  admission_rate::numeric,
  sat_read_25::numeric, sat_read_75::numeric, sat_math_25::numeric, sat_math_75::numeric,
  act_25::numeric, act_75::numeric,
  latitude::float, longitude::float,
  travel_type, annual_travel_cost::numeric
FROM schools_staging
WHERE unitid IN (
  217891,  -- Clinton College (SC)
  434751,  -- White Earth Tribal and Community College (MN)
  154518,  -- Waldorf University (IA)
  194569,  -- Davis College (NY)
  483647,  -- Ohio Institute of Allied Health (OH)
  499635   -- EDP University of Puerto Rico-Caguas (PR)
);

-- Clinton College is a verified, accredited HBCU (Rock Hill, SC, founded 1894)
-- -- not previously in add_hbcu_to_supabase.sql because it wasn't in the
-- database until this insert.
UPDATE schools SET hbcu = true WHERE unitid = '217891';

-- Verify
SELECT unitid, name, state, cost_of_attendance, hbcu FROM schools
WHERE unitid IN ('217891','434751','154518','194569','483647','499635');
