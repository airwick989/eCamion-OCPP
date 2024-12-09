import React, { useState, useEffect } from "react";
import axios from "../services/api";
import SummarySection from "./SummarySection";
import { Select, MenuItem, InputLabel, CircularProgress } from "@mui/material";
import CustomFormControl from "./CustomFormControl";
import HistoryChart from "./HistoryChart";

function roundToNearestTenth(number) {
  return Math.round(number * 10) / 10;
}

function CabinetHealth({ cabinets }) {
  const [cabinetTemperature, setCabinetTemperature] = useState(null);
  const [outdoorTemperature, setOutdoorTemperature] = useState(null);
  const [cabinetHumidity, setCabinetHumidity] = useState(null);
  const [outdoorHumidity, setOutdoorHumidity] = useState(null);
  const [cabinetDewPoint, setCabinetDewPoint] = useState(null);
  const [outdoorDewPoint, setOutdoorDewPoint] = useState(null);
  const [selectedCabinet, setSelectedCabinet] = useState(
    Math.min(...Object.keys(cabinets).map(Number))
  );
  const [error, setError] = useState(null);
  const [chartHistory, setChartHistory] = useState(null);
  const [cabinetAvgTemp, setCabinetAvgTemp] = useState(null);
  const [outdoorAvgTemp, setOutdoorAvgTemp] = useState(null);
  const [cabinetMinTemp, setCabinetMinTemp] = useState(null);
  const [outdoorMinTemp, setOutdoorMinTemp] = useState(null);
  const [cabinetMaxTemp, setCabinetMaxTemp] = useState(null);
  const [outdoorMaxTemp, setOutdoorMaxTemp] = useState(null);
  const [cabinetAvgHumidity, setCabinetAvgHumidity] = useState(null);
  const [outdoorAvgHumidity, setOutdoorAvgHumidity] = useState(null);
  const [cabinetMinHumidity, setCabinetMinHumidity] = useState(null);
  const [outdoorMinHumidity, setOutdoorMinHumidity] = useState(null);
  const [cabinetMaxHumidity, setCabinetMaxHumidity] = useState(null);
  const [outdoorMaxHumidity, setOutdoorMaxHumidity] = useState(null);
  const [cabinetAvgDewPoint, setCabinetAvgDewPoint] = useState(null);
  const [outdoorAvgDewPoint, setOutdoorAvgDewPoint] = useState(null);
  const [cabinetMinDewPoint, setCabinetMinDewPoint] = useState(null);
  const [outdoorMinDewPoint, setOutdoorMinDewPoint] = useState(null);
  const [cabinetMaxDewPoint, setCabinetMaxDewPoint] = useState(null);
  const [outdoorMaxDewPoint, setOutdoorMaxDewPoint] = useState(null);

  const [loading, setLoading] = useState(false);  // New loading state

  useEffect(() => {
    setLoading(true); // Start loading when selectedCabinet changes
    setError(null);
    axios
      .get(`/cabinethealth?cabinetid=${selectedCabinet}`)
      .then((response) => {
        const { cabinet_health, chartdata } = response.data;
        setCabinetTemperature(roundToNearestTenth(cabinet_health.temp.sys.latest));
        setOutdoorTemperature(roundToNearestTenth(cabinet_health.temp.ext.latest));
        setCabinetHumidity(roundToNearestTenth(cabinet_health.humidity.sys.latest));
        setOutdoorHumidity(roundToNearestTenth(cabinet_health.humidity.ext.latest));
        setCabinetDewPoint(roundToNearestTenth(cabinet_health.dew_point.sys.latest));
        setOutdoorDewPoint(roundToNearestTenth(cabinet_health.dew_point.ext.latest));
        setChartHistory({
          timestamp: chartdata.timestamp,
          sys_temp: chartdata.sys_temp,
          ext_temp: chartdata.temperature_2m,
          sys_humidity: chartdata.sys_humidity,
          ext_humidity: chartdata.relative_humidity_2m,
          sys_dew_point: chartdata.sys_dew_point,
          ext_dew_point: chartdata.dew_point_2m,
        });
        setCabinetAvgTemp(roundToNearestTenth(cabinet_health.temp.sys.avg))
        setOutdoorAvgTemp(roundToNearestTenth(cabinet_health.temp.ext.avg))
        setCabinetMinTemp(roundToNearestTenth(cabinet_health.temp.sys.min))
        setOutdoorMinTemp(roundToNearestTenth(cabinet_health.temp.ext.min))
        setCabinetMaxTemp(roundToNearestTenth(cabinet_health.temp.sys.max))
        setOutdoorMaxTemp(roundToNearestTenth(cabinet_health.temp.ext.max))
        setCabinetAvgHumidity(roundToNearestTenth(cabinet_health.humidity.sys.avg))
        setOutdoorAvgHumidity(roundToNearestTenth(cabinet_health.humidity.ext.avg))
        setCabinetMinHumidity(roundToNearestTenth(cabinet_health.humidity.sys.min))
        setOutdoorMinHumidity(roundToNearestTenth(cabinet_health.humidity.ext.min))
        setCabinetMaxHumidity(roundToNearestTenth(cabinet_health.humidity.sys.max))
        setOutdoorMaxHumidity(roundToNearestTenth(cabinet_health.humidity.ext.max))
        setCabinetAvgDewPoint(roundToNearestTenth(cabinet_health.dew_point.sys.avg))
        setOutdoorAvgDewPoint(roundToNearestTenth(cabinet_health.dew_point.ext.avg))
        setCabinetMinDewPoint(roundToNearestTenth(cabinet_health.dew_point.sys.min))
        setOutdoorMinDewPoint(roundToNearestTenth(cabinet_health.dew_point.ext.min))
        setCabinetMaxDewPoint(roundToNearestTenth(cabinet_health.dew_point.sys.max))
        setOutdoorMaxDewPoint(roundToNearestTenth(cabinet_health.dew_point.ext.max))

        setLoading(false); // Stop loading after data is fetched
      })
      .catch((err) => {
        console.error(`Error fetching cabinet health data: ${err.message}`);
        setError("Failed to fetch cabinet health data. Please try again later.");
        setLoading(false); // Stop loading in case of error
      });
  }, [selectedCabinet]);

  return (
    <div>
      <CustomFormControl fullWidth style={{ minWidth: "200px" }}>
        <InputLabel id="cabinet-select-label">Select Cabinet</InputLabel>
        <Select
          labelId="cabinet-select-label"
          value={selectedCabinet}
          onChange={(e) => setSelectedCabinet(e.target.value)}
        >
          {Object.entries(cabinets).map(([id, cabinet]) => (
            <MenuItem key={id} value={id}>
              {cabinet.sitename} #{id}
            </MenuItem>
          ))}
        </Select>
      </CustomFormControl>

      {error ? (
        <div style={{ color: "red", marginTop: "20px" }}>
          <p>{error}</p>
        </div>
      ) : loading ? (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "100px" }}>
          <CircularProgress />  {/* Loading spinner */}
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: "200px", justifyContent: "left", marginTop: "20px" }}>
            <SummarySection
              title="Temperature"
              componentLabel="Cabinet Temperature"
              outdoorLabel="Outdoor Temperature"
              componentValue={cabinetTemperature}
              outdoorValue={outdoorTemperature}
              unit="°C"
            />
            <SummarySection
              title="Humidity"
              componentLabel="Cabinet Humidity"
              outdoorLabel="Outdoor Humidity"
              componentValue={cabinetHumidity}
              outdoorValue={outdoorHumidity}
              unit="%"
            />
            <SummarySection
              title="Dew Point"
              componentLabel="Cabinet Dew Point"
              outdoorLabel="Outdoor Dew Point"
              componentValue={cabinetDewPoint}
              outdoorValue={outdoorDewPoint}
              unit="°C"
            />
          </div>
          {chartHistory && (
            <HistoryChart
              title={"Temperature (°C) over Time"}
              xData={chartHistory.timestamp}
              yDataSeries={[
                { data: chartHistory.sys_temp, name: "Cabinet Temperature", color: "#ff7300" },
                { data: chartHistory.ext_temp, name: "Outdoor Temperature", color: "#8884d8" },
              ]}
              stats = {{
                Average: [
                  { label: "Cabinet",  value: `${cabinetAvgTemp} °C`},
                  { label: "Outdoor",  value: `${outdoorAvgTemp} °C`},
                ],
                Minimum: [
                  { label: "Cabinet",  value: `${cabinetMinTemp} °C`},
                  { label: "Outdoor",  value: `${outdoorMinTemp} °C`},
                ],
                Maximum: [
                  { label: "Cabinet",  value: `${cabinetMaxTemp} °C`},
                  { label: "Outdoor",  value: `${outdoorMaxTemp} °C`},
                ]
              }}
            />
          )}
          {chartHistory && (
            <HistoryChart
              title={"Humidity (%) over Time"}
              xData={chartHistory.timestamp}
              yDataSeries={[
                { data: chartHistory.sys_humidity, name: "Cabinet Humidity", color: "#2aa5c9" },
                { data: chartHistory.ext_humidity, name: "Outdoor Humidity", color: "#8884d8" },
              ]}
              stats = {{
                Average: [
                  { label: "Cabinet",  value: `${cabinetAvgHumidity} %`},
                  { label: "Outdoor",  value: `${outdoorAvgHumidity} %`},
                ],
                Minimum: [
                  { label: "Cabinet",  value: `${cabinetMinHumidity} %`},
                  { label: "Outdoor",  value: `${outdoorMinHumidity} %`},
                ],
                Maximum: [
                  { label: "Cabinet",  value: `${cabinetMaxHumidity} %`},
                  { label: "Outdoor",  value: `${outdoorMaxHumidity} %`},
                ]
              }}
            />
          )}
          {chartHistory && (
            <HistoryChart
              title={"Dew Point (°C) over Time"}
              xData={chartHistory.timestamp}
              yDataSeries={[
                { data: chartHistory.sys_dew_point, name: "Cabinet Dew Point", color: "#13cf84" },
                { data: chartHistory.ext_dew_point, name: "Outdoor Dew Point", color: "#8884d8" },
              ]}
              stats = {{
                Average: [
                  { label: "Cabinet",  value: `${cabinetAvgDewPoint} °C`},
                  { label: "Outdoor",  value: `${outdoorAvgDewPoint} °C`},
                ],
                Minimum: [
                  { label: "Cabinet",  value: `${cabinetMinDewPoint} °C`},
                  { label: "Outdoor",  value: `${outdoorMinDewPoint} °C`},
                ],
                Maximum: [
                  { label: "Cabinet",  value: `${cabinetMaxDewPoint} °C`},
                  { label: "Outdoor",  value: `${outdoorMaxDewPoint} °C`},
                ]
              }}
            />
          )}




          {/* {chartHistory && (
            <HistoryChart
              title={"Humidity (%) over Time"}
              xData={chartHistory.timestamp}
              yDataSeries={[
                { data: chartHistory.sys_humidity, name: "Cabinet Humidity", color: "#2aa5c9" },
                { data: chartHistory.ext_humidity, name: "Outdoor Humidity", color: "#8884d8" },
              ]}
            />
          )}
          {chartHistory && (
            <HistoryChart
              title={"Dew Point (°C) over Time"}
              xData={chartHistory.timestamp}
              yDataSeries={[
                { data: chartHistory.sys_dew_point, name: "Cabinet Dew Point", color: "#13cf84" },
                { data: chartHistory.ext_dew_point, name: "Outdoor Dew Point", color: "#8884d8" },
              ]}
            />
          )} */}
        </>
      )}
    </div>
  );
}

export default CabinetHealth;