import csv

# Input files
scorecard_file = '/Users/inchwormdesign/Downloads/College_Scorecard_Raw_Data_10032025/MERGED2023_24_PP.csv'
output_file = '/Users/inchwormdesign/Downloads/College_Scorecard_Raw_Data_10032025/schools_update.csv'

# Travel logic from the Poconos, PA
# Close DRIVE: PA, NJ, DE - $600/year (5 trips)
# Medium DRIVE: NY, CT, MD, DC - $1,000/year
# Far DRIVE: MA, RI, VA, WV, VT, NH, ME - $1,500/year
# FLY: Everything else - $2,500/year

CLOSE_DRIVE_STATES = ['PA', 'NJ', 'DE']
MEDIUM_DRIVE_STATES = ['NY', 'CT', 'MD', 'DC']
FAR_DRIVE_STATES = ['MA', 'RI', 'VA', 'WV', 'VT', 'NH', 'ME']

def get_travel_info(state):
    """Returns (travel_type, annual_travel_cost) based on state"""
    state = state.upper().strip() if state else ''

    if state in CLOSE_DRIVE_STATES:
        return ('DRIVE', 600)
    elif state in MEDIUM_DRIVE_STATES:
        return ('DRIVE', 1000)
    elif state in FAR_DRIVE_STATES:
        return ('DRIVE', 1500)
    else:
        return ('FLY', 2500)

def clean_value(val):
    """Convert NULL/PrivacySuppressed to empty"""
    if val in ['NULL', 'PrivacySuppressed', 'NA', 'PS', '']:
        return ''
    return val

# Columns we need from scorecard
scorecard_columns = [
    'UNITID',
    'INSTNM',      # Institution name (for reference)
    'STABBR',      # State
    'ADM_RATE',
    'SATVR25',
    'SATVR75',
    'SATMT25',
    'SATMT75',
    'SATVRMID',
    'SATMTMID',
    'ACTCM25',
    'ACTCM75',
    'ACTCMMID',
]

# Output columns
output_columns = [
    'unitid',
    'name',
    'state',
    'travel_type',
    'annual_travel_cost',
    'admission_rate',
    'sat_read_25',
    'sat_read_75',
    'sat_math_25',
    'sat_math_75',
    'sat_read_mid',
    'sat_math_mid',
    'act_25',
    'act_75',
    'act_mid',
]

print("Generating comprehensive update file...")
print("Travel cost logic:")
print(f"  CLOSE DRIVE ({', '.join(CLOSE_DRIVE_STATES)}): $600/year")
print(f"  MEDIUM DRIVE ({', '.join(MEDIUM_DRIVE_STATES)}): $1,000/year")
print(f"  FAR DRIVE ({', '.join(FAR_DRIVE_STATES)}): $1,500/year")
print(f"  FLY (all other states): $2,500/year")
print()

rows_processed = 0
drive_count = 0
fly_count = 0

with open(scorecard_file, 'r', encoding='utf-8') as infile, \
     open(output_file, 'w', newline='', encoding='utf-8') as outfile:

    reader = csv.DictReader(infile)
    writer = csv.writer(outfile)

    # Write header
    writer.writerow(output_columns)

    for row in reader:
        rows_processed += 1

        unitid = clean_value(row.get('UNITID', ''))
        name = clean_value(row.get('INSTNM', ''))
        state = clean_value(row.get('STABBR', ''))

        if not unitid:
            continue

        # Get travel info
        travel_type, travel_cost = get_travel_info(state)

        if travel_type == 'DRIVE':
            drive_count += 1
        else:
            fly_count += 1

        # Get admission data
        admission_rate = clean_value(row.get('ADM_RATE', ''))
        sat_read_25 = clean_value(row.get('SATVR25', ''))
        sat_read_75 = clean_value(row.get('SATVR75', ''))
        sat_math_25 = clean_value(row.get('SATMT25', ''))
        sat_math_75 = clean_value(row.get('SATMT75', ''))
        sat_read_mid = clean_value(row.get('SATVRMID', ''))
        sat_math_mid = clean_value(row.get('SATMTMID', ''))
        act_25 = clean_value(row.get('ACTCM25', ''))
        act_75 = clean_value(row.get('ACTCM75', ''))
        act_mid = clean_value(row.get('ACTCMMID', ''))

        writer.writerow([
            unitid,
            name,
            state,
            travel_type,
            travel_cost,
            admission_rate,
            sat_read_25,
            sat_read_75,
            sat_math_25,
            sat_math_75,
            sat_read_mid,
            sat_math_mid,
            act_25,
            act_75,
            act_mid,
        ])

        if rows_processed % 1000 == 0:
            print(f"  Processed {rows_processed} rows...")

print(f"\nDone!")
print(f"Total schools: {rows_processed}")
print(f"DRIVE schools: {drive_count}")
print(f"FLY schools: {fly_count}")
print(f"\nOutput saved to: {output_file}")
print("\nNext steps:")
print("1. Open this CSV in Google Sheets")
print("2. Add columns to Supabase (run the ALTER TABLE SQL)")
print("3. Use this data to update your schools table")
