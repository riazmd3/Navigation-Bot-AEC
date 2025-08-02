import csv
from xml.dom.minidom import Document

# Paths
csv_file_path = 'geolocation_data_2025-07-31.csv'
kml_file_path = '/mnt/data/output.kml'

# Create KML document
doc = Document()
kml = doc.createElement('kml')
kml.setAttribute('xmlns', 'http://www.opengis.net/kml/2.2')
doc.appendChild(kml)

document = doc.createElement('Document')
kml.appendChild(document)

# Read CSV and create placemarks
with open(csv_file_path, 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        placemark = doc.createElement('Placemark')

        name = doc.createElement('name')
        name.appendChild(doc.createTextNode(f"S.No: {row['S.No']}"))
        placemark.appendChild(name)

        description = d
