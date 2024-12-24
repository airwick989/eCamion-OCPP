import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from tslearn.metrics import cdist_dtw
from sklearn_extra.cluster import KMedoids
from sklearn.metrics import silhouette_score, silhouette_samples
import matplotlib.pyplot as plt
from sklearn.metrics import silhouette_samples
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
from sklearn.metrics import r2_score
from sklearn.metrics import mean_absolute_error
import json
from datetime import datetime
from db import db_helper
import os



def ml_pred():
   
    # Getting data
    df = db_helper.query_db("public_session")

    # Attempt to parse datetime; replace invalid formats with NaT
    df['time'] = pd.to_datetime(df['time'], errors='coerce', utc=True).dt.tz_localize(None)
    # Drop invalid entries if any exist
    if df['time'].isna().sum() > 0:
        print(f"Dropping {df['time'].isna().sum()} rows with invalid times.")
        df = df.dropna(subset=['time'])

    # Normalize, where mean is 0 and std deviation is 1
    scaler = StandardScaler()
    df['scaled_totenergydeli'] = scaler.fit_transform(df['totenergydeli'].values.reshape(-1, 1))

    # Dropping unnecessary columns
    columns_to_keep = ['time', 'totenergydeli', 'scaled_totenergydeli', 'system_id']
    df = db_helper.populate_and_filter(df, columns_to_keep)

    # Separate the sessions data by charging stations and resample them.
    unique_system_ids = df['system_id'].unique()
    scaled_time_series_data = []
    for system_id in unique_system_ids:
        system_df = df[df['system_id'] == system_id]
        system_df.sort_values(by='time', inplace=True)
        system_df = system_df.set_index('time').resample('2h').sum()
        system_df = system_df[['scaled_totenergydeli']]
        scaled_time_series_data.append(system_df)

    # Compute DTW distance matrix
    time_series = [df['scaled_totenergydeli'].values for df in scaled_time_series_data]
    print("Creating DTW matrix")
    dtw_matrix = cdist_dtw(time_series)

    # Finding the best cluster number
    best_sil_score = None
    best_cluster_count = None
    for i in range(4, 11):
        kmedoids = KMedoids(n_clusters=i, metric="precomputed", random_state=0)
        cluster_labels = kmedoids.fit_predict(dtw_matrix)
        sil_score = silhouette_score(dtw_matrix, cluster_labels, metric="precomputed")
        if best_sil_score is None or sil_score > best_sil_score:
            best_sil_score = sil_score
            best_cluster_count = i
    print(f"Best cluster count: {best_cluster_count} with sil_score {best_sil_score}")

    # Adding cluster_group value to df
    df['cluster_group'] = df['system_id'].map(lambda x: cluster_labels[unique_system_ids.tolist().index(x)])

    # Creating time features
    df['time_of_day'] = df['time'].dt.hour + df['time'].dt.minute / 60  # Fractional hours
    df['day_of_week'] = df['time'].dt.dayofweek

    # Function to create lagged features
    def create_lagged_features(data, max_lag, column_name):
        df = data.copy()
        for lag in range(1, max_lag + 1):
            df[f'lag_{lag}'] = df[column_name].shift(lag)
        df.dropna(inplace=True)
        return df

    # Creating lagged features for each system
    time_series_by_station = []
    for system_id in unique_system_ids:
        system_df = df[df['system_id'] == system_id]
        system_df.sort_values(by='time', inplace=True)
        system_df = create_lagged_features(system_df, 12, 'scaled_totenergydeli')
        time_series_by_station.append(system_df)
    processed_df = pd.concat(time_series_by_station, ignore_index=True)

    # Preparing processed data dictionary
    processed_dict = {"data": {}}
    train_df = pd.DataFrame()
    test_df = pd.DataFrame()

    print("Making predictions and evaluations")
    for system_id in unique_system_ids:

        try:
            print(f"Processing Cabinet ID: {system_id}")
            cs_dict = {"cs_id": system_id}
            system_df = processed_df[processed_df['system_id'] == system_id]
            system_df.sort_values(by='time', inplace=True)

            # Evaluation
            train_size = int(len(system_df) * 0.8)
            train_df = system_df[:train_size]
            test_df = system_df[train_size:]
            X_train = train_df.drop(columns=['scaled_totenergydeli', 'totenergydeli', 'time'])
            y_train = train_df['scaled_totenergydeli']
            X_test = test_df.drop(columns=['scaled_totenergydeli', 'totenergydeli', 'time'])
            y_test = test_df['scaled_totenergydeli']

            model = RandomForestRegressor()
            model.fit(X_train, y_train)

            # # Debug: Print features used during training
            # print("Features used for training:", X_train.columns.tolist())

            y_pred = model.predict(X_test)

            rmse = np.sqrt(mean_squared_error(y_test, y_pred))
            r2 = r2_score(y_test, y_pred)
            mae = mean_absolute_error(y_test, y_pred)
            cs_dict["rmse"] = rmse
            cs_dict["r2"] = r2
            cs_dict["mae"] = mae

            # Iterative prediction
            forecast_horizon = 3 * 12  # number of predictions
            last_row = system_df.iloc[-1]

            next_time = last_row['time'] + pd.Timedelta(hours=2)
            predictions = pd.DataFrame()
            for _ in range(forecast_horizon):
                input_row = {
                    'system_id': last_row['system_id'],
                    'cluster_group': last_row['cluster_group'],
                    'time_of_day': next_time.hour + next_time.minute / 60,
                    'day_of_week': next_time.dayofweek,
                    **{f'lag_{i}': last_row[f'lag_{i - 1}'] for i in range(2, 13)},
                    'lag_1': last_row['scaled_totenergydeli']
                }
                input_row_df = pd.DataFrame([input_row])
                
                # Ensure column order matches training data
                input_row_df = input_row_df[X_train.columns]

                # # Debug: Print features in input_row_df
                # print("Features in input_row_df before prediction (after reordering):", input_row_df.columns.tolist())

                prediction = model.predict(input_row_df)[0]
                input_row_df['scaled_totenergydeli'] = float(prediction)
                input_row_df['totenergydeli'] = float(scaler.inverse_transform(prediction.reshape(-1, 1))[0][0])
                input_row_df['time'] = next_time
                predictions = pd.concat([predictions, input_row_df])
                last_row = input_row_df.iloc[0]
                next_time += pd.Timedelta(hours=2)

            # Prepare history and predictions
            predictions.reset_index(drop=True, inplace=True)
            system_df = system_df[['time', 'totenergydeli']]
            predictions = predictions[['time', 'totenergydeli']]

            # Explicitly convert timestamps to ISO 8601 format
            cs_dict["history"] = {
                "time": system_df['time'].dt.strftime('%Y-%m-%dT%H:%M:%S').tolist(),
                "totenergydeli": system_df['totenergydeli'].to_numpy().tolist()
            }
            cs_dict['predictions'] = {
                "time": predictions['time'].dt.strftime('%Y-%m-%dT%H:%M:%S').tolist(),
                "totenergydeli": predictions['totenergydeli'].to_numpy().tolist()
            }
            processed_dict["data"][int(system_id)] = cs_dict
        except ValueError:
            pass

    processed_dict["processed_time"] = datetime.now().isoformat()

    # Save the processed data into JSON locally
    current_date = datetime.now().strftime("%Y-%m-%d")
    folder_path = "./predictiondata/"
    file_name = f"{folder_path}ml_pred_{current_date}.json"

    def convert_to_serializable(obj):
        if isinstance(obj, np.int64):  # Convert NumPy int64 to Python int
            return int(obj)
        elif isinstance(obj, np.float64):  # Convert NumPy float64 to Python float
            return float(obj)
        elif isinstance(obj, np.ndarray):  # Convert NumPy array to Python list
            return obj.tolist()
        elif isinstance(obj, pd.Timestamp):  # Convert pandas Timestamp to ISO 8601
            return obj.isoformat()
        elif isinstance(obj, np.datetime64):  # Convert NumPy datetime64 to ISO 8601
            return pd.Timestamp(obj).isoformat()
        elif isinstance(obj, pd.Timedelta):  # Convert pandas Timedelta to string
            return str(obj)
        return obj  # Pass through other types unchanged

    #Empty the results folder
    try:
        # List all files in the folder
        for file in os.listdir(folder_path):
            file_path = f"{folder_path}{file}"
            # Check if it's a file before deleting
            if os.path.isfile(file_path):
                os.remove(file_path)
    except Exception as e:
        print(f"Error: {e}")

    # Save the dictionary as a JSON file
    with open(file_name, "w") as file:
        json.dump(processed_dict, file, indent=4, default=convert_to_serializable)

    print(f"ML PREDICTION JSON file saved as {file_name}")