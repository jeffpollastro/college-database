"""
Crown Roots College Search — Annual Data Refresh

Replaces the old three-script pipeline (filter_colleges.py, generate_update_file.py,
extract_admission_data.py) with one script run against one downloaded file.

As of the 2026 refresh, College Scorecard's "Most Recent Cohorts" institution file
already contains admissions (ADM_RATE, SAT/ACT) and coordinates (LATITUDE/LONGITUDE)
alongside cost/net-price data — the old pipeline split these across two separate
downloads (Most-Recent-Cohorts-Institution.csv and a full MERGED{YYYY}_{YY}_PP.csv)
because that used to be necessary. It no longer is.

Usage:
    python3 update_school_data.py /path/to/Most-Recent-Cohorts-Institution.csv

Output:
    schools_annual_update.csv — one row per school, columns matching the Supabase
    `schools` table, ready to import as a staging table. See
    ANNUAL_DATA_UPDATE_GUIDE.md for the full step-by-step process (staging import,
    SQL UPDATE, verification).

Fields this script does NOT touch (not sourced from College Scorecard — manually
curated, see the guide):
    no_loan_policy, meets_full_need, hbcu
"""
import csv
import sys

CLOSE_DRIVE_STATES = ['PA', 'NJ', 'DE']
MEDIUM_DRIVE_STATES = ['NY', 'CT', 'MD', 'DC']
FAR_DRIVE_STATES = ['MA', 'RI', 'VA', 'WV', 'VT', 'NH', 'ME']

# Gap severity thresholds — from PROJECT_STATUS.md "Gap Severity Levels"
SEVERITY_BRACKETS = [
    (2500, 'low'),
    (7500, 'medium'),
    (15000, 'high'),
]


def get_travel_info(state):
    state = (state or '').upper().strip()
    if state in CLOSE_DRIVE_STATES:
        return ('DRIVE', 600)
    if state in MEDIUM_DRIVE_STATES:
        return ('DRIVE', 1000)
    if state in FAR_DRIVE_STATES:
        return ('DRIVE', 1500)
    return ('FLY', 2500)


def clean(val):
    if val in ('NULL', 'PrivacySuppressed', 'NA', 'PS', ''):
        return ''
    return val


def to_float(val):
    val = clean(val)
    if val == '':
        return None
    try:
        return float(val)
    except ValueError:
        return None


def fmt_num(val):
    """Write whole numbers without a trailing .0 -- Supabase's CSV import
    infers bigint for these columns and rejects "16500.0" as invalid input."""
    if val is None:
        return ''
    if val == int(val):
        return str(int(val))
    return str(val)


def severity_for(gap):
    if gap is None:
        return ''
    if gap <= 0:
        return 'low'
    for ceiling, label in SEVERITY_BRACKETS:
        if gap <= ceiling:
            return label
    return 'critical'


OUTPUT_COLUMNS = [
    'unitid', 'name', 'city', 'state', 'control', 'size',
    'website_url', 'npc_url',
    'cost_of_attendance', 'tuition_in_state', 'tuition_out_state',
    'gap_0_30k', 'gap_30_48k', 'gap_48_75k', 'gap_75_110k', 'gap_110k_plus',
    'gap_severity',
    'grad_rate_4yr', 'grad_rate_pell', 'median_debt', 'median_earnings_10yr',
    'admission_rate',
    'sat_read_25', 'sat_read_75', 'sat_math_25', 'sat_math_75',
    'act_25', 'act_75',
    'latitude', 'longitude',
    'travel_type', 'annual_travel_cost',
]


def main():
    if len(sys.argv) != 2:
        print("Usage: python3 update_school_data.py /path/to/Most-Recent-Cohorts-Institution.csv")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = 'schools_annual_update.csv'

    kept = 0
    skipped_control_or_level = 0
    skipped_size = 0

    with open(input_file, 'r', encoding='utf-8-sig') as infile, \
         open(output_file, 'w', newline='', encoding='utf-8') as outfile:

        reader = csv.DictReader(infile)
        writer = csv.writer(outfile)
        writer.writerow(OUTPUT_COLUMNS)

        for row in reader:
            control = row.get('CONTROL', '')
            iclevel = row.get('ICLEVEL', '')

            # Same filters as the original filter_colleges.py:
            # drop for-profits (CONTROL == 3), keep 4-year and 2-year (ICLEVEL 1/2)
            if control == '3' or iclevel not in ('1', '2'):
                skipped_control_or_level += 1
                continue

            ugds = to_float(row.get('UGDS', ''))
            if ugds is None or ugds < 100:
                skipped_size += 1
                continue

            unitid = clean(row.get('UNITID', ''))
            if not unitid:
                continue

            state = clean(row.get('STABBR', ''))
            travel_type, travel_cost = get_travel_info(state)

            is_public = control == '1'
            bracket_suffix = 'PUB' if is_public else 'PRIV'
            gap_0_30k = to_float(row.get(f'NPT41_{bracket_suffix}', ''))
            gap_30_48k = to_float(row.get(f'NPT42_{bracket_suffix}', ''))
            gap_48_75k = to_float(row.get(f'NPT43_{bracket_suffix}', ''))
            gap_75_110k = to_float(row.get(f'NPT44_{bracket_suffix}', ''))
            gap_110k_plus = to_float(row.get(f'NPT45_{bracket_suffix}', ''))

            # gap_severity is keyed off the lowest income bracket (0-30k) — the
            # bracket Crown Roots' target families fall into. Confirm this matches
            # existing Supabase values on the first run (see guide, Step 5).
            gap_severity = severity_for(gap_0_30k)

            writer.writerow([
                unitid,
                clean(row.get('INSTNM', '')),
                clean(row.get('CITY', '')),
                state,
                control,
                clean(row.get('UGDS', '')),
                clean(row.get('INSTURL', '')),
                clean(row.get('NPCURL', '')),
                clean(row.get('COSTT4_A', '')),
                clean(row.get('TUITIONFEE_IN', '')),
                clean(row.get('TUITIONFEE_OUT', '')),
                fmt_num(gap_0_30k),
                fmt_num(gap_30_48k),
                fmt_num(gap_48_75k),
                fmt_num(gap_75_110k),
                fmt_num(gap_110k_plus),
                gap_severity,
                clean(row.get('C150_4', '')),
                clean(row.get('C150_4_PELL', '')),
                clean(row.get('DEBT_MDN', '')),
                clean(row.get('MD_EARN_WNE_P10', '')),
                clean(row.get('ADM_RATE', '')),
                clean(row.get('SATVR25', '')),
                clean(row.get('SATVR75', '')),
                clean(row.get('SATMT25', '')),
                clean(row.get('SATMT75', '')),
                clean(row.get('ACTCM25', '')),
                clean(row.get('ACTCM75', '')),
                clean(row.get('LATITUDE', '')),
                clean(row.get('LONGITUDE', '')),
                travel_type,
                travel_cost,
            ])
            kept += 1

    print(f"Done. Kept {kept} schools -> {output_file}")
    print(f"Skipped (for-profit / not 2-4yr): {skipped_control_or_level}")
    print(f"Skipped (under 100 undergrads / no enrollment data): {skipped_size}")


if __name__ == '__main__':
    main()
