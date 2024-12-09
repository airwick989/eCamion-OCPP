from flask import Flask, jsonify, request
from flask_cors import CORS
import j_health
from db import db_helper
import cabinet_health

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for cross-origin requests (to allow communication with React frontend)
CORS(app)

#preload all necessary data
publicsession = j_health.publicsession
powercore = j_health.powercore
systems_chargers = list(publicsession[['system_id', 'charger_id']].drop_duplicates().itertuples(index=False, name=None))
publicsystems = db_helper.query_db("public_systems")[["id", "site_name"]]




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


@app.route('/cabinethealth')
def get_cabinet_health():
    id = str(request.args.get("cabinetid"))
    print(id)
    if id is None:
        return jsonify({"error": "Missing cabinet id parameter"}), 400
    data = {}
    
    try:
        cabinet_reading = cabinet_health.cabinet_readings[id]
    except KeyError:
        return jsonify({"error": "Cabinet does not have any data"}), 400

    data["cabinet_health"] = cabinet_reading

    return jsonify(data)




# Run the app
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)