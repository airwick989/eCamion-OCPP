import React, { useState, useEffect } from "react";
import axios from "../services/api";
import BasicTabs from "../components/TabPanel";

function Home() {
  const [sites, setSites] = useState(null); // All cabinets
  const [data, setData] = useState(null); // Temperature data for the selected site/station

  useEffect(() => {
    // Fetch cabinet data
    axios.get("/getstations").then((response) => {
        setSites(response.data);
    });
  }, []);

  if (!sites) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "Poppins, sans-serif" }}>
      <h1>EV Charging</h1>
      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        {/* Dropdown for selecting the site */}
        {/* <CustomFormControl fullWidth>
            <InputLabel id="site-select-label">Select Site</InputLabel>
            <Select
                labelId="site-select-label"
                value={selectedSite}
                onChange={(e) => {
                const newSite = e.target.value;
                setSelectedSite(newSite);
                setSelectedCabinet(sites[newSite].cabinets[0]); // Reset station when site changes
                }}
            >
                {Object.entries(sites).map(([id, site]) => (
                <MenuItem key={id} value={id}>
                    {site.sitename} #{id}
                </MenuItem>
                ))}
            </Select>
        </CustomFormControl> */}

        {/* Dropdown for selecting the station */}
        {/* <CustomFormControl fullWidth style={{ minWidth: "200px" }}>
          <InputLabel id="station-select-label">Select Station</InputLabel>
          <Select
            labelId="station-select-label"
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            disabled={!selectedSite} // Disable if no site is selected
          >
            {selectedSite &&
              sites[selectedSite].stations.map((station) => (
                <MenuItem key={station} value={station}>
                  Station {station}
                </MenuItem>
              ))}
          </Select>
        </CustomFormControl> */}
      </div>




      <BasicTabs cabinets={sites} />




      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {/* Placeholder for future components */}
      </div>
    </div>
  );
}

export default Home;