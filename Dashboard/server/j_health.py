from db import db_helper
import pandas as pd
from datetime import timedelta


#J HEALTH -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

#query db
publicsession = db_helper.query_db("public_session")
powercore = db_helper.query_db("shadow_powercore")
#cast column values in case
publicsession.rename(columns={'timetrans': 'end_time'}, inplace=True)
publicsession['end_time'] = pd.to_datetime(publicsession['end_time'], format='mixed')
powercore['timestamp'] = pd.to_datetime(powercore['timestamp'], format='mixed')

publicsession_columns = ['id', 'end_time', 'totsessdur', 'maxpowerdeli', 'avepowerdeli', 'startsoc', 'endsoc', 'system_id', 'charger_id']
powercore_columns = ['timestamp', 'system_id', 'name', 'pc_child_present_temperature', 'pc_parent_present_temperature']

systems_chargers = list(publicsession[['system_id', 'charger_id']].drop_duplicates().itertuples(index=False, name=None))
j_health = {}

has_temp_hist = []
start_times = []

powercore = db_helper.populate_and_filter(powercore, powercore_columns)
for system_charger in systems_chargers:
    tmp_publicsession = db_helper.populate_and_filter(publicsession[(publicsession['system_id'] == system_charger[0]) & (publicsession['charger_id'] == system_charger[1])], publicsession_columns)
    tmp_powercore = powercore[(powercore['system_id'] == system_charger[0]) & (powercore['name'] == system_charger[1])]

    for index, row in tmp_publicsession.iterrows():
        start_time = row['end_time'] - timedelta(seconds=row['totsessdur'])
        start_times.append(start_time)

        tmp_powercore = tmp_powercore[(tmp_powercore['timestamp'] >= start_time) & (tmp_powercore['timestamp'] <= row['end_time'])]
        
        if len(tmp_powercore) > 0:
            has_temp_hist.append(True)
        else:
            has_temp_hist.append(False)


publicsession['has_temp_hist'] = has_temp_hist
publicsession['start_time'] = start_times
publicsession = db_helper.populate_and_filter(publicsession, publicsession_columns + ['start_time', 'has_temp_hist'])

publicsession = publicsession.sort_values(by='end_time')
powercore = powercore.sort_values(by='timestamp')

def get_j_summaries(cabinet_id):
    filtered_publicsession = publicsession[publicsession['system_id'] == cabinet_id]
    chargers = filtered_publicsession['charger_id'].unique()
    j_summaries = {}
    
    for charger in chargers:
        tmp_filtered_publicsession = filtered_publicsession[filtered_publicsession['charger_id'] == charger]        
        j_summaries[int(charger)] = {
            "sessions": int(tmp_filtered_publicsession.shape[0]),
            "totalsessiontime": int(tmp_filtered_publicsession['totsessdur'].sum())
        }

    return dict(sorted(j_summaries.items()))


def get_j_data(cabinet_id, charger_id):
    filtered_powercore = powercore[(powercore['system_id'] == cabinet_id) & (powercore['name'] == charger_id)]
    filtered_powercore = filtered_powercore[["timestamp", "pc_child_present_temperature", "pc_parent_present_temperature"]]

    filtered_publicsession = publicsession[(publicsession['system_id'] == cabinet_id) & (publicsession['charger_id'] == charger_id)]
    filtered_publicsession = filtered_publicsession[["id", "start_time", "totsessdur", "maxpowerdeli", "avepowerdeli", "startsoc", "endsoc"]]

    data = {
        "chartdata" : filtered_powercore,
        "tabledata" : filtered_publicsession,
    }

    return data