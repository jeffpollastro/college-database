-- Run this in your Supabase SQL editor, AFTER insert_new_schools_2026-09.sql.
--
-- Removes the 49 schools that were in the original Oct 2025 build but are not
-- in the Sept 2026 College Scorecard output (schools_annual_update.csv). The
-- annual UPDATE skipped them, so they still show 2023-24 figures. Full list
-- and reasons: crown_hub/03_College_Database/Database_Research/
-- Research_InRoot_School_Count_Reconciliation_2026-10-12.md
--
-- Also removes 3 of the 6 schools added by insert_new_schools_2026-09.sql.
-- On a second look (2026-10-13) each matched a category the Sept review
-- excluded: a Bible college, a nursing/allied health school, and a school
-- with no cost data.
--
-- Expected result: schools goes from 2,953 to 2,901.
--
-- Safe to undo: the 52 rows are copied to schools_removed_2026_10 first.
-- To restore:  INSERT INTO schools SELECT * FROM schools_removed_2026_10;

-- Everything happens inside one block, so it either all applies or none of it
-- does. It stops without changing anything if the table is not in the
-- expected state, or if an Out/Come student has one of these schools as an
-- approved match.
DO $$
DECLARE
  remove_ids text[] := ARRAY[
    -- Closed or merged
    '100937',  -- Birmingham-Southern College (AL)
    '488785',  -- University of Saint Katherine (CA)
    '432524',  -- Delaware College of Art and Design (DE)
    '367884',  -- Hodges University (FL)
    '132879',  -- Johnson University Florida (FL)
    '148876',  -- St. Augustine College (IL)
    '165644',  -- Eastern Nazarene College (MA)
    '177418',  -- Fontbonne University (MO)
    '199698',  -- St. Andrews University (NC)
    '195234',  -- The College of Saint Rose (NY)
    '197230',  -- Wells College (NY)
    '203331',  -- Eastern Gateway Community College (OH)
    '204468',  -- Notre Dame College (OH)
    '209287',  -- Multnomah University (OR)
    '211352',  -- Cabrini University (PA)
    '211024',  -- Clarks Summit University (PA)
    '215415',  -- Pittsburgh Technical College (PA)
    '215105',  -- University of the Arts (PA)
    '230889',  -- Goddard College (VT)
    '239512',  -- Northland College (WI)
    -- Reported closing, merging, or pausing
    '149514',  -- Trinity International University-Illinois (IL)
    '151810',  -- Martin University (IN)
    '206817',  -- Bacone College (OK)
    '218238',  -- Limestone University (SC)
    '235024',  -- Cornish College of the Arts (WA)
    -- Tiny schools near the 100-student cutoff
    '108852',  -- American Academy of Dramatic Arts-Los Angeles (CA)
    '112570',  -- California College of ASU (CA)
    '456490',  -- Polytechnic University of Puerto Rico-Orlando (FL)
    '142090',  -- Boise Bible College (ID)
    '487658',  -- Academy of Interactive Entertainment (LA)
    '486284',  -- Bethany Global University (MN)
    '493798',  -- New York Seminary (NY)
    '498906',  -- Yeshivas Sanz Klauzenburg (NY)
    '245892',  -- Antioch University (OH)
    '496706',  -- Lakewood University (OH)
    '241386',  -- Caribbean University-Carolina (PR)
    '220756',  -- Tennessee College of Applied Technology-McKenzie (TN)
    '449764',  -- Visible Music College (TN)
    '445203',  -- Remington College-North Houston Campus (TX)
    '497000',  -- Remington College-Online Dallas (TX)
    -- Public technical and community colleges
    '136491',  -- Pinellas Technical College-Clearwater (FL)
    '137087',  -- Pinellas Technical College-St. Petersburg (FL)
    '403469',  -- Frontier Community College (IL)
    '403478',  -- Lincoln Trail College (IL)
    '403487',  -- Wabash Valley College (IL)
    '176798',  -- Cape Girardeau Career and Technology Center (MO)
    -- No obvious reason
    '480569',  -- Florida Institute of Technology-Online (FL)
    '490230',  -- Reformed University (GA)
    '488721',  -- NationsUniversity (LA)
    -- Added Sept 2026, removed on second review
    '194569',  -- Davis College (NY): Bible college
    '483647',  -- Ohio Institute of Allied Health (OH): nursing/allied health, held with the other nine
    '499635'   -- EDP University of Puerto Rico-Caguas (PR): no cost data
  ];
  found_rows int;
  live_recs  int;
BEGIN
  SELECT count(*) INTO found_rows
  FROM schools WHERE unitid = ANY(remove_ids);
  IF found_rows <> 52 THEN
    RAISE EXCEPTION 'Expected 52 schools to remove, found %. Nothing was deleted.', found_rows;
  END IF;

  SELECT count(*) INTO live_recs
  FROM college_recommendations
  WHERE ipeds_unit_id::text = ANY(remove_ids)
    AND status = 'approved';
  IF live_recs > 0 THEN
    RAISE EXCEPTION '% approved Out/Come recommendation(s) point at these schools. Nothing was deleted.', live_recs;
  END IF;

  -- Archive the staff-only draft matches that point at these schools (8 found
  -- on 2026-10-13, one student each). Archived, not deleted, so they can be
  -- set back to 'draft' if needed.
  UPDATE college_recommendations
  SET status = 'archived', updated_at = now()
  WHERE ipeds_unit_id::text = ANY(remove_ids)
    AND status = 'draft';

  -- Keep a copy so the delete can be undone. RLS on, no policies, so the copy
  -- is not readable through the public API.
  CREATE TABLE schools_removed_2026_10 AS
  SELECT * FROM schools WHERE unitid = ANY(remove_ids);
  ALTER TABLE schools_removed_2026_10 ENABLE ROW LEVEL SECURITY;

  DELETE FROM schools WHERE unitid = ANY(remove_ids);
END $$;

-- Verify: expect schools_now = 2901 and rows_saved_in_backup = 52
SELECT
  (SELECT count(*) FROM schools)                 AS schools_now,
  (SELECT count(*) FROM schools_removed_2026_10) AS rows_saved_in_backup;
