# eCamion-OCPP

## System Model
![System Model](./readme/eCAMION_system_model.png "System Model")
The current system model consists of 4 components:
- The frontend (client-side), based in ReactJS (Node.js).
- The backend (server-side), based in Flask (Python).
- The application container, powered by Docker. The dashboard application, consisting of the frontend and backend components, resides within and is deployed via Docker.
- The external database, based in PostgreSQL. The external database resides outside the dashboard application, and outside the docker container. The database connection is set through environment variables, explained in further sections.




## Steps to Run/Build 
### Development build
**PREREQUISITES:** You must have the node, python pip, and postgresql (with the necessary database and data prepared, along with the necessary connection details in [/Dashboard/server/db_connection.txt](./Dashboard/server/db_connection.txt)) installed on your machine.
#### Backend
- Navigate to [/Dashboard/server/](./Dashboard/server/).
- Activate the virtual python enironment (**NOTE:** The virtual environment was used for development on a windows machine, the virtual environment may not work as expected on another OS, so you may need to create your own virtual envioronment).
- If required, install the necessary dependencies from the [requirements.txt](./Dashboard/server/requirements.txt) file.
- Run [server.py](./Dashboard/server/server.py). The server will run on port 5000.

#### Frontend
- Navigate to [/Dashboard/client/](./Dashboard/client/).
- If required, install the necessary dependencies using `npm install`.
- Run the frontend using `npm run start`

### Production Build
**PREREQUISITES:** You must have docker installed on the host machine prior to running the following commands, as well as the necessary requiremtns installed on the VM. You must also ensure the necessary enviroment variables are set in a **.env** file in the [/Deployment](./Deployment/) directory. The required environment variables are **DB_HOST** (host address of the database, such as localhost of the docker VM i.e. host.docker.internal), **DB_NAME** (name of the postgresql database), **DB_USER** (postgresql username), **DB_PASS** (postgresql password), and **DB_PORT** (the port on which postgresql is exposed).
