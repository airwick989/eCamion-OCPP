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

#### **Purpose**

Defines the primary structure of the frontend application, establishing routing and theming for the entire interface.

#### **Key Components and Functionality**

- **`ThemeProvider` (from MUI)**  
  Wraps the application in a custom Material UI theme defined in `./styles/Theme.js`, ensuring consistent styling across all components.

- **`BrowserRouter` (aliased as `Router`)**  
  Enables client-side routing using React Router.

- **`Routes` & `Route`**  
  Defines the routing structure. Currently, it includes:
  - `/` → renders the `Home` component from `./pages/Home`

#### **Dependencies**

- `react-router-dom`: Provides routing utilities like `BrowserRouter`, `Routes`, and `Route`.
- `@mui/material/styles`: Used to apply the custom Material UI theme.
- `./pages/Home`: Main landing page component.
- `./styles/Theme`: Defines the custom MUI theme.
- `./App.css`: Global CSS for base styling.

#### **Summary**

This file acts as the root entry point of the application, applying theming and routing. It enables easy scaling by allowing new routes and themes to be added as needed.

---

### `Home.js`

The `Home` component is the main landing page of the eCAMION EV Charging Analytics Dashboard. It acts as the container for the single-page application and renders tabbed views for interacting with the data.

#### **Purpose**

To provide users with a centralized dashboard view that loads and displays data from charging stations, cabinets, modules, etc.

#### **Key Components and Functionality**

- **State Variables**
  - `sites`: Stores all available cabinet/site data fetched from the API.

- **`useEffect()` Hook**
  - On initial render, performs a GET request to `/getstations` using a custom Axios instance.
  - Stores the response in the `sites` state variable.

- **Conditional Rendering**
  - Displays a loading message until `sites` data is available.

- **`BasicTabs` Component**
  - Renders a tabbed interface to display cabinet data.
  - Receives `cabinets={sites}` as props.

#### **Dependencies**

- `React` & Hooks (`useState`, `useEffect`)
- `axios` from `../services/api`: Handles HTTP requests to the backend.
- `BasicTabs` from `../components/TabPanel`: Renders the main data visualization in tabbed format.

#### **Summary**

The `Home.js` component functions as the main entry point for users to view EV charging cabinet analytics. It pulls data on available sites/cabinets, passes this data to a tabbed panel, and contains the entirety of the application.

---

### `TabPanel.js`

This component (`BasicTabs`) renders a tabbed interface for displaying various EV charging cabinet analytics, including health metrics and predictions.

#### **Purpose**

Provides a user-friendly tab-based layout for switching between different analytical views (Cabinet Health, J Health, Module Health, Prediction) related to EV charging cabinets.

#### **Key Components and Functionality**

- **`BasicTabs` (Default Export)**
  - Main component that renders the tab navigation and tab panels.
  - Maintains the active tab index using `useState`.
  - Uses Material UI's `Tabs` and `Tab` components for navigation.
  - Passes the `cabinets` prop to all subcomponents.

- **`CustomTabPanel`**
  - A helper component to conditionally render tab content.
  - Keeps all tab components mounted to retain internal state but only displays the currently selected tab.
  - Accessible with `role="tabpanel"` and proper `aria` attributes.

- **`a11yProps(index)`**
  - Helper function to add accessibility attributes to each tab for screen readers.

#### **Tabs and Content**

1. **Cabinet Health**  
   - Component: `CabinetHealth`  
   - Props: `cabinets`  
   - Purpose: Display metrics and status for entire cabinets.

2. **J Health**  
   - Component: `Jhealth`  
   - Props: `cabinets`  
   - Purpose: Display metrics and status of individual chargers or "J"s.

3. **Module Health**  
   - Component: `ModuleHealth`  
   - Props: `cabinets`  
   - Purpose: Displays analytics related to modules within each cabinet.

4. **Prediction**  
   - Component: `Prediction`  
   - Props: `cabinets`  
   - Purpose: Shows predictive analytics based on historical data and ML models.

#### **Dependencies**

- **Material UI**:
  - `@mui/material/Tabs`, `Tab`, `Box`: Used for UI layout and tab styling.
- **React**
- **PropTypes**: Used to enforce prop types for `CustomTabPanel`.

- **Child Components**:
  - `CabinetHealth`, `Jhealth`, `ModuleHealth`, `Prediction`: Render individual content per tab.

#### **Summary**

The `TabPanel.js` file provides the main tabbed interface for the dashboard, enhancing UX by segmenting analytics into four logical views. It acts as a hub for rendering all key cabinet, charger, and module-related analytics.

---

### `CabinetHealth.js`

The `CabinetHealth` component displays real-time and historical environmental metrics for a selected EV charging cabinet, including temperature, humidity, dew point, and system voltage.

#### **Purpose**

To provide detailed environmental data visualizations for individual cabinets, enabling users to monitor cabinet conditions and track changes over time.

#### **Key Components and Functionality**

- **State Variables**
  - `cabinetTemperature`, `outdoorTemperature`: Latest temperatures inside and outside the cabinet.
  - `cabinetHumidity`, `outdoorHumidity`: Latest humidity levels.
  - `cabinetDewPoint`, `outdoorDewPoint`: Calculated dew points.
  - `selectedCabinet`: Tracks the user-selected cabinet (persisted in cookies).
  - `chartHistory`: Time-series data for temperature, humidity, and dew point.
  - `voltageHistory`: Time-series data for cabinet voltage.
  - `upUntil`: Timestamp of the most recent data point available.
  - `error`, `loading`: Flags for UI state management.

- **`useEffect()` Hook**
  - Listens for `cabinetChange` custom events to sync selected cabinet state across components.
  - Fetches cabinet health and historical data on `selectedCabinet` change.
  - Sets loading and error state as needed.

- **Cabinet Selection**
  - Rendered using `Select` and `MenuItem` components from Material UI.
  - Cabinet selection updates cookie and dispatches a custom `cabinetChange` event for cross-component synchronization.

- **Chart Rendering**
  - Four `HistoryChart` components show trends for:
    - Temperature
    - Humidity
    - Dew Point
    - Voltage

- **SummarySection Components**
  - Three summary cards display current cabinet and outdoor values for:
    - Temperature
    - Humidity
    - Dew Point

#### **Dependencies**

- `React` & Hooks (`useState`, `useEffect`)
- `axios` from `../services/api`: For HTTP data retrieval.
- `js-cookie`: For persisting the selected cabinet.
- `@mui/material`
  - `Select`, `MenuItem`, `InputLabel`, `CircularProgress`: Used for UI elements and feedback.
- **Custom Components**
  - `SummarySection`: Displays quick metrics.
  - `HistoryChart`: Line charts for time-series data.
  - `CustomFormControl`: Styled form control wrapper.

#### **Summary**

`CabinetHealth.js` enables users to view real-time environmental metrics and historical trends for a selected cabinet. It handles cabinet selection, displays summary metrics, and generates multiple line charts to visualize changes in environmental and voltage conditions over time.

---

### `Jhealth.js`

The `Jhealth` component displays health summaries of individual EV charging stations or "J"s over the past 30 days. It dynamically fetches and presents usage data based on the selected cabinet and provides an expandable card interface for reviewing each "J"’s statistics.

#### **Purpose**

To provide a visual and interactive summary of charger-level health metrics such as session count, total session time, and time-series charts for each "J" in a cabinet.

#### **Key Components and Functionality**

- **State Variables**
  - `selectedCabinet`: Tracks the currently selected cabinet ID.
  - `error`: Stores any error encountered during data fetching.
  - `summaryData`: Contains charger summary data including session stats and charts.
  - `upUntil`: Timestamp up to which the data is valid.
  - `loading`: Indicates whether data is being fetched.

- **`useEffect()` for Cabinet Change Events**
  - Subscribes to the global `cabinetChange` event to update `selectedCabinet` across the app.

- **`useEffect()` for Data Fetching**
  - On change to `selectedCabinet`, sends a GET request to `/jsummaries` to fetch J station summary data.
  - Updates summary and timestamp states.

- **Cabinet Selector**
  - Dropdown menu for selecting a cabinet from the provided `cabinets` prop.
  - Saves selection to a cookie and dispatches a custom event to synchronize across components.

- **`ExpandingCard` Component**
  - Renders a card for each J station with:
    - Charger ID
    - Total sessions
    - Total session time
    - Summary chart showing daily session counts

#### **Dependencies**

- `React` & Hooks (`useState`, `useEffect`)
- `axios` from `../services/api`: Handles HTTP requests to fetch charger summary data.
- `js-cookie`: Persists selected cabinet ID across reloads.
- `@mui/material`:
  - `Select`, `MenuItem`, `InputLabel`, `CircularProgress`, `Grid`, `Container`, `Typography`: Used for form controls, layout, and feedback.
- `CustomFormControl`: Wraps form inputs with consistent styling.
- `ExpandingCard`: Custom component for expandable visual summaries.
- `SummarySection` and `HistoryChart`: Present if data needs summarization or visualization (though not directly rendered in this file).

#### **Summary**

The `Jhealth.js` component delivers a cabinet-specific overview of J station activity within a user-friendly card interface. It supports persistent cabinet selection, real-time updates through custom events, and clear presentation of charger usage metrics for analytical insights.

---

### `ModuleHealth.js`

The `ModuleHealth` component presents detailed module-level health data for EV battery strings, including voltage and temperature statistics. It supports dynamic cabinet selection, string toggling, and visual + tabular data rendering.

#### **Purpose**

To visualize and inspect health parameters of modules (grouped by strings) in EV charger cabinets. It supports multiple strings per cabinet and provides clear bar chart and table-based insights.

#### **Main Features**

- **Cabinet Selection**
  - Dropdown for selecting a cabinet (`Select` with MUI).
  - Persisted in a cookie using `js-cookie`.
  - Custom event dispatch (`cabinetChange`) to sync with other components.

- **String Selection**
  - `Tabs` from MUI allow switching between string 1, 2, or 3.
  - Tabs are disabled if corresponding string data is unavailable.

- **Chart Visualization**
  - `SegmentedBarChart` is used to render:
    - Min/Average/Max Cell Voltages
    - Total Voltage
    - Min/Average/Max Temperatures

- **Tabular Data Display**
  - `DataTable` presents a breakdown of module metrics.
  - Supports configurable column order and is ready for future thresholding.

#### **State Variables**

| Variable         | Description                                                                 |
|------------------|-----------------------------------------------------------------------------|
| `selectedCabinet`| Currently selected cabinet ID (stored in cookies)                           |
| `error`          | Tracks data fetching errors                                                 |
| `upUntil`        | Date string indicating the freshness of the data                            |
| `loading`        | Indicates if data is being fetched                                          |
| `moduleData`     | Raw module data for strings 1–3                                             |
| `currString`     | Index of the currently selected string tab (0-based)                        |

#### **Data Processing**

- **`formatDataForTable(moduleData)`**  
  Converts raw object-based readings into row-wise data arrays for charting and table rendering.

- **`tabledata`**  
  Contains an array of arrays. Each index corresponds to a string (e.g., `tabledata[0]` for string1).

- **`headers` and `columnOrder`**  
  Used to control column rendering order in `DataTable`.

#### **Dependencies**

- **React Hooks**: `useState`, `useEffect`
- **Axios**: API calls to `/moduledata`
- **Material UI Components**:
  - Layout: `Box`, `Tabs`, `Tab`
  - Form: `Select`, `MenuItem`, `InputLabel`
  - Feedback: `CircularProgress`
- **Custom Components**:
  - `CustomFormControl`: Styled form wrapper
  - `SegmentedBarChart`: Custom multi-series bar chart
  - `DataTable`: Custom table renderer

#### **APIs Used**

- `GET /moduledata?cabinetid={id}`  
  Returns `moduledata` (per-string) and `upuntil` timestamp.

#### **UI Flow Summary**

1. User selects a cabinet.
2. Data is fetched and grouped by battery strings.
3. Tabs allow switching between strings (if available).
4. Each string view shows:
   - Bar charts for voltage and temperature metrics
   - A detailed table with per-module values

---

### `Prediction.js`

#### Description
The `Prediction` component displays machine learning-based energy delivery forecasts for a selected cabinet. It provides a historical and predicted energy delivery chart, forecast metrics (RMSE, R², MAE), and allows users to switch between cabinets using a dropdown.

#### Props
- `cabinets` (Object): A mapping of cabinet IDs to cabinet metadata (e.g., sitename).

#### State Variables
- `selectedCabinet` (number): The currently selected cabinet ID, persisted in cookies.
- `error` (string|null): Stores any error messages encountered during data fetch.
- `chartHistory` (object|null): Contains timestamps, historical data, predicted data, and forecast metrics (RMSE, R², MAE).
- `upUntil` (string|null): The timestamp up to which the data is available.
- `processedTime` (string|null): The timestamp when the predictions were last processed.
- `loading` (boolean): Indicates whether data is currently being fetched.

#### Effects
- Cabinet Change Listener: Subscribes to a global `cabinetChange` event to update `selectedCabinet`.
- Fetch Prediction Data: On cabinet selection, fetches historical and predicted energy data using `axios` and stores it in state.

#### Functions
- `roundToNearestThousandth(number)`: Rounds a given number to three decimal places.
- `handleCabinetChange(event)`: Updates the selected cabinet, persists it in cookies, and dispatches a `cabinetChange` event.

#### API Call
- Endpoint: `/prediction?cabinetid={selectedCabinet}`

#### Components Used
- `CustomFormControl`: Styled form control wrapper.
- `SummarySection`: Displays forecast metrics.
- `HistoryChart`: Line chart visualizing historical vs predicted energy delivery.
- `Material UI components`: Select, MenuItem, InputLabel, CircularProgress.

#### UI Behavior
- Dropdown to select cabinet from list.
- Shows forecast metrics (RMSE, R², MAE) after data loads.
- Displays combined chart of historical and predicted energy delivery.
- Shows last updated timestamp (`upUntil`) and last processed time for ML predictions (`processedTime`).
- Loading spinner while fetching data.
- Error message displayed if fetching fails.

---

### `SummarySection.js`

#### Description
`SummarySection` is a simple presentational React component that displays a titled section with a list of labeled data values, optionally showing a loading message if no data is available.

#### Props
- `title` (string): The heading text for the section.
- `data` (Array): An array of objects, each with:
  - `label` (string): The label or name of the metric.
  - `value` (any): The corresponding value for the label.
- `loadingMessage` (string): Message to display when `data` is empty or undefined.
- `unit` (string): Optional unit string to display after each value.

#### Usage
Displays each label-value pair with spacing. If no data, shows `loadingMessage`.

#### Example JSX
```jsx
<SummarySection
  title="3 Days forecast"
  data={[
    { label: "RMSE", value: 0.123 },
    { label: "R2", value: 0.95 },
    { label: "MAE", value: 0.1 },
  ]}
  unit="kWh"
/>
```

---

### `HistoryChart.js`

#### Overview
`HistoryChart` is a React component that renders an interactive line chart for time series data. It supports multiple data series, selectable predefined and custom time ranges, user-defined Y-axis range limits, and displays summary statistics (average, min, max) for the visible data.

#### Core Functionality

- **Time Range Filtering:** Users can select from predefined ranges (`30d`, `7d`, `24h`) or specify a custom date range to filter the displayed data.
- **Data Downsampling:** Limits the number of data points rendered (max 100) to improve performance and clarity.
- **Multiple Data Series:** Supports multiple Y data series, each represented by a separate colored line with a legend.
- **Y-Axis Range Control:** Allows users to set minimum and maximum Y-axis values via a modal dialog, with input validation.
- **Summary Statistics:** Calculates and shows average, minimum, and maximum values for each displayed data series.
- **Responsive UI:** Built with `recharts` for charts and Material-UI for UI controls, ensuring accessibility and responsiveness.

#### Key Functions

- `filterDataByRange(xData, yDataSeries, range)`: Filters data according to the selected time range or custom dates.
- `downsample(data, maxPoints)`: Reduces the number of points by sampling to a max number.
- `calculateStats(yDataSeries)`: Computes average, min, and max for each data series.
- `formatTimestamp(timestamp)`: Formats timestamps for display on the X-axis and tooltips.
- Event handlers for managing time range selection, Y-axis dialog controls, and validation.

#### Dependencies

- React
- Recharts (`LineChart`, `Line`, `XAxis`, `YAxis`, `Tooltip`, `Legend`, `CartesianGrid`, `ResponsiveContainer`)
- Material-UI components (`Button`, `Menu`, `MenuItem`, `List`, `ListItemButton`, `ListItemText`, `TextField`, `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions`, `Alert`)
- JavaScript Date utilities

#### Props

| Prop Name    | Type          | Description                                      |
|--------------|---------------|------------------------------------------------|
| `title`      | string        | Title displayed above the chart                 |
| `unit`       | string        | Unit appended to numeric values and stats      |
| `xData`      | array         | Array of timestamps (e.g., ISO strings)        |
| `yDataSeries`| array of objs | Each object contains `{ data: array, name: string, color?: string }` aligned with `xData` |

#### Usage Example

```jsx
import React from "react";
import HistoryChart from "./HistoryChart";

const sampleXData = [
  "2025-05-01T00:00:00Z",
  "2025-05-02T00:00:00Z",
  "2025-05-03T00:00:00Z",
  // ... more timestamps
];

const sampleYDataSeries = [
  {
    name: "Temperature",
    color: "#FF0000",
    data: [22.5, 21.7, 23.0 /* ... corresponding values */],
  },
  {
    name: "Humidity",
    color: "#0000FF",
    data: [55, 60, 58 /* ... corresponding values */],
  },
];

function App() {
  return (
    <div>
      <HistoryChart
        title="Environmental Sensor Data"
        unit="°C / %"
        xData={sampleXData}
        yDataSeries={sampleYDataSeries}
      />
    </div>
  );
}

export default App;
```

---

### `ExpandingCard.js`

#### Overview
`ExpandingCard` is a React component that displays a summary card of charger session statistics with an expandable modal overlay. It provides a concise visual summary and, when expanded, reveals detailed charts and data tables for in-depth analysis. It supports time range filtering including custom date ranges and is designed with Material UI for responsiveness and accessibility.

#### Core Functionality

- **Summary Card Display:** Shows charger ID, number of sessions, cumulative session time (formatted), and a selectable time range menu.
- **Expandable Modal View:** Clicking the card expands it into a modal containing detailed charts and session statistics.
- **Time Range Filtering:** Supports `30d`, `7d`, `24h`, and `custom` date ranges with date pickers for precise control.
- **Bar Chart Visualizations:** Renders two charts summarizing:
  - Total number of sessions per day
  - Total duration of sessions per day
- **Session Statistics Table:** Displays detailed statistics with sortable columns and threshold indicators for power, duration, etc.
- **Temperature History Chart:** Optional multi-series line chart to display charger temperature over time.
- **Interactive UI Elements:** Users can explore trends and performance variations via intuitive components built with Material-UI and Recharts.

#### Props

| Prop Name          | Type     | Description                                               |
|--------------------|----------|-----------------------------------------------------------|
| `cabid`            | string   | Cabinet ID used to query session data                    |
| `jid`              | string   | Charger ID used to query session data                    |
| `sessions`         | number   | Number of recorded sessions (summary info)               |
| `totalsessiontime` | number   | Cumulative session time in seconds                       |
| `upuntil`          | string   | Datetime indicating the latest data point included       |
| `summarychart`     | object   | Contains bar chart data for sessions and durations       |

#### Dependencies

- **External Libraries:**
  - `React`
  - `Material-UI` (components like `Card`, `Button`, `Dialog`, `Menu`, `MenuItem`, `TextField`, `Typography`, `IconButton`, `Alert`, etc.)
  - `Recharts` (for `BarChart`, `Bar`, `XAxis`, `YAxis`, `Tooltip`, `ResponsiveContainer`)
  - `date-fns` or similar (for date parsing, formatting, range comparison)

- **Internal Components:**
  - `HistoryChart.js`: Used for rendering temperature and session history as a multi-series time chart
  - `SessionTable.js`: Table component that displays individual session statistics with threshold coloring
  - `YAxisControlDialog.js`: Optional component for user-defined Y-axis range limits (if used)

- **Utilities and Helpers:**
  - Custom date formatting and filtering logic
  - API call to `/jdata?cabinetid={cabid}&chargerid={jid}` for fetching session history

#### Example Usage

```jsx
import React from 'react';
import ExpandingCard from './ExpandingCard';

const App = () => {
  const cabinetId = "CAB123";
  const chargerId = "CHG456";
  const sessionsCount = 120;
  const totalSessionTimeSeconds = 36000; // 10 hours
  const upUntilDate = "2025-05-21";
  const summaryChartData = {
    totsessions: [
      { date: '2025-04-20', value: 5 },
      { date: '2025-04-21', value: 7 },
    ],
    totsessionsdur: [
      { date: '2025-04-20', value: 1000 },
      { date: '2025-04-21', value: 1400 },
    ]
  };

  return (
    <ExpandingCard
      cabid={cabinetId}
      jid={chargerId}
      sessions={sessionsCount}
      totalsessiontime={totalSessionTimeSeconds}
      upuntil={upUntilDate}
      summarychart={summaryChartData}
    />
  );
};

export default App;
```

---

### `BarChart.js`

#### Overview
`BarChartComponent` is a reusable React component for rendering simple, time-based bar charts using Recharts. It supports filtering of chart data by predefined time ranges (`30d`, `7d`, `24h`) or a custom date range. The component is used to display summarized session statistics, such as session counts or durations, in a visually accessible way.

#### Core Functionality

- **Time Range Filtering:** Filters input data to only include dates within the selected time window (`30d`, `7d`, `24h`, or a custom range defined by two dates).
- **Data Transformation:** Converts the filtered chart data object into an array of `{ date, ydata }` suitable for Recharts rendering.
- **Responsive Chart Rendering:** Utilizes `ResponsiveContainer` from Recharts to adapt to varying screen sizes.
- **Dynamic Titles and Labels:** Accepts customizable chart titles and Y-axis labels for contextual clarity.
- **Optional Bar Color:** Supports theming via a configurable bar color prop.

#### Props

| Prop Name        | Type     | Description                                                                 |
|------------------|----------|-----------------------------------------------------------------------------|
| `chartdata`      | object   | Dictionary of date strings to data values (expected format: `{ date: { key: value } }`) |
| `ydata`          | string   | Key used to extract the Y-value for each bar                                |
| `ydatalabel`     | string   | Label for the Y-axis data shown in the tooltip                              |
| `title`          | string   | Optional title shown above the chart                                        |
| `isCustomRange`  | boolean  | Indicates whether to use a custom date range                                |
| `timeRange`      | string   | Selected time range (`"30d"`, `"7d"`, `"24h"`)                              |
| `customStartDate`| string   | Start date of the custom date range (ISO string)                            |
| `customEndDate`  | string   | End date of the custom date range (ISO string)                              |
| `barcolour`      | string   | Optional bar color (default is `#82ca9d`)                                   |

#### Dependencies

- **External Libraries:**
  - `React`
  - `Recharts` (`BarChart`, `Bar`, `XAxis`, `YAxis`, `Tooltip`, `ResponsiveContainer`)

- **Used In:**
  - `ExpandingCard.js` (for rendering summary statistics such as sessions per day and duration per day)

#### Example Usage

```jsx
import React from 'react';
import BarChartComponent from './BarChartComponent';

const mockChartData = {
  "2025-05-01": { sessions: 5 },
  "2025-05-02": { sessions: 8 },
  "2025-05-03": { sessions: 3 },
};

function App() {
  return (
    <BarChartComponent
      chartdata={mockChartData}
      ydata="sessions"
      ydatalabel="Charging Sessions"
      title="Sessions Per Day"
      isCustomRange={false}
      timeRange="7d"
    />
  );
}

export default App;
```

---

### `DataTable.js`

#### Overview
`DataTable` is a highly interactive React component that renders a Material UI-based table with dynamic thresholding capabilities. It allows users to visually inspect tabular data and highlight anomalies by setting upper and lower thresholds per column. Threshold values can be modified or cleared via modals triggered from column headers.

#### Core Functionality

- **Threshold Highlighting:** Table cells change color based on whether the values are outside configured thresholds (`low` = blue, `high` = red).
- **Interactive Column Menu:** Clicking on threshold-enabled headers reveals a dropdown menu with options to set or clear thresholds.
- **Modal Dialogs:** 
  - One modal allows users to input new upper/lower bounds.
  - Another confirms threshold removal.
- **API Integration:** Applies changes by invoking a backend endpoint (`/setTableThresholds`) to persist threshold configurations.
- **Column Reordering:** Columns can be reordered via the `columnOrder` prop.

#### Props

| Prop Name        | Type                      | Description                                                                 |
|------------------|---------------------------|-----------------------------------------------------------------------------|
| `cabid`          | string                    | Cabinet identifier (used in threshold API calls)                           |
| `jid`            | string                    | Charger/job identifier (used in threshold API calls)                       |
| `headers`        | array of strings          | Names of all table columns                                                 |
| `data`           | array of objects          | Table data; each object represents a row                                   |
| `columnOrder`    | array of strings (optional)| If provided, reorders the headers accordingly                              |
| `thresholds`     | object                    | Dictionary mapping headers to their `{ low, high }` values                 |
| `setThresholds`  | function                  | Callback to update threshold state after API call                          |

#### Behavior

- **Threshold Coloring Rules:**
  - If a value is below `low`, the cell is **blue with white text**.
  - If a value is above `high`, the cell is **red with white text**.
  - Otherwise, default styling is applied.

- **Threshold Menu Activation:**
  - Headers with entries in `thresholds` are clickable and display a dropdown (`<ArrowDropDownIcon>`).
  - Others remain static.

- **Modal States:**
  - `openThresholds`: Show modal for setting upper/lower bounds.
  - `openClear`: Show modal for confirming threshold deletion.

- **Ref Usage:**
  - `lowerBoundRef` and `upperBoundRef` are used to collect modal input values for API submission.

#### Dependencies

- **External Libraries:**
  - `React`
  - `PropTypes`
  - `@mui/material` (Table, Modal, Typography, IconButton, etc.)
  - `@mui/icons-material` (`CloseIcon`, `ArrowDropDownIcon`)
  - `axios` (via a custom import from `../services/api`)

- **Used In:**
  - Typically embedded within a dashboard or metric view component where data flagging and anomaly review are important.

#### Example Usage

```jsx
import DataTable from './DataTable';

const sampleHeaders = ["Voltage", "Current", "Temperature"];
const sampleData = [
  { Voltage: 220, Current: 10, Temperature: 35 },
  { Voltage: 210, Current: 15, Temperature: 45 },
];
const sampleThresholds = {
  Voltage: { low: 215, high: 225 },
  Temperature: { low: 30, high: 40 },
};

function ParentComponent() {
  const [thresholds, setThresholds] = useState(sampleThresholds);

  return (
    <DataTable
      cabid="cab001"
      jid="chargerX"
      headers={sampleHeaders}
      data={sampleData}
      columnOrder={["Temperature", "Current", "Voltage"]}
      thresholds={thresholds}
      setThresholds={setThresholds}
    />
  );
}
```

---

### `SegmentedBarChart.js`

#### Overview  
`SegmentedBarChart` is a reusable React component that renders a customizable stacked bar chart using Recharts. It visualizes multiple metric keys (`valueKeys`) for each categorical label and includes an interactive modal dialog for setting a custom Y-axis range. Designed with Material UI for layout consistency and user interaction, it provides clear visual comparisons across modules or categories.

#### Core Functionality

- **Stacked Bar Chart Visualization:** Renders bars for multiple metric keys (`valueKeys`) per category (default: `Module`) using `BarChart` and `Bar` from Recharts.
- **YAxis Range Controls:** Users can manually define or reset Y-axis bounds using a modal dialog with validation and error messaging.
- **Dynamic Color Assignment:** Accepts custom color arrays; defaults are used if omitted.
- **Data Cleaning & Parsing:** Each metric value is coerced to a float (or zero fallback); labels are stringified or set to `"N/A"` for safety.
- **Legend & Tooltip Support:** Full interactivity for inspecting bar values and identifying key associations.
- **Sorting by Aggregate Value:** Bars are ordered such that metrics with the smallest total value appear first, improving comparative visibility.

#### Props

| Prop Name    | Type             | Description                                                                 |
|--------------|------------------|-----------------------------------------------------------------------------|
| `data`       | array of objects | Required. Dataset to visualize, one object per category.                   |
| `valueKeys`  | array of strings | Required. Keys representing metrics to render as stacked bars.             |
| `colors`     | array of strings | Optional. Color overrides for each `valueKey`. Defaults provided internally. |
| `label`      | string           | Optional. Field used for X-axis categories. Default is `"Module"`.          |
| `title`      | string           | Optional. Title displayed above the chart.                                 |

#### Dependencies

- **External Libraries:**
  - `React`
  - `Material-UI` (for `Dialog`, `TextField`, `Button`, layout and interaction controls)
  - `Recharts` (for charting via `BarChart`, `Bar`, `XAxis`, `YAxis`, `Tooltip`, `Legend`, `ResponsiveContainer`, `Rectangle`)

- **Component Utilities:**
  - `getCustomBarShape(offset)`: Returns a custom `Rectangle` bar renderer with an optional X-offset.
  - Default color array: Internal fallback colors are used when no `colors` prop is supplied.

#### Example Usage

```jsx
import React from 'react';
import SegmentedBarChart from './SegmentedBarChart';

const data = [
  { Module: 'Auth', errors: 5, warnings: 3 },
  { Module: 'Payment', errors: 8, warnings: 2 },
  { Module: 'Search', errors: 1, warnings: 6 },
];

const metricKeys = ['errors', 'warnings'];
const colorPalette = ['#FF5733', '#33B5FF'];

const App = () => (
  <SegmentedBarChart
    data={data}
    valueKeys={metricKeys}
    colors={colorPalette}
    title="Issue Metrics by Module"
  />
);

export default App;
```
