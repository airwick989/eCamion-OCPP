import j_health
from db import db_helper
import json

#publicsession = j_health.publicsession[j_health.publicsession['has_temp_hist'] == True]
publicsession = j_health.publicsession
powercore = j_health.powercore
systems_chargers = list(publicsession[['system_id', 'charger_id']].drop_duplicates().itertuples(index=False, name=None))
publicsystems = db_helper.query_db("public_systems")[["id", "site_name"]]

# Create the dictionary
data = {}
for system, charger in systems_chargers:
    if system not in data:
        data[system] = {
            "sitename": publicsystems[publicsystems["id"] == system]["site_name"].values[0],
            "stations": []
        }
    data[system]["stations"].append(charger)
print(json.dumps(data, indent=4))

