from flask import Flask, jsonify, request
from flask_cors import CORS
import j_health
from db import db_helper
import cabinet_health
from weatherapi import callapi
import weather_stats
import pandas as pd
from ml_pred import ml_pred
import os
import json
from datetime import datetime
import module_health

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
essstatus = cabinet_health.essstatus
ml_pass = ml_pred()




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
    import pandas as pd
    
    # Ensure both timestamp columns are in datetime format
    sensordata['timestamp'] = pd.to_datetime(sensordata['timestamp'])
    weatherdata['date'] = pd.to_datetime(weatherdata['date'])
    
    # Handle timezone-naive and timezone-aware timestamps
    if sensordata['timestamp'].dt.tz is None:
        sensordata['timestamp'] = sensordata['timestamp'].dt.tz_localize('GMT')
    sensordata['timestamp'] = sensordata['timestamp'].dt.tz_convert(None)
    
    if weatherdata['date'].dt.tz is None:
        weatherdata['date'] = weatherdata['date'].dt.tz_localize('GMT')
    weatherdata['date'] = weatherdata['date'].dt.tz_convert(None)
    
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
        sensordata_weather[column] = weatherdata_interp[column].reindex(
            sensordata_weather.index, method='nearest', tolerance='1T'
        )

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

    voltagedata = essstatus[essstatus["system_id"] == id]
    data["voltagedata"] = {col: voltagedata[col].tolist() for col in voltagedata.columns}

    data["upuntil"] = cabinet_coords[coords]['latest_timestamp']

    return jsonify(data)




@app.route('/prediction')
def get_prediction():
    id = int(request.args.get("cabinetid"))
    folder_path = "./predictiondata/"

    try:
        # List all files in the folder
        for file in os.listdir(folder_path):
            file_path = f"{folder_path}{file}"

        with open(file_path, 'r') as file:
            data = json.load(file)

        chartdata = data["data"][str(id)]
        timestamps = chartdata['history']['time']
        upuntil = max([datetime.fromisoformat(ts) for ts in timestamps]).isoformat()

        return jsonify({
            "chartdata": chartdata,
            "upuntil": upuntil,
            "processedtime": data['processed_time']
        })
    except Exception as e:
         return jsonify({"error": e}), 400
    



@app.route('/jsummaries')
def get_jsummaries():
    id = int(request.args.get("cabinetid"))

    try:
        j_summaries = j_health.get_j_summaries(id)

        cabinet_coords = weather_stats.get_coords()
        for coord in cabinet_coords:
            if id in cabinet_coords[coord]['cabinets']:
                coords = coord
      
        data = {
            "jsummaries": j_summaries,
            "upuntil": cabinet_coords[coords]['latest_timestamp'],
        }
        return jsonify(data)
    except Exception as e:
         return jsonify({"error": e}), 400
    



@app.route('/jdata')
def get_jdata():
    cabid = int(request.args.get("cabinetid"))
    jid = int(request.args.get("chargerid"))

    try:

        cabinet_coords = weather_stats.get_coords()
        for coord in cabinet_coords:
            if cabid in cabinet_coords[coord]['cabinets']:
                coords = coord
                break
        hourly_weather = callapi.get_weather_stats(lat=coords[0], long=coords[1], start=str(cabinet_coords[coords]['earliest_timestamp'].date()), end=str(cabinet_coords[coords]['latest_timestamp'].date()))

        data = j_health.get_j_data(cabid, jid)
        merged_data = interpolate_weather_data( data["chartdata"], hourly_weather)
        chartdata = {col: merged_data[col].tolist() for col in merged_data.columns}
        tabledata = {col: data["tabledata"][col].tolist() for col in data["tabledata"].columns}
        
        
        with open("jtablethresholds.json", "r") as file:
            tablethresholds = json.load(file)

        try:
            thresholds = tablethresholds[str(cabid)][str(jid)]
        except KeyError:
            thresholds = None

        j_data = {
            "chartdata": chartdata,
            "tabledata": tabledata,
            "tablethresholds": thresholds,
        }
        return jsonify(j_data)
    except Exception as e:
         return jsonify({"error": e}), 400
    



def precheckThresholds(tablethresholds, cabid, jid, header):
    if cabid not in tablethresholds:
            tablethresholds[cabid] = {}
    if jid not in tablethresholds[cabid]:
        tablethresholds[cabid][jid] = {
            'Total Session Duration (seconds)': { 
                'low': None, 
                'high': None 
            },
            'Average Power Delivered (kW)': { 
                'low': None, 
                'high': None 
            },
            'Maximum Power Delivered (kW)': { 
                'low': None, 
                'high': None 
            }
        }
    
    return tablethresholds


@app.route('/setTableThresholds')
def set_thresholds():
    cabid = str(request.args.get("cabinetid"))
    jid = str(request.args.get("chargerid"))
    header = request.args.get("header")
    clear = request.args.get("clear") == "1"
    print(f"CLEAR: {clear}, TYPE: {type(clear)}")

    try:

        with open("jtablethresholds.json", "r") as file:
            tablethresholds = json.load(file)

        tablethresholds = precheckThresholds(tablethresholds, cabid, jid, header)

        if not clear:
            lowerbound = request.args.get("lowerbound")
            upperbound = request.args.get("upperbound")

            if lowerbound.strip() != "":
                tablethresholds[cabid][jid][header]["low"] = int(lowerbound)
            else:
                tablethresholds[cabid][jid][header]["low"] = None
            if upperbound.strip() != "":
                tablethresholds[cabid][jid][header]["high"] = int(upperbound)
            else:
                tablethresholds[cabid][jid][header]["high"] = None
        else:
            tablethresholds[cabid][jid][header]["low"] = None
            tablethresholds[cabid][jid][header]["high"] = None

        with open("jtablethresholds.json", "w") as file:
            json.dump(tablethresholds, file, indent=4)

        return jsonify({
            'tablethresholds': tablethresholds[cabid][jid]
        })
    except Exception as e:
         return jsonify({"error": e}), 400
    



@app.route('/moduledata')
def get_moduledata():
    cabid = int(request.args.get("cabinetid"))

    strings = ["string1", "string2", "string3"]
    breakflag = False
    upuntil = None

    # try:
    module_readings = module_health.get_module_stats(cabid)

    #Get a timestamp for upUntil
    while True:
        for string in strings:
            if string in module_readings:
                if module_readings[string] is not None:
                    if 'Timestamp' in module_readings[string]:
                        upuntil = module_readings[string]['Timestamp'][0]
                        breakflag = True
                        break
        if breakflag:
            break

    if not breakflag:
        upuntil = 'UNAVAILABLE'
                        
    return jsonify({
        "moduledata": module_readings,
        "upuntil": upuntil,
        })
    # except Exception as e:
    #      return jsonify({"error": e}), 400




# Run the app
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)