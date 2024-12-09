import pandas as pd
import matplotlib.pyplot as plt
import module_health
import weather_stats
from weatherapi import callapi

module_history = module_health.get_module_history(1,1,1)

# Convert the 'timestamp' column to datetime format
module_history['timestamp'] = pd.to_datetime(module_history['timestamp'])
# Set the 'timestamp' column as the index
module_history.set_index('timestamp', inplace=True)
# Select the columns to plot
columns_to_plot = ['min_temp', 'max_temp', 'avg_temp']
# Plot each column as a separate line
plt.figure(figsize=(14, 8))
for column in columns_to_plot:
    plt.plot(module_history.index, module_history[column], label=column)


#Now the weather stats
cabinet_coords = weather_stats.get_coords()
for coord in cabinet_coords:
    if 1 in cabinet_coords[coord]['cabinets']:
        coords = coord
hourly_weather = callapi.get_weather_stats(lat=coords[0], long=coords[1], start=str(cabinet_coords[coords]['earliest_timestamp'].date()), end=str(cabinet_coords[coords]['latest_timestamp'].date()))
# Convert the 'date' column to datetime format
hourly_weather['date'] = pd.to_datetime(hourly_weather['date'])
# Set the 'date' column as the index
hourly_weather.set_index('date', inplace=True)
# Plot the temperature_2m column from hourly_weather
plt.plot(hourly_weather.index, hourly_weather['temperature_2m'], label=f"external_temp", linestyle='--')


# Add labels, title, and legend
plt.xlabel('Timestamp')
plt.ylabel('Temperature (°C)')
plt.title('Module Readings Over Time (Cabinet 1, String 1, Module 1)')
plt.legend(loc='best')
plt.grid(True)
plt.xticks(rotation=45)
plt.tight_layout()

plt.show()
