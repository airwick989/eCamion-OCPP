import React, { useState, useEffect } from "react";
import axios from "../services/api";
import SummarySection from "./SummarySection";
import { Select, MenuItem, InputLabel, CircularProgress } from "@mui/material";
import CustomFormControl from "./CustomFormControl";
import HistoryChart from "./HistoryChart";
import Cookies from "js-cookie";

function roundToNearestThousandth(number) {
  return Math.round(number * 1000) / 1000;
}

function Prediction({ cabinets }) {
  const [selectedCabinet, setSelectedCabinet] = useState(
    parseInt(Cookies.get("selectedCabinet") || Math.min(...Object.keys(cabinets).map(Number)), 10)
  );
  const [error, setError] = useState(null);
  const [chartHistory, setChartHistory] = useState(null);
  const [upUntil, setUpUntil] = useState(null);
  const [processedTime, setProcessedTime] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleCabinetChange = (event) => {
      const newCabinetId = event.detail.cabinetId;
      setSelectedCabinet(newCabinetId);
    };
  
    window.addEventListener("cabinetChange", handleCabinetChange);
  
    return () => {
      window.removeEventListener("cabinetChange", handleCabinetChange);
    };
  }, []);
  
  
  useEffect(() => {
    setLoading(true);
    setError(null);
    axios
      .get(`/prediction?cabinetid=${selectedCabinet}`)
      .then((response) => {
        const chartdata = response.data["chartdata"];
        const historylength = chartdata["history"]["time"].length;
        const predictionlength = chartdata["predictions"]["time"].length;
  
        setChartHistory({
          timestamp: chartdata["history"]["time"].concat(chartdata["predictions"]["time"]),
          history: chartdata["history"]["totenergydeli"].concat(Array(predictionlength).fill(null)),
          prediction: Array(historylength).fill(null).concat(chartdata["predictions"]["totenergydeli"]),
          rmse: chartdata["rmse"],
          r2: chartdata["r2"],
          mae: chartdata["mae"],
        });
        setUpUntil(response.data["upuntil"]);
        setProcessedTime(response.data["processedtime"]);
        setLoading(false);
      })
      .catch((err) => {
        console.error(`Error fetching prediction data: ${err.message}`);
        setError("Failed to fetch prediction data. Please try again later.");
        setLoading(false);
      });
  }, [selectedCabinet]);


  const handleCabinetChange = (event) => {
    const newCabinetId = event.target.value;
    setSelectedCabinet(newCabinetId);
    Cookies.set("selectedCabinet", newCabinetId); // Update cookie

    // Dispatch custom event
    const cabinetChangeEvent = new CustomEvent("cabinetChange", {
        detail: { cabinetId: newCabinetId },
      });
      window.dispatchEvent(cabinetChangeEvent);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <CustomFormControl fullWidth style={{ minWidth: "200px" }}>
          <InputLabel id="cabinet-select-label">Select Cabinet</InputLabel>
          <Select
            labelId="cabinet-select-label"
            value={selectedCabinet}
            onChange={handleCabinetChange}
          >
            {Object.entries(cabinets).map(([id, cabinet]) => (
              <MenuItem key={id} value={id}>
                {cabinet.sitename} #{id}
              </MenuItem>
            ))}
          </Select>
        </CustomFormControl>
        {error ? (
          <p></p>
        ) : loading ? (
          <p></p>
        ) : (
          <span style={{ color: "grey", fontSize: "14px", marginLeft: "20px" }}>
            Data up until <strong>{upUntil}</strong>. ML predictions were last processed on <strong>{processedTime}</strong>. Data points are predicted at <strong>2 hour</strong> intervals.
          </span>
        )}
      </div>

      {error ? (
        <div style={{ color: "red", marginTop: "20px" }}>
          <p>{error}</p>
        </div>
      ) : loading ? (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "100px" }}>
          <CircularProgress /> {/* Loading spinner */}
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: "200px", justifyContent: "left", marginTop: "20px" }}>
            {chartHistory && chartHistory.rmse && chartHistory.r2 && chartHistory.mae !== undefined && (
              <SummarySection
                title="3 Days forecast"
                data={[
                  { label: "RMSE", value: roundToNearestThousandth(chartHistory["rmse"]) },
                  { label: "R2", value: roundToNearestThousandth(chartHistory["r2"]) },
                  { label: "MAE", value: roundToNearestThousandth(chartHistory["mae"]) },
                ]}
              />
            )}
          </div>
          {chartHistory && chartHistory.timestamp && (
            <HistoryChart
              title={"Energy Delivered (kWh) over Time"}
              unit={"kWh"}
              xData={chartHistory["timestamp"]}
              yDataSeries={[
                { data: chartHistory["history"], name: "Historical", color: "#8884d8" },
                { data: chartHistory["prediction"], name: "Predicted", color: "#ff7300" },
              ]}
            />
          )}
        </>
      )}
    </div>
  );
}

export default Prediction;