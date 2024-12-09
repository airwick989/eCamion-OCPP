from db import db_helper
import pandas as pd
import json
import weather_stats as ws


#CABINET HEALTH -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

#group by system_id
esssensor = db_helper.query_db("shadow_esssensor").groupby('system_id').apply(lambda x: x).reset_index(drop=True)
#cast column values in case
esssensor['timestamp'] = pd.to_datetime(esssensor['timestamp'])
#order rows chronologically based on timestamp
esssensor = esssensor.sort_values(by='timestamp')

#populate missing values in and filter the following columns
esssensor_columns = ['timestamp', 'system_id', 'sys_humidity', 'sys_temp', 'sys_dew_point']
esssensor = db_helper.populate_and_filter(esssensor, esssensor_columns)

#get avgs, mins, maxes
cabinet_readings = {}
readings = [ 'sys_temp', 'sys_humidity', 'sys_dew_point']

uniq_cabinet_ids = [str(cabinet_id) for cabinet_id in sorted(esssensor['system_id'].unique().tolist())]  #also sorts ids in order and casts ids to strings

for cabinet in uniq_cabinet_ids:
    cabinet_readings[cabinet] = {
        'temp': { 'sys': {}, 'ext': {} },
        'humidity': { 'sys': {}, 'ext': {} },
        'dew_point': { 'sys': {}, 'ext': {} },
    }
for reading in readings:
    for cabinet in uniq_cabinet_ids:
        tmp = esssensor.query(f'system_id == {cabinet}')
        avg = tmp[reading].mean()
        minimum = tmp[reading].min()
        maximum = tmp[reading].max()
        latest = tmp.loc[tmp['timestamp'].idxmax()]
        cabinet_readings[cabinet][reading[len('sys_'):]]['sys'] = {
            'min': minimum,
            'max': maximum,
            'avg': avg,
            'latest': latest[reading]
        }


#weather_stats = ws.get_weather_stats()
with open('weather_stats.json', 'r') as file:
    weather_stats = json.load(file)

for cabinets_list in weather_stats:
    cabinets = cabinets_list.split()
    for cabinet in cabinets:
        try:
            for reading_type in weather_stats[cabinets_list]:
                cabinet_readings[cabinet][reading_type]["ext"] = weather_stats[cabinets_list][reading_type]
        except KeyError:
            pass

#print(json.dumps(cabinet_readings, indent=4))

#CABINET HEALTH -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------