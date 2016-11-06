from datetime import datetime

f = open("data/crimedata.csv", "r")
data = f.read()
# crime_data = []
new_list = []

rows = data.split('\n')
last_row_value = len(rows) - 1
data_split = rows[1:last_row_value]

# findings
# total crimes count
count = 0

# no location crimes count and list
no_location_list = []
no_location_count = len(no_location_list)

# crime with location
crime_with_location = []

for item in data_split:
    rows_split = item.split(',')
    crime_date = rows_split[1]
    # date_clean = datetime.strptime(crime_date, "%Y-%m")

    count += 1

    crime_report_by = rows_split[2]
    crime_long = rows_split[4]
    crime_lat = rows_split[5]
    crime_type = rows_split[9]
    crime_outcome = rows_split[10]

# only float identified numbers
    if crime_long != '':
        crime_long = float(crime_long)
        crime_lat = float(crime_lat)

        crime_with_location.append([item])
    else:
        no_location_list.append([item])

    crime = [crime_date, crime_report_by, crime_long, crime_lat, crime_type, crime_outcome]

    new_list.append(crime)

# print(new_list[0: 4])

# use new_list to count how many violence occurs
crime_counts = {}

for item in new_list:
    if item[4] in crime_counts:
        crime_counts[item[4]] = crime_counts[item[4]] + 1
        # print(item[4])
    else:
        crime_counts[item[4]] = 1
        # print("no item")
# print(crime_counts)

# function crime counts
def count_crime_types(list):
    if item[4] in list:
        list[item[4]] = list[item[4]] + 1
        return list
    else:
        list[item[4]] = 1
        return list

crime_rates_numbers = count_crime_types(crime_counts)
print(crime_rates_numbers)