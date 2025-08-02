import time
import geocoder
import csv

filename = "gps_data.csv"

# Create CSV if not exists
with open(filename, mode='w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(["Timestamp", "Latitude", "Longitude"])

# Log location every 1 second
try:
    while True:
        g = geocoder.ip('me')
        lat, lng = g.latlng
        timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
        with open(filename, mode='a', newline='') as f:
            writer = csv.writer(f)
            writer.writerow([timestamp, lat, lng])
        print(f"{timestamp}: {lat}, {lng}")
        time.sleep(1)
except KeyboardInterrupt:
    print("Stopped.")
