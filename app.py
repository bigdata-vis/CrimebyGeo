__author__ = 'simba'

from flask import Flask
from flask import jsonify
from flask_cors import CORS

import crimerates2
import convert_geojson

app = Flask(__name__)
CORS(app)

@app.route('/api/v1/crime_data')
def display_crimedata():
    data_export = crimerates2.cleaned_data
    return jsonify(data_export)

@app.route('/api/v1/crime_data/meta')
def accept_calls():
    data_export = crimerates2.crime_rates_numbers
    return jsonify(data_export)

if __name__ == '__main__':
    # app.run(host='127.0.0.1', port=8087)
    app.run()