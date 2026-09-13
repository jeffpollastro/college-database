# Annual Data Update Guide — Crown Hub College Search

**Tool:** college-database (Supabase table `schools`)
**Data source:** U.S. Dept. of Education College Scorecard (built from IPEDS)
**How often:** Once a year, after College Scorecard publishes its fall refresh (usually mid-year — check first, don't assume a fixed month)
**Time required:** ~30-45 minutes

---

## Why this is needed

College Scorecard/IPEDS republishes updated tuition, net price, admissions, and outcomes data on a rolling basis. As of September 2026, our live database was still running on the **2023-24** academic year snapshot (downloaded Oct 2025), while the current source had moved to **2025-26** — a real gap. When re-pulled and diffed:

- **2,702 of 2,898 matched schools (93%)** had a changed sticker cost of attendance
- **Average change: +$1,463/year**
- 35 schools newly qualified (enrollment/type changes), 49 dropped out

That's the scale of drift one year of staleness produces on a tool whose entire value proposition is "the real cost, before you commit." Do this every year without skipping.

---

## Step 1 — Check for a newer release

1. Go to https://collegescorecard.ed.gov/data/
2. Note the "last updated" date at the top of the page. If it's not newer than the last time you ran this process (check the changelog at the bottom of this doc), stop — nothing to do yet.
3. Optional cross-check: https://nces.ed.gov/ipeds/datacenter/DataFiles.aspx?gotoReportId=7 shows the IPEDS survey collection cycle directly (e.g. "2024-25"). College Scorecard's "academic year" labels correspond to that collection cycle, one year behind the label sometimes — the College Scorecard page date is the more reliable trigger.

## Step 2 — Download the source file

On the College Scorecard data page, click **"Most Recent Institution-Level Data"** (not the full "All Data Files" archive — that's much larger and unnecessary; the "Most Recent" file already includes admissions, SAT/ACT, and lat/long alongside cost data).

This downloads a zip like `Most-Recent-Cohorts-Institution_MMDDYYYY.zip`. Unzip it — you'll get `Most-Recent-Cohorts-Institution.csv` (~100MB).

> Note: the download URL changes host and filename every year (it moved from `ed-public-download.app.cloud.gov` to `ed-public-download.scorecard.network` between 2025 and 2026). Don't hardcode the URL — always click through from the data page.

## Step 3 — Run the update script

```bash
cd /Users/inchwormdesign/ai_tool/college_search_tool/data
python3 update_school_data.py /path/to/Most-Recent-Cohorts-Institution.csv
```

This produces `schools_annual_update.csv` in that folder — one row per school (~2,900 rows), with columns matching the Supabase `schools` table exactly: cost of attendance, tuition, the five income-bracket Gap columns, admissions, SAT/ACT, outcomes, coordinates, and travel cost.

This one script replaces the old three-script pipeline (`filter_colleges.py`, `generate_update_file.py`, `extract_admission_data.py`), which required two separate downloads. Only kept for reference/history — don't use them for new updates.

Check the console output: it reports how many schools were kept vs. skipped. A wildly different count than last year (currently ~2,900) is worth a sanity check before proceeding.

## Step 4 — Import as a staging table in Supabase

1. Go to supabase.com → project **crown-college-db** → **Table Editor**
2. Create a new table (or truncate/reuse a `schools_staging` table) and import `schools_annual_update.csv` — Table Editor's CSV import will infer columns.
3. Confirm the staging table has the same row count the script reported.

## Step 5 — Sanity-check before overwriting live data

Before running the UPDATE, spot-check 3-5 well-known schools (e.g. a local Pocono-area school, a large state school, an Ivy) in the SQL Editor:

```sql
SELECT s.name, s.gap_0_30k AS old_gap, u.gap_0_30k AS new_gap,
       s.cost_of_attendance AS old_cost, u.cost_of_attendance AS new_cost
FROM schools s
JOIN schools_staging u ON s.unitid = u.unitid
WHERE s.name ILIKE '%<school name>%';
```

The Gap numbers should move in a plausible direction/magnitude (tens to low thousands of dollars), not swing wildly. `gap_severity` in the staging table is computed off the **0-30k bracket** — if that doesn't match how existing rows were classified, flag it and adjust `severity_for()` in the script rather than pushing a change that silently reclassifies schools.

## Step 6 — Apply the update

Run in the Supabase SQL Editor:

```sql
UPDATE schools s
SET
  cost_of_attendance   = u.cost_of_attendance::numeric,
  tuition_in_state      = u.tuition_in_state::numeric,
  tuition_out_state     = u.tuition_out_state::numeric,
  gap_0_30k             = u.gap_0_30k::numeric,
  gap_30_48k            = u.gap_30_48k::numeric,
  gap_48_75k            = u.gap_48_75k::numeric,
  gap_75_110k           = u.gap_75_110k::numeric,
  gap_110k_plus         = u.gap_110k_plus::numeric,
  gap_severity          = u.gap_severity,
  grad_rate_4yr         = u.grad_rate_4yr::numeric,
  grad_rate_pell        = u.grad_rate_pell::numeric,
  median_debt           = u.median_debt::numeric,
  median_earnings_10yr  = u.median_earnings_10yr::numeric,
  admission_rate        = u.admission_rate::numeric,
  sat_read_25           = u.sat_read_25::numeric,
  sat_read_75           = u.sat_read_75::numeric,
  sat_math_25           = u.sat_math_25::numeric,
  sat_math_75           = u.sat_math_75::numeric,
  act_25                = u.act_25::numeric,
  act_75                = u.act_75::numeric,
  latitude              = u.latitude::float,
  longitude             = u.longitude::float,
  travel_type            = u.travel_type,
  annual_travel_cost     = u.annual_travel_cost::numeric
FROM schools_staging u
WHERE s.unitid = u.unitid;
```

Then check for schools present in the new file but missing from `schools` (new schools that now qualify) and decide whether to `INSERT` them — the script's console output tells you how many that is.

Drop the staging table when done: `DROP TABLE schools_staging;`

## Step 7 — Clean up and verify live

1. Visit https://college-database-sooty.vercel.app/, run a search, open a school detail page, and confirm numbers changed and look sane.
2. Delete the local downloaded zip/CSV (~100MB) — don't commit it to git.
3. `schools_annual_update.csv` can be committed to `data/` as a record of the last run, replacing the previous one (same pattern as `schools_update.csv`/`admission_data.csv` today).

## What this process does NOT update

These fields are not in College Scorecard and are manually curated — review them separately, not as part of this annual refresh:

- **`hbcu`** — maintained via `data/add_hbcu_to_supabase.sql`, a fixed verified list. Re-run only if you learn of a status change.
- **`no_loan_policy` / `meets_full_need`** — maintained via `data/add_no_loan_meets_need_to_supabase.sql`, sourced from `crown_hub/03_College_Database/Research_No_Loan_Policy_Schools_2026-09-09.md`. Unlike HBCU status, these policies genuinely change year to year (income caps move, schools add/drop the policy — Boston University and Notre Dame both added no-loan policies in 2025-26 alone). Re-run the underlying `/research` before re-running this SQL — don't just re-apply last year's list.

---

## Changelog

| Date | Source file | Notes |
|---|---|---|
| ~Oct 2025 | `MERGED2023_24_PP.csv` + `Most-Recent-Cohorts-Institution.csv` (undated pull) | Original load, via the old 3-script pipeline |
| Sept 2026 | `Most-Recent-Cohorts-Institution_06102026.zip` | Guide + consolidated script written; cost/tuition/Gap live update **not yet applied** — still pending Step 4-6 |
| Sept 9, 2026 | n/a (manually curated, not from Scorecard) | `add_no_loan_meets_need_to_supabase.sql` applied live — `no_loan_policy`/`meets_full_need` set for 82 schools (31 Tier 1, 51 Tier 2/3), verified against Sept 2026 research. Run by Jeff via SQL Editor; output checked, matches script exactly. |

*Add a row here every time this process runs, so the next person (or next year's you) can tell at a glance how stale the live data is.*
