from datetime import datetime
f = open("data/crimedata.csv", "r")
data = f.read()



def data_clean_func(d):
    crime_counts = {}
    new_list = []
    crime_with_location = []
    no_location_list = []

    rows = d.split("\n")
    last_value = len(rows) - 1

    data_split = rows[1:last_value]
    # data_split = rows[1:2]

    for item in data_split:
        rows_split = item.split(",")

        crime_report_by = rows_split[2]
        crime_long = rows_split[4]
        crime_lat = rows_split[5]
        crime_type = rows_split[9]
        crime_outcome = rows_split[10]
        crime_date = rows_split[1]

        # only float identified numbers
        if crime_long != '':
            crime_long = float(crime_long)
            crime_lat = float(crime_lat)

            crime_with_location.append([item])
        else:
            no_location_list.append([item])

        crime = {'date': crime_date, 'reported_by': crime_report_by, 'long': crime_long, 'latitude': crime_lat, 'type': crime_type, 'outcome': crime_outcome}

        new_list.append(crime)

    return new_list
cleaned_data = data_clean_func(data)

# print(len(cleaned_data))

# print(cleaned_data)


# data cleaning to check for empty spaces, own
# data sanitisation
# data comparison (multiple views)
# merging two data sets

# pipe through and api endpoint
# leaf.js
