import React, { useState, useEffect } from "react";
import axios from "../services/api";
import SummarySection from "./SummarySection";
import { Select, MenuItem, InputLabel, CircularProgress, Grid, Container, Typography } from "@mui/material";
import CustomFormControl from "./CustomFormControl";
import HistoryChart from "./HistoryChart";
import Cookies from "js-cookie";
import ExpandingCard from "./ExpandingCard";

function roundToNearestThousandth(number) {
  return Math.round(number * 1000) / 1000;
}

function Jhealth({ cabinets }) {
  const [selectedCabinet, setSelectedCabinet] = useState(
    parseInt(Cookies.get("selectedCabinet") || Math.min(...Object.keys(cabinets).map(Number)), 10)
  );
  const [error, setError] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [jData, setJData] = useState(null);
  const [upUntil, setUpUntil] = useState(null);
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
      .get(`/jsummaries?cabinetid=${selectedCabinet}`)
      .then((response) => {
        setSummaryData(response.data["jsummaries"]);

        setUpUntil(response.data["upuntil"]);
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
            Data up until <strong>{upUntil}</strong>.
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
            <Container sx={{ mt: 4 }}>
                <Typography variant="h4" align="center" gutterBottom>
                    J Health Statistics <span style={{ color: "grey"}}> (Last 30 Days) </span>
                </Typography>
                {summaryData ? (
                    <Grid container spacing={4}>
                        {Object.entries(summaryData).map(([id, { sessions, totalsessiontime }]) => (
                            <Grid item xs={12} sm={6} md={4} key={id}>
                                <ExpandingCard
                                    cabid={selectedCabinet}
                                    jid={id}
                                    sessions={sessions}
                                    totalsessiontime={totalsessiontime}
                                    upuntil={upUntil}
                                />
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Typography align="center">Loading...</Typography>
                )}
            </Container>
        </>
      )}
    </div>
  );
}

export default Jhealth;