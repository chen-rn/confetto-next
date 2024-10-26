import csv
import re

# Read the input file and write to CSV
with open("schools.txt", "r", encoding="utf-8") as infile, open(
    "medical_schools.csv", "w", encoding="utf-8", newline=""
) as outfile:

    # Create CSV writer
    writer = csv.writer(outfile)

    # Write header
    writer.writerow(["Country", "State", "School", "City"])

    # Process each line
    for line in infile:
        # Split by tabs and strip any whitespace
        parts = [part.strip() for part in line.split("\t")]
        if len(parts) == 3:  # Ensure we have all three components
            # Extract country and state
            country_state = parts[0]
            # Use regex to extract state code from parentheses
            state_match = re.search(r"\((.*?)\)", country_state)
            if state_match:
                state = state_match.group(1)  # Get just the state code
                country = "United States of America"
            else:
                state = ""
                country = country_state

            school = parts[1]
            city = parts[2]

            # Write the row with separated columns
            writer.writerow([country, state, school, city])
