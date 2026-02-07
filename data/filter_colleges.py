import csv

input_file = "Most-Recent-Cohorts-Institution.csv"
output_file = "crown_hub_colleges.csv"

columns_needed = ["UNITID", "INSTNM", "CITY", "STABBR", "CONTROL", "UGDS", "INSTURL", "NPCURL", "COSTT4_A", "TUITIONFEE_IN", "TUITIONFEE_OUT", "ROOMBOARD_ON", "BOOKSUPPLY", "NPT4_PUB", "NPT4_PRIV", "NPT41_PUB", "NPT42_PUB", "NPT43_PUB", "NPT44_PUB", "NPT45_PUB", "NPT41_PRIV", "NPT42_PRIV", "NPT43_PRIV", "NPT44_PRIV", "NPT45_PRIV", "PCTFLOAN", "DEBT_MDN", "C150_4", "C150_4_PELL", "CDR3", "MD_EARN_WNE_P10", "ENDOWMENT", "LATITUDE", "LONGITUDE", "ICLEVEL", "PREDDEG", "HIGHDEG"]

print("Reading data...")
rows_kept = 0

with open(input_file, 'r', encoding='utf-8-sig') as infile:
    reader = csv.DictReader(infile)
    available = [c for c in columns_needed if c in reader.fieldnames]
    with open(output_file, 'w', newline='', encoding='utf-8') as outfile:
        writer = csv.DictWriter(outfile, fieldnames=available)
        writer.writeheader()
        for row in reader:
            try:
                if row.get('CONTROL') == '3': continue
                if row.get('ICLEVEL') not in ['1', '2']: continue
                ugds = row.get('UGDS', '')
                if not ugds or ugds in ['NULL', 'PrivacySuppressed']: continue
                if float(ugds) < 100: continue
                writer.writerow({k: row.get(k, '') for k in available})
                rows_kept += 1
            except: continue

print(f"Done! Kept {rows_kept} schools. Saved to {output_file}")
