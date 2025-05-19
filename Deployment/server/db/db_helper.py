import os
import psycopg2
from psycopg2 import sql
import pandas as pd

# Load database configuration from environment variables
host = os.getenv("DB_HOST")
database = os.getenv("DB_NAME")
username = os.getenv("DB_USER")
password = os.getenv("DB_PASSWORD")
port = os.getenv("DB_PORT", "5432")  # Default to 5432 if not set


def query_db(db):
    connection = None
    dataframe = None 

    try:
        connection = psycopg2.connect(
            host=host,
            database=database,
            user=username,
            password=password,
            port=port
        )
        dataframe = pd.read_sql_query(f"SELECT * FROM {db};", connection)

    except Exception as error:
        print(f"Error connecting to PostgreSQL: {error}")

    finally:
        if connection:
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