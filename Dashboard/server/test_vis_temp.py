import cabinet_health
import matplotlib.pyplot as plt
import pandas as pd

data = cabinet_health.cabinet_readings

# Function to prepare data for plotting
def prepare_data_for_plot(data, metric):
    rows = []
    for system, readings in data.items():
        print(readings)
        sys_values = readings[metric]['sys']
        ext_values = readings[metric]['ext']
        rows.append([system, 'sys', sys_values['min'], sys_values['max'], sys_values['avg']])
        rows.append([system, 'ext', ext_values['min'], ext_values['max'], ext_values['avg']])
        
        break   ####

    df = pd.DataFrame(rows, columns=['system', 'type', 'min', 'max', 'avg'])
    return df

# Prepare data for 'temp' readings
df_temp = prepare_data_for_plot(data, 'temp')

# Plot a grouped bar chart for 'temp'
df_temp.set_index(['system', 'type']).unstack().plot(kind='bar', figsize=(10, 6))
plt.title('Temperature (Sys vs Ext) for Each System')
plt.ylabel('Temperature (°C)')
plt.xlabel('System ID')
plt.xticks(rotation=0)
plt.legend(['Min (Ext)', 'Min (Sys)', 'Max (Ext)', 'Max (Sys)', 'Avg (Ext)', 'Avg (Sys)'], loc='upper left')
plt.tight_layout()
plt.show()