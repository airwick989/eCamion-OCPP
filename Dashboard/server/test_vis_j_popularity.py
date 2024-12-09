import j_health
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

publicsession = j_health.publicsession

print(publicsession)

# Aggregating data to get session count and cumulative session duration for each station
station_stats = publicsession.groupby(["system_id", "charger_id"]).agg(
    session_count=('id', 'size'),
    total_session_duration=('totsessdur', 'sum')
).reset_index()

# Plotting
fig, ax1 = plt.subplots(figsize=(14, 6))

# Plot number of sessions per station
sns.barplot(data=station_stats, x="system_id", y="session_count", hue="charger_id", ax=ax1)
ax1.set_ylabel("Number of Sessions")
ax1.set_xlabel("Cabinet ID")
ax1.set_title("Number of Sessions and Cumulative Session Duration per Station")

# Plot cumulative session time on the secondary y-axis
ax2 = ax1.twinx()
sns.lineplot(data=station_stats, x="system_id", y="total_session_duration", hue="charger_id", 
             marker="o", ax=ax2, legend=False)
ax2.set_ylabel("Cumulative Session Duration (seconds)")

plt.show()
