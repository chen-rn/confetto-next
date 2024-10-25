import csv
from collections import Counter


def extract_states():
    us_states = []
    canadian_provinces = []

    with open("lib/scripts/medical_schools.csv", "r") as file:
        csv_reader = csv.reader(file)
        for row in csv_reader:
            # Skip empty rows
            if not row:
                continue

            try:
                country = row[0]
                region = row[1]

                if country == "United States of America":
                    us_states.append(region)
                elif country == "Canada":
                    canadian_provinces.append(region)

            except IndexError:
                print(f"Skipping malformed row: {row}")
                continue

    # Get unique regions and counts
    unique_us_states = sorted(set(us_states))
    unique_provinces = sorted(set(canadian_provinces))

    us_counts = Counter(us_states)
    canada_counts = Counter(canadian_provinces)

    print("\nUnited States:")
    for state in unique_us_states:
        print(f"{state}: {us_counts[state]} schools")
    print(f"\nTotal US states with medical schools: {len(unique_us_states)}")

    print("\nCanada:")
    for province in unique_provinces:
        print(f"{province}: {canada_counts[province]} schools")
    print(f"\nTotal Canadian provinces with medical schools: {len(unique_provinces)}")


if __name__ == "__main__":
    extract_states()
