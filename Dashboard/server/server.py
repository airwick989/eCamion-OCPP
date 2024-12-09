from flask import Flask, jsonify, request
from flask_cors import CORS
import j_health
from db import db_helper
import cabinet_health
from weatherapi import callapi
import weather_stats
import pandas as pd

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for cross-origin requests (to allow communication with React frontend)
CORS(app)

#preload all necessary data
publicsession = j_health.publicsession
powercore = j_health.powercore
systems_chargers = list(publicsession[['system_id', 'charger_id']].drop_duplicates().itertuples(index=False, name=None))
publicsystems = db_helper.query_db("public_systems")[["id", "site_name"]]
esssensor = weather_stats.esssensor




@app.route('/getstations')
def get_stations():
    data = {}
    for system, charger in systems_chargers:
        if system not in data:
            data[system] = {
                "sitename": publicsystems[publicsystems["id"] == system]["site_name"].values[0],
                "stations": []
            }
        data[system]["stations"].append(charger)
    return jsonify(data)




def interpolate_weather_data(sensordata, weatherdata):
    # Ensure both timestamp columns are in datetime format and have the same timezone
    sensordata['timestamp'] = pd.to_datetime(sensordata['timestamp']).dt.tz_convert(None)
    weatherdata['date'] = pd.to_datetime(weatherdata['date']).dt.tz_convert(None)
    
    # Set the 'date' column in weatherdata as the index
    weatherdata = weatherdata.set_index('date')

    # Interpolate the weather data based on the timestamp index
    weatherdata_interp = weatherdata.reindex(
        pd.date_range(start=weatherdata.index.min(), end=weatherdata.index.max(), freq='1T')
    ).interpolate(method='time')
    
    # Map the timestamps in sensordata to the interpolated weather data
    sensordata_weather = sensordata.copy()
    sensordata_weather = sensordata_weather.set_index('timestamp')

    # Use reindex to align timestamps and fill missing values safely
    for column in ['temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'precipitation']:
        sensordata_weather[column] = weatherdata_interp[column].reindex(sensordata_weather.index, method='nearest', tolerance='1T')

    # Reset index to restore the 'timestamp' column
    sensordata_weather = sensordata_weather.reset_index()

    return sensordata_weather




@app.route('/cabinethealth')
def get_cabinet_health():
    id = int(request.args.get("cabinetid"))
    print(id)
    if id is None:
        return jsonify({"error": "Missing cabinet id parameter"}), 400
    data = {}
    try:
        cabinet_reading = cabinet_health.cabinet_readings[str(id)]
    except KeyError:
        return jsonify({"error": "Cabinet does not have any data"}), 400
    data["cabinet_health"] = cabinet_reading

    sensordata = esssensor[esssensor["system_id"] == id]
    #populate missing values in and filter the following columns
    esssensor_columns = ['timestamp', 'system_id', 'sys_humidity', 'sys_temp', 'sys_dew_point']
    sensordata = db_helper.populate_and_filter(sensordata, esssensor_columns)
    
    cabinet_coords = weather_stats.get_coords()
    for coord in cabinet_coords:
        if id in cabinet_coords[coord]['cabinets']:
            coords = coord
    hourly_weather = callapi.get_weather_stats(lat=coords[0], long=coords[1], start=str(cabinet_coords[coords]['earliest_timestamp'].date()), end=str(cabinet_coords[coords]['latest_timestamp'].date()))

    merged_data = interpolate_weather_data(sensordata, hourly_weather)
    data["chartdata"] = {col: merged_data[col].tolist() for col in merged_data.columns}

    data["upuntil"] = cabinet_coords[coords]['latest_timestamp']

    return jsonify(data)




# Run the app
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)