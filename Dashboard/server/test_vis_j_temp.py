import j_health
import matplotlib.pyplot as plt

publicsession = j_health.publicsession[j_health.publicsession['has_temp_hist'] == True]
powercore = j_health.powercore

for index, row in publicsession.iterrows():
    tmp_powercore = powercore[(powercore['system_id'] == row['system_id']) & (powercore['name'] == row['charger_id'])]
    break

print(tmp_powercore)

# Plotting
plt.figure(figsize=(12, 6))
plt.plot(tmp_powercore['timestamp'], tmp_powercore['pc_child_present_temperature'], label='Child Temperature', color='blue')
plt.plot(tmp_powercore['timestamp'], tmp_powercore['pc_parent_present_temperature'], label='Parent Temperature', color='orange')

# Labeling
plt.xlabel('Timestamp')
plt.ylabel('Temperature (°C)')
plt.title(f"J Temp Over Time (Cabinet {row['system_id']}, J Station {row['charger_id']})")
plt.legend()
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()