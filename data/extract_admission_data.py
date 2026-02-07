import csv

# Input and output files
input_file = '/Users/inchwormdesign/Downloads/College_Scorecard_Raw_Data_10032025/MERGED2023_24_PP.csv'
output_file = '/Users/inchwormdesign/Downloads/College_Scorecard_Raw_Data_10032025/admission_data.csv'

# Columns we need
columns_needed = [
    'UNITID',
    'ADM_RATE',      # Admission rate
    'SATVR25',       # SAT Reading 25th percentile
    'SATVR75',       # SAT Reading 75th percentile
    'SATMT25',       # SAT Math 25th percentile
    'SATMT75',       # SAT Math 75th percentile
    'SATVRMID',      # SAT Reading midpoint
    'SATMTMID',      # SAT Math midpoint
    'ACTCM25',       # ACT Composite 25th percentile
    'ACTCM75',       # ACT Composite 75th percentile
    'ACTCMMID',      # ACT Composite midpoint
]

# Output column names (for Supabase)
output_columns = [
    'unitid',
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

def clean_value(val):
    """Convert NULL/PrivacySuppressed to empty, keep numbers as-is"""
    if val in ['NULL', 'PrivacySuppressed', 'NA', 'PS', '']:
        return ''
    return val

print("Reading College Scorecard data...")
rows_processed = 0
rows_with_data = 0

with open(input_file, 'r', encoding='utf-8') as infile, \
     open(output_file, 'w', newline='', encoding='utf-8') as outfile:

    reader = csv.DictReader(infile)
    writer = csv.writer(outfile)

    # Write header
    writer.writerow(output_columns)

    for row in reader:
        rows_processed += 1

        # Extract values
        values = [clean_value(row.get(col, '')) for col in columns_needed]

        # Only include if we have at least UNITID and some admission data
        unitid = values[0]
        has_data = any(v != '' for v in values[1:])

        if unitid and has_data:
            writer.writerow(values)
            rows_with_data += 1

        if rows_processed % 1000 == 0:
            print(f"  Processed {rows_processed} rows...")

print(f"\nDone!")
print(f"Total rows processed: {rows_processed}")
print(f"Rows with admission data: {rows_with_data}")
print(f"Output saved to: {output_file}")
