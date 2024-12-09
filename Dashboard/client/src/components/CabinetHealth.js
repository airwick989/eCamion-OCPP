import React, { useState, useEffect } from "react";
import axios from "../services/api";
import SummarySection from "./SummarySection";
import { Select, MenuItem, InputLabel } from "@mui/material";
import CustomFormControl from "./CustomFormControl";

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
  const [selectedCabinet, setSelectedCabinet] = useState(Math.min(...Object.keys(cabinets).map(Number))); // Selected station ID
  const [error, setError] = useState(null); // State for error message

  useEffect(() => {
    setError(null); // Reset error state when new request starts
    axios
      .get(`/cabinethealth?cabinetid=${selectedCabinet}`)
      .then((response) => {
        const cabinet_health = response.data["cabinet_health"];
        setCabinetTemperature(roundToNearestTenth(cabinet_health["temp"]["sys"]["latest"]));
        setOutdoorTemperature(roundToNearestTenth(cabinet_health["temp"]["ext"]["latest"]));
        setCabinetHumidity(roundToNearestTenth(cabinet_health["humidity"]["sys"]["latest"]));
        setOutdoorHumidity(roundToNearestTenth(cabinet_health["humidity"]["ext"]["latest"]));
        setCabinetDewPoint(roundToNearestTenth(cabinet_health["dew_point"]["sys"]["latest"]));
        setOutdoorDewPoint(roundToNearestTenth(cabinet_health["dew_point"]["ext"]["latest"]));
        console.log(cabinet_health);
      })
      .catch((error) => {
        console.error(`Error fetching cabinet health data: ${error.message}`);
        setError("Failed to fetch cabinet health data. Please try again later.");
      });
  }, [selectedCabinet]);

  return (
    <div>
      {/* Dropdown for selecting the cabinet */}
      <CustomFormControl fullWidth style={{ minWidth: "200px" }}>
        <InputLabel id="station-select-label">Select Cabinet</InputLabel>
        <Select
          labelId="station-select-label"
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

      {/* Error Message or SummarySection */}
      {error ? (
        <div style={{ color: "red", marginTop: "20px" }}>
          <p>{error}</p>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "200px", justifyContent: "left", marginTop: "20px" }}>
          {/* Temperature Section */}
          <SummarySection
            title="Temperature"
            componentLabel="Cabinet Temperature"
            outdoorLabel="Outdoor Temperature"
            componentValue={cabinetTemperature}
            outdoorValue={outdoorTemperature}
            loadingMessage="Loading temperatures..."
            unit="°C"
          />

          {/* Humidity Section */}
          <SummarySection
            title="Humidity"
            componentLabel="Cabinet Humidity"
            outdoorLabel="Outdoor Humidity"
            componentValue={cabinetHumidity}
            outdoorValue={outdoorHumidity}
            loadingMessage="Loading humidities..."
            unit="%"
          />

          {/* Dew Point Section */}
          <SummarySection
            title="Dew Point"
            componentLabel="Cabinet Dew Point"
            outdoorLabel="Outdoor Dew Point"
            componentValue={cabinetDewPoint}
            outdoorValue={outdoorDewPoint}
            loadingMessage="Loading dew points..."
            unit="°C"
          />
        </div>
      )}
    </div>
  );
}

export default CabinetHealth;