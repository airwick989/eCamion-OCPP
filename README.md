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
- Navigate to the [/Deployment](./Deployment/) directory.
- Run the docker command `docker compose up --build`. This will build and run the containers, of which there are 2. A container for the frontend (Nginx serves the React app running on port 3000, on port 80), and one for the backend (port 5000).
- The dashboard can be accessed by navigating to the frontend on port 3000 of the localhost on the hosting machine.




## Client-side Documentation

### `App.js`

This is the root component of the eCAMION EV Charging Analytics Dashboard React client. It sets up application-wide theming and routing.

---

#### **Purpose**

Defines the primary structure of the frontend application, establishing routing and theming for the entire interface.

---

#### **Key Components and Functionality**

- **`ThemeProvider` (from MUI)**  
  Wraps the application in a custom Material UI theme defined in `./styles/Theme.js`, ensuring consistent styling across all components.

- **`BrowserRouter` (aliased as `Router`)**  
  Enables client-side routing using React Router.

- **`Routes` & `Route`**  
  Defines the routing structure. Currently, it includes:
  - `/` → renders the `Home` component from `./pages/Home`

---

#### **Dependencies**

- `react-router-dom`: Provides routing utilities like `BrowserRouter`, `Routes`, and `Route`.
- `@mui/material/styles`: Used to apply the custom Material UI theme.
- `./pages/Home`: Main landing page component.
- `./styles/Theme`: Defines the custom MUI theme.
- `./App.css`: Global CSS for base styling.

---

#### **Summary**

This file acts as the root entry point of the application, applying theming and routing. It enables easy scaling by allowing new routes and themes to be added as needed.
