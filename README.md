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
#### Backend
- Navigate to [/Dashboard/server/](./Dashboard/server/).
- Activate the virtual python enironment (**NOTE:** The virtual environment was used for development on a windows machine, the virtual environment may not work as expected on another OS, so you may need to create your own virtual envioronment)
- Run [server.py](./Dashboard/server/server.py). The server will run on port 5000.

#### Frontend
- Navigate to [/Dashboard/client/](./Dashboard/client/).
- Run the frontend using `npm run start`

### Production Build
H
