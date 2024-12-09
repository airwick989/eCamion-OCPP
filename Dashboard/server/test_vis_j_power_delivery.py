import j_health
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

publicsession = j_health.publicsession

for index, row in publicsession.iterrows():
    tmp_publicsession = publicsession[(publicsession['system_id'] == row['system_id']) & (publicsession['charger_id'] == row['charger_id'])]
    break

tmp_publicsession['end_time'] = pd.to_datetime(tmp_publicsession['end_time']).dt.tz_localize(None)

print(tmp_publicsession)

# Set up figure
plt.figure(figsize=(14, 6))

# Bar plot for max and average power delivery per session
sns.barplot(data=tmp_publicsession, x=tmp_publicsession['end_time'], y="maxpowerdeli", color="steelblue", label="Max Power Delivery")
sns.barplot(data=tmp_publicsession, x=tmp_publicsession['end_time'], y="avepowerdeli", color="orange", label="Average Power Delivery")

# Labels and legend
plt.xlabel("Timestamp")
plt.ylabel("Power Delivery (kW)")
plt.title(f"Max and Average Power Delivery per Session (Cabinet {row['system_id']}, J Station {row['charger_id']})")
plt.legend()
plt.xticks(rotation=90)
plt.show()
