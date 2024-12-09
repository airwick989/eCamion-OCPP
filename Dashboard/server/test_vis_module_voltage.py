import pandas as pd
import matplotlib.pyplot as plt
import module_health

module_history = module_health.get_module_history(1,1,1)

# Convert the 'timestamp' column to datetime format
module_history['timestamp'] = pd.to_datetime(module_history['timestamp'])
# Set the 'timestamp' column as the index
module_history.set_index('timestamp', inplace=True)
# Select the columns to plot
columns_to_plot = ['min_cell_voltage', 'max_cell_voltage', 'avg_cell_voltage']
# Plot each column as a separate line
plt.figure(figsize=(14, 8))
for column in columns_to_plot:
    plt.plot(module_history.index, module_history[column], label=column)


# Add labels, title, and legend
plt.xlabel('Timestamp')
plt.ylabel('Voltage (V)')
plt.title('Module Readings Over Time (Cabinet 1, String 1, Module 1)')
plt.legend(loc='best')
plt.grid(True)
plt.xticks(rotation=45)
plt.tight_layout()

plt.show()
