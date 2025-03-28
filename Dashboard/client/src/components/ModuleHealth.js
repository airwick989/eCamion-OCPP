import React, { useState, useEffect } from "react";
import axios from "../services/api";
import { Select, MenuItem, InputLabel, CircularProgress } from "@mui/material";
import CustomFormControl from "./CustomFormControl";
import Cookies from "js-cookie";
import DataTable from "./DataTable";
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ModuleSpreadBarChart from "./ModuleSpreadBarChart";

function ModuleHealth({ cabinets }) {
  const [selectedCabinet, setSelectedCabinet] = useState(
    parseInt(Cookies.get("selectedCabinet") || Math.min(...Object.keys(cabinets).map(Number)), 10)
  );
  const [error, setError] = useState(null);
  const [upUntil, setUpUntil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [moduleData, setModuleData] = useState(null);
  const [currString, setCurrString] = useState(0);

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
      .get(`/moduledata?cabinetid=${selectedCabinet}`)
      .then((response) => {
        const data = response.data;
        setModuleData(data["moduledata"]);
        setUpUntil(data["upuntil"]);
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


  const handleStringChange = (event, newString) => {
    setCurrString(newString);
    console.log(newString);
  };

  
  const formatDataForTable = (moduleData) => {
    return Object.keys(moduleData).map((string) => {
        const moduleReadings = moduleData[string];

        return moduleReadings["Module"].map((_, index) => {
        let row = { Module: moduleReadings["Module"][index] };

        Object.keys(moduleReadings).forEach((dataitem) => {
            if (Array.isArray(moduleReadings[dataitem])) {
            row[dataitem] = moduleReadings[dataitem][index];
            }
        });

        return row;
        });
    });
  };

  const tabledata = moduleData ? formatDataForTable(moduleData) : [];
  const headers = Object.keys(moduleData?.string1 || {}); // Extract headers from any module
  const columnOrder = ['Module', 'Timestamp', 'Minimum Cell Voltage', 'Maximum Cell Voltage', 'Average Cell Voltage', 'Total Voltage', 'Minimum Temperature', 'Maximum Temperature', 'Average Temperature'];
  console.log(tabledata);

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
            <Box sx={{ width: '100%', bgcolor: 'background.paper', marginTop: '50px' }}>
                <Tabs value={currString} onChange={handleStringChange} centered>
                    <Tab label="String 1" />
                    <Tab label="String 2" />
                    <Tab label="String 3" />
                </Tabs>
            </Box>
            {headers.length > 0 && tabledata.length > 0 && (
                <>
                    <h2>String {currString + 1}</h2>
                    <ModuleSpreadBarChart tabledata={tabledata[currString]} />
                    <DataTable 
                        headers={headers} 
                        data={tabledata[currString]} // Pass string data
                        columnOrder={columnOrder} 
                        thresholds={{}} 
                        setThresholds={() => {}}
                    />
                </>
            )}
        </>
      )}
    </div>
  );
}

export default ModuleHealth