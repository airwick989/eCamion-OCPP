import cabinet_health
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

data = cabinet_health.cabinet_readings

# Function to prepare data for plotting
def prepare_data_for_plot(data, metric):
    rows = []
    for system, readings in data.items():
        sys_values = readings[metric]['sys']
        ext_values = readings[metric]['ext']
        rows.append([system, 'sys', sys_values['min'], sys_values['max'], sys_values['avg']])
        rows.append([system, 'ext', ext_values['min'], ext_values['max'], ext_values['avg']])
    df = pd.DataFrame(rows, columns=['system', 'type', 'min', 'max', 'avg'])
    return df

# Prepare data for 'temp' readings
df_temp = prepare_data_for_plot(data, 'temp')

# Create the boxplot
plt.figure(figsize=(10, 6))
sns.boxplot(x='system', y='avg', hue='type', data=df_temp)

# Overlay the boxplot with stripplot to show individual data points (dots), color by "type"
sns.stripplot(x='system', y='avg', hue='type', data=df_temp,
              dodge=True, marker='o', palette="Set1", alpha=0.8)

# Adjust title, labels, and legend
plt.title('Average Temperature (Sys vs Ext) with Colored Data Points')
plt.ylabel('Average Temperature (°C)')
plt.xlabel('System ID')

# Avoid duplicate legends (from both boxplot and stripplot)
handles, labels = plt.gca().get_legend_handles_labels()
plt.legend(handles[0:2], labels[0:2], title='Type')

plt.show()