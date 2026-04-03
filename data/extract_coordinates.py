import csv

# Reads the full College Scorecard and outputs ONLY unitid + coordinates
# No empty numeric fields = no Supabase import errors

scorecard_file = '/Users/inchwormdesign/Downloads/College_Scorecard_Raw_Data_10032025/MERGED2023_24_PP.csv'
output_file = '/Users/inchwormdesign/Downloads/College_Scorecard_Raw_Data_10032025/coordinates_only.csv'

rows_written = 0
rows_skipped = 0

with open(scorecard_file, 'r', encoding='utf-8') as infile, \
     open(output_file, 'w', newline='', encoding='utf-8') as outfile:

    reader = csv.DictReader(infile)
    writer = csv.writer(outfile)
    writer.writerow(['unitid', 'latitude', 'longitude'])

    for row in reader:
        unitid = row.get('UNITID', '').strip()
        lat    = row.get('LATITUDE', '').strip()
        lng    = row.get('LONGITUDE', '').strip()

        # Only write rows that have all three values
        if unitid and lat and lng and lat not in ('NULL', 'PrivacySuppressed') and lng not in ('NULL', 'PrivacySuppressed'):
            writer.writerow([unitid, lat, lng])
            rows_written += 1
        else:
            rows_skipped += 1

print(f"Done!")
print(f"  Rows with coordinates: {rows_written}")
print(f"  Rows skipped (missing data): {rows_skipped}")
print(f"  Output: {output_file}")
