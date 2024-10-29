from db import db_helper
import pandas as pd
from weatherapi import callapi
from datetime import datetime
import json




#group by system_id
esssensor = db_helper.query_db("shadow_esssensor").groupby('system_id').apply(lambda x: x).reset_index(drop=True)
#cast column values in case
esssensor['timestamp'] = pd.to_datetime(esssensor['timestamp'])
#order rows chronologically based on timestamp
esssensor = esssensor.sort_values(by='timestamp')


def get_coords():
    #get coordinates of cabinets
    coords = db_helper.query_db("public_systems")[['id', 'latitude', 'longitude']]
    uniq_coords = coords.drop_duplicates(subset=['latitude', 'longitude'])
    #group cabinets by coordinates
    cabinet_coords = {}
    for index, row in uniq_coords.iterrows():
        tmp = coords[(coords['latitude'] == row['latitude']) & (coords['longitude'] == row['longitude'])]
        cabinet_coords[(row['latitude'],row['longitude'])] = tmp['id'].to_list()
    #find start and end times for each coordinate, used for weather data gathering
    for coord in cabinet_coords.keys():
        times = esssensor[esssensor['system_id'].isin(cabinet_coords[coord])]['timestamp']
        starttime = times.min()
        endtime = times.max()
        cabinet_coords[coord] = {
            'cabinets': cabinet_coords[coord],
            'earliest_timestamp': starttime,
            'latest_timestamp': endtime
        }


    #Remove any cabinets which have NaT timestamps, meaning no readings from them exist in esssensor
    cabinet_coords = {key: value for key, value in cabinet_coords.items() 
                    if pd.notna(value['earliest_timestamp']) and pd.notna(value['latest_timestamp'])}
    
    return cabinet_coords


def get_weather_stats():
    cabinet_coords = get_coords()
    
    #get weather data using callapi for each set of coords, and calculate the min, max, avg, and return that data in a function 
    weather_stats = {}
    for coord in cabinet_coords:
        hourly_weather = callapi.get_weather_stats(lat=coord[0], long=coord[1], start=str(cabinet_coords[coord]['earliest_timestamp'].date()), end=str(cabinet_coords[coord]['latest_timestamp'].date()))

        #convert the list of cabinet ids to a string so it can be used as a key, and reverted later in process_data
        weather_stats[" ".join(map(str, cabinet_coords[coord]['cabinets']))] = {
            'temp': {
                'min': float(hourly_weather['temperature_2m'].min()), 
                'max': float(hourly_weather['temperature_2m'].max()),
                'avg': float(hourly_weather['temperature_2m'].mean())
            },
            'humidity': {
                'min': float(hourly_weather['relative_humidity_2m'].min()),
                'max': float(hourly_weather['relative_humidity_2m'].max()),
                'avg': float(hourly_weather['relative_humidity_2m'].mean())
            },
            'dew_point': {
                'min': float(hourly_weather['dew_point_2m'].min()),
                'max': float(hourly_weather['dew_point_2m'].max()),
                'avg': float(hourly_weather['dew_point_2m'].mean())
            }
        }
 

    return weather_stats