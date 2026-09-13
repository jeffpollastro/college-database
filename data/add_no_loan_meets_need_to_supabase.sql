-- Run this in your Supabase SQL editor (supabase.com -> project -> SQL Editor)
-- Sets no_loan_policy and meets_full_need booleans on the schools table.
--
-- Sourced from crown_hub/03_College_Database/Research_No_Loan_Policy_Schools_2026-09-09.md
-- (which updates/supersedes the 2026-06-09 research). Every school below was checked
-- against its own financial aid page as of Sept 2026 — see that doc's Source Log.
-- Schools that could not be confirmed via a primary source are deliberately left out.
--
-- IMPORTANT: unlike hbcu (which never changes), these policies DO change year to year
-- as schools expand or add income caps. Re-run the underlying research (not just this
-- SQL) roughly annually alongside the College Scorecard data refresh -- see
-- ANNUAL_DATA_UPDATE_GUIDE.md.

ALTER TABLE schools
  ADD COLUMN IF NOT EXISTS no_loan_policy boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS meets_full_need boolean DEFAULT false;

-- Reset any previously set values before reapplying the verified list
UPDATE schools SET no_loan_policy = false, meets_full_need = false;

-- ============================================================
-- TIER 1 -- unconditional no-loan, meets 100% of demonstrated need
-- for every admitted student, no income cap on the loan-free part
-- ============================================================
UPDATE schools
SET no_loan_policy = true, meets_full_need = true
WHERE unitid IN (
  '164465',  -- Amherst College
  '161004',  -- Bowdoin College
  '211273',  -- Bryn Mawr College
  '217156',  -- Brown University
  '161086',  -- Colby College
  '190150',  -- Columbia University
  '182670',  -- Dartmouth College
  '198385',  -- Davidson College
  '139658',  -- Emory University
  '153384',  -- Grinnell College
  '166027',  -- Harvard University
  '162928',  -- Johns Hopkins University
  '166683',  -- MIT
  '147767',  -- Northwestern University
  '121345',  -- Pomona College
  '186131',  -- Princeton University
  '227757',  -- Rice University
  '167835',  -- Smith College
  '243744',  -- Stanford University
  '216287',  -- Swarthmore College
  '144050',  -- University of Chicago
  '215062',  -- University of Pennsylvania
  '234207',  -- Washington and Lee University
  '179867',  -- Washington University in St. Louis
  '130697',  -- Wesleyan University
  '168342',  -- Williams College
  '130794',  -- Yale University
  '156295',  -- Berea College (tuition-free by design)
  '178697',  -- College of the Ozarks (tuition-free by design)
  '164988',  -- Boston University -- NEW: BU Promise, no loans starting 2026-27
  '152080'   -- University of Notre Dame -- NEW: no loans starting Fall 2025 class
);

-- ============================================================
-- TIER 2 -- meets 100% of need; no-loan only below an income
-- threshold, loans possible above it. meets_full_need = true,
-- no_loan_policy stays false since it's conditional, not universal.
-- ============================================================
UPDATE schools
SET meets_full_need = true
WHERE unitid IN (
  '190099',  -- Colgate University (no loans under $200K)
  '190415',  -- Cornell University (no loans under $75K)
  '212911',  -- Haverford College (no loans under $60K)
  '213385',  -- Lafayette College (no loans under $200K)
  '168148',  -- Tufts University (no loans under $60K)
  '221999',  -- Vanderbilt University (full tuition free under $150K)
  '199120',  -- UNC Chapel Hill (no loans at/below 200% federal poverty guideline)
  '168218',  -- Wellesley College (no loans under $100K)
  '110635',  -- UC Berkeley
  '110662',  -- UCLA
  '110680',  -- UC San Diego
  '110705',  -- UC Santa Barbara
  '110714',  -- UC Santa Cruz
  '110644',  -- UC Davis
  '110653',  -- UC Irvine
  '445188',  -- UC Merced
  '110671',  -- UC Riverside
                -- (UC system: no loans for CA residents under $100K)
  '170976',  -- University of Michigan (no loans, MI residents, income <=$75K)
  '213543',  -- Lehigh University -- loans eliminated <$75K, capped $2K/yr $75-150K, $5K/yr otherwise
  '166939'   -- Mount Holyoke College -- tuition-free under $150K (Mount Holyoke Commitment)
);

-- ============================================================
-- TIER 3 -- meets 100% of demonstrated need, but loans are a
-- standard part of the aid package (no no-loan policy at all)
-- ============================================================
UPDATE schools
SET meets_full_need = true
WHERE unitid IN (
  '189097',  -- Barnard College
  '160977',  -- Bates College
  '164924',  -- Boston College
  '110404',  -- Caltech
  '173258',  -- Carleton College
  '112260',  -- Claremont McKenna College
  '166124',  -- College of the Holy Cross
  '126678',  -- Colorado College
  '128902',  -- Connecticut College
  '212577',  -- Franklin and Marshall College
  '131496',  -- Georgetown University
  '191515',  -- Hamilton College
  '115409',  -- Harvey Mudd College
  '203535',  -- Kenyon College
  '173902',  -- Macalester College
  '230959',  -- Middlebury College
  '204501',  -- Oberlin College
  '120254',  -- Occidental College
  '121257',  -- Pitzer College
  '209922',  -- Reed College
  '130590',  -- Trinity College (CT)
  '196866',  -- Union College
  '233374',  -- University of Richmond
  '195030',  -- University of Rochester
  '123961',  -- USC
  '234076',  -- University of Virginia
  '197133',  -- Vassar College
  '199847',  -- Wake Forest University
  '196413',  -- Syracuse University
  '165015',  -- Brandeis University
  '237057'   -- Whitman College -- NEW: phasing in 2026-27 through 2029-30, first-years/transfers only so far
);

-- Verify: counts and full list
SELECT no_loan_policy, meets_full_need, count(*) FROM schools
GROUP BY no_loan_policy, meets_full_need;

SELECT unitid, name, no_loan_policy, meets_full_need
FROM schools
WHERE meets_full_need = true
ORDER BY no_loan_policy DESC, name;
