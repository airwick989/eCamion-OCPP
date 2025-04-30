import psycopg2
from psycopg2 import sql
import pandas as pd

host = None
database = None
username = None
password = None
port = None
with open('db_connection.txt', 'r') as file:
    lines = file.readlines()
    host = lines[0].strip()
    database = lines[1].strip()
    username = lines[2].strip()
    password = lines[3].strip()
    port = lines[4].strip()




def query_db(db):
    # Connection details
    connection = None

    try:
        # Establish a connection to the PostgreSQL database
        connection = psycopg2.connect(
            host=host, 
            database=database, 
            user=username, 
            password=password,  
            port=port  
        )
        
        # # Create a cursor object
        # cursor = connection.cursor()
        # print(f"Connected to PostgreSQL\n")
        
        # # Execute an SQL query
        # cursor.execute(f"SELECT * FROM {db};")
        
        # # Fetch and print the result of the query
        # result = cursor.fetchone()
        # print(f"Query result:\n {result} \n")

        dataframe = pd.read_sql_query(f"SELECT * FROM {db};", connection)
        
    except Exception as error:
        print(f"Error connecting to PostgreSQL: {error}")
        
    finally:
        # Close the connection
        if connection:
            #cursor.close()
            connection.close()

    return dataframe




def populate_and_filter(df, columns):

    # Group by 'system_id' and apply forward fill and backward fill on each group
    df = (
        df.groupby('system_id', group_keys=False)
          .apply(lambda group: group[columns].ffill().bfill())
    )

    if 'source' in df.columns:
        df = df.query('source != "s3"')

    return df[columns]