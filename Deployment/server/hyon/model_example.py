import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from tslearn.metrics import cdist_dtw
from sklearn_extra.cluster import KMedoids
from sklearn.metrics import silhouette_score, silhouette_samples
import matplotlib.pyplot as plt
from sklearn.metrics import silhouette_samples
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import root_mean_squared_error
from sklearn.metrics import r2_score
from sklearn.metrics import mean_absolute_error
import json
from datetime import datetime


# Getting data
datafile_path = './multiple_charging_stations.csv'
df = pd.read_csv(datafile_path)
df['time'] = df['time'] = pd.to_datetime(df['time'], utc=True).dt.tz_localize(None)

# normalize, where mean is 0 and std deviation is 1
scaler = StandardScaler()
df['scaled_totenergydeli'] = scaler.fit_transform(df['totenergydeli'].values.reshape(-1, 1))
# Dropping unncessary columns
columns_to_keep = ['time','totenergydeli','scaled_totenergydeli','system_id']
df = df[columns_to_keep]

# Separate the sessions data by charging stations and resample them.
# Resampled data frames are organized in an array named 'time_series_data'

unique_system_ids = df['system_id'].unique()
scaled_time_series_data = []
for system_id in unique_system_ids:
    system_df = df[df['system_id'] == system_id]
    system_df.sort_values(by='time')
    system_df = system_df.set_index('time').resample('2h').sum()
    system_df = system_df[['scaled_totenergydeli']]
    # time_series_data.append(system_df.to_numpy())
    scaled_time_series_data.append(system_df)

# Compute DTW distance matrix required for silhouette score calculation. This step may take awhile
time_serires = [df['scaled_totenergydeli'].values for df in scaled_time_series_data]
print("Creating DTW matrix")
dtw_matrix = cdist_dtw(time_serires)

# Finding the best cluster number
best_sil_score = None
best_cluster_count = None
for i in range(4,11):
  kmedoids = KMedoids(n_clusters=i, metric="precomputed", random_state=0)
  cluster_labels = kmedoids.fit_predict(dtw_matrix)
  sil_score = silhouette_score(dtw_matrix, cluster_labels, metric="precomputed")
  sil_samples = silhouette_samples(dtw_matrix, cluster_labels, metric="precomputed")
  if best_sil_score is None or sil_score > best_sil_score:
    best_sil_score = sil_score
    best_cluster_count = i
print("Best cluster count: {} with sil_score {}".format(best_cluster_count,best_sil_score))

# adding cluster_group value to df
df['cluster_group'] = df['system_id'].map(lambda x: cluster_labels[unique_system_ids.tolist().index(x)])

# creating time feature
df['time_of_day'] = df['time'].dt.hour + df['time'].dt.minute / 60  # Fractional hours
df['day_of_week'] = df['time'].dt.dayofweek
df.head()

def create_lagged_features(data, max_lag,column_name):
    # creates lag features based on name of column provided
    df = data.copy()
    for lag in range(1, max_lag + 1):
        df[f'lag_{lag}'] = df[column_name].shift(lag)
    df.dropna(inplace=True)
    return df

unique_system_ids = df['system_id'].unique()
time_series_by_station = []
for system_id in unique_system_ids:
    system_df = df[df['system_id'] == system_id]
    system_df.sort_values(by='time')
    system_df = create_lagged_features(system_df, 12, 'scaled_totenergydeli')
    time_series_by_station.append(system_df)
processed_df = pd.concat(time_series_by_station, ignore_index=True)


processed_dict = {"data":{}}
unique_system_ids = processed_df['system_id'].unique()
train_df = pd.DataFrame()
test_df = pd.DataFrame()
print("Making predictions and evalutions")
for system_id in unique_system_ids:
    print("Processing charging station ID: {}".format(system_id))
    cs_dict = {"cs_id": system_id} 
    system_df = processed_df[processed_df['system_id'] == system_id]
    system_df.sort_values(by='time')

    # evaluation
    train_size = int(len(system_df)*0.8)
    train_df = system_df[:train_size]
    test_df = system_df[train_size:]
    X_train = train_df.drop(columns=['scaled_totenergydeli','totenergydeli','time'])
    y_train = train_df['scaled_totenergydeli']
    X_test = test_df.drop(columns=['scaled_totenergydeli','totenergydeli','time'])
    y_test = test_df['scaled_totenergydeli']

    model = RandomForestRegressor()
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    rmse = root_mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    cs_dict["rmse"] = rmse
    cs_dict["r2"] = r2
    cs_dict["mae"] = mae

    # Iterative prediction 
    forecast_horizon = 3 * 12 # number of predictions
    last_row = system_df.iloc[-1]

    next_time = last_row['time'] + pd.Timedelta(hours=2)
    predictions = pd.DataFrame()
    for i in range(forecast_horizon):
        input_row = {
        'system_id': last_row['system_id'],
        'cluster_group': last_row['cluster_group'],
        'time_of_day': next_time.hour + next_time.minute/60,
        'day_of_week': next_time.dayofweek,
        'lag_1': last_row['scaled_totenergydeli'],
        'lag_2': last_row['lag_1'],
        'lag_3': last_row['lag_2'],
        'lag_4': last_row['lag_3'],
        'lag_5': last_row['lag_4'],
        'lag_6': last_row['lag_5'],
        'lag_7': last_row['lag_6'],
        'lag_8': last_row['lag_7'],
        'lag_9': last_row['lag_8'],
        'lag_10': last_row['lag_9'],
        'lag_11': last_row['lag_10'],
        'lag_12': last_row['lag_11']
        }
        input_row_df = pd.DataFrame([input_row])
        prediction = model.predict(input_row_df)[0]
        input_row_df['scaled_totenergydeli'] = float(prediction)
        input_row_df['totenergydeli'] = float(scaler.inverse_transform(prediction.reshape(-1, 1))[0][0])
        input_row_df['time'] = next_time
        predictions = pd.concat([predictions, input_row_df])
        last_row = input_row_df.iloc[0]
        next_time = next_time + pd.Timedelta(hours=2)
    # prepare history and predictions and add to JSON as arrays
    predictions = predictions.reset_index(drop=True)
    system_df = system_df[['time','totenergydeli']]
    predictions = predictions[['time','totenergydeli']]
    history_time = system_df['time'].to_numpy()
    history_totenergydeli = system_df['totenergydeli'].to_numpy()
    predictions_time = predictions['time'].to_numpy()
    predictions_totenergydeli = predictions['totenergydeli'].to_numpy()
    cs_dict["history"] = {"time":history_time}
    cs_dict["history"] = {"totenergydeli": history_totenergydeli}
    cs_dict['predictions'] = {"time":predictions_time}
    cs_dict['predictions'] = {"totenergydeli": predictions_totenergydeli}
    processed_dict["data"][int(system_id)] = cs_dict
processed_dict["processed_time"] = datetime.now().isoformat()

# save the processed data into JSON locally 
current_date = datetime.now().strftime("%Y-%m-%d")  
file_name = f"data_{current_date}.json"
# print(processed_dict)

# Type checking for JSON conversion 
def pandas_to_json(obj):
    if isinstance(obj, pd.DataFrame):
        return obj.to_dict(orient='records')  
    if isinstance(obj, pd.Timestamp):
        return obj.isoformat() 
    if isinstance(obj, pd.Timedelta):
        return str(obj)  
    if isinstance(obj, pd.Series):
        return obj.tolist()  # Convert series to list
    return str(obj)  # Fallback to string conversion

# Save the dictionary as a JSON file
with open(file_name, "w") as file:
    json.dump(processed_dict, file,default=pandas_to_json, indent=4)

print(f"JSON file saved as {file_name}")

