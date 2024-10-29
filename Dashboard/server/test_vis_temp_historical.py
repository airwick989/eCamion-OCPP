import matplotlib.pyplot as plt
import pandas as pd
import weather_stats
from db import db_helper
from weatherapi import callapi

esssensor = weather_stats.esssensor
sensordata = esssensor[esssensor["system_id"] == 1]
#populate missing values in and filter the following columns
esssensor_columns = ['timestamp', 'system_id', 'sys_humidity', 'sys_temp', 'sys_dew_point']
sensordata = db_helper.populate_and_filter(sensordata, esssensor_columns)

cabinet_coords = weather_stats.get_coords()

for coord in cabinet_coords:
    if 1 in cabinet_coords[coord]['cabinets']:
        coords = coord

hourly_weather = callapi.get_weather_stats(lat=coords[0], long=coords[1], start=str(cabinet_coords[coords]['earliest_timestamp'].date()), end=str(cabinet_coords[coords]['latest_timestamp'].date()))

print("sys_data")
print(sensordata['sys_temp'].min())
print(sensordata['sys_temp'].mean())
print(sensordata['sys_temp'].max())
print("\next_data")
print(hourly_weather['temperature_2m'].min())
print(hourly_weather['temperature_2m'].mean())
print(hourly_weather['temperature_2m'].max())

plt.plot(sensordata['timestamp'], sensordata['sys_temp'], label='cabinet 1 temperature', color='blue')
plt.plot(hourly_weather['date'], hourly_weather['temperature_2m'], label=f'external temperature at {coords}', color='red')
plt.xlabel('Datetime')
plt.ylabel('Temperature')
plt.legend()
plt.show()