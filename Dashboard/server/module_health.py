from db import db_helper
import pandas as pd
import json
import weather_stats as ws


#MODULE HEALTH -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

stringdata = [None, None, None]
uniq_cabinet_ids = []
module_readings = {}

for i in range(1,4):
    #group by system_id
    tmp = db_helper.query_db(f"shadow_string{i}module").groupby('system_id').apply(lambda x: x).reset_index(drop=True)
    #group by repeat number (module identifier)
    tmp.groupby('repeat').apply(lambda x: x).reset_index(drop=True)
    #cast column values in case
    tmp['timestamp'] = pd.to_datetime(tmp['timestamp'])
    #order rows chronologically based on timestamp
    tmp = tmp.sort_values(by='timestamp')

    stringdata[i-1] = tmp
    uniq_cabinet_ids = list(set(uniq_cabinet_ids) | set([cabinet_id for cabinet_id in sorted(tmp['system_id'].unique().tolist())]))
uniq_cabinet_ids = list(map(str, uniq_cabinet_ids))


readings = ['min_cell_voltage', 'max_cell_voltage', 'avg_cell_voltage', 'total_voltage', 'min_temp', 'max_temp', 'avg_temp']
columns = ['timestamp', 'system_id', 'repeat'] + readings


def get_module_stats():
    for cabinet in uniq_cabinet_ids:
        module_readings[cabinet] = {}
        curr_string = 1

        for string in stringdata:
            string = string.query(f'system_id == {cabinet}')
            modulelist = sorted(string['repeat'].unique().tolist())
            
            module_readings[cabinet][f"string{curr_string}"] = {}
            
            for module in modulelist:
                moduledata = string.query(f'repeat == {module}')[columns]
                moduledata = db_helper.populate_and_filter(moduledata, columns)
                
                module_readings[cabinet][f"string{curr_string}"][module] = {}
                
                for reading in readings:
                    module_readings[cabinet][f"string{curr_string}"][module][reading] = {
                        'lowest': moduledata[reading].min(),
                        'highest': moduledata[reading].max(),
                        'mean': moduledata[reading].mean()
                    }

            curr_string += 1

    # with open("test_moduledata.json", "w") as outfile: 
    #     json.dump(module_readings, outfile, indent=4)
    return module_readings


def get_module_history(cabinet, string, module):
    string = stringdata[string - 1].query(f'system_id == {cabinet}')
    modulehistory = string.query(f'repeat == {module}')[columns]
    modulehistory = db_helper.populate_and_filter(modulehistory, columns)
    
    return modulehistory
