import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Modal,
  Box,
  IconButton,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HistoryChart from "./HistoryChart";
import DataTable from "./DataTable";

const ExpandingCard = ({id, sessions, totalsessiontime, jdata, upuntil}) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);




    // Function to sort by start_time in reverse chronological order
    const sortDataByStartTime = (tabledata) => {
        const headers = Object.keys(tabledata);

        // Combine data into a single array of objects
        const combinedData = Array.from({ length: tabledata[headers[0]].length }, (_, index) => {
            const row = {};
            headers.forEach((header) => {
                row[header] = tabledata[header][index];
            });
            return row;
        });

        // Sort the combined data by start_time in reverse chronological order
        combinedData.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

        // Transform back into headers and data format
        const sortedData = headers.reduce((acc, header) => {
        acc[header] = combinedData.map((row) => row[header]);
        return acc;
        }, {});

        return sortedData;
    };

    const sortedTableData = sortDataByStartTime(jdata.tabledata);
    const headers = Object.keys(sortedTableData);
    const tabledata = Array.from({ length: sortedTableData [headers[0]]?.length || 0 }, (_, index) => {
        const row = {};
        Object.keys(sortedTableData ).forEach((header) => {
            row[header] = sortedTableData [header][index];
        });
        return row;
    });
    const columnOrder = ["id", "start_time", "totsessdur", "startsoc", "endsoc", "avepowerdeli", "maxpowerdeli"];



    
  return (
    <div>
      {/* Summary Card */}
      <Card
        sx={{
          maxWidth: 400,
          margin: "16px auto",
          cursor: "pointer",
          boxShadow: 3,
          ":hover": { boxShadow: 6 },
        }}
        onClick={handleOpen}
      >
        <CardContent>
          <Typography variant="h5" component="div">
            Charger {id}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <strong>Number of Sessions:</strong> {sessions}
          </Typography>
          <Typography variant="body1" color="text.secondary">
          <strong>Cumulative Session Time:</strong> {totalsessiontime}
          </Typography>
        </CardContent>
      </Card>

      {/* Floating Overlay */}
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxHeight: "90%",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            overflowY: "auto",
            borderRadius: 2,
          }}
        >
          {/* Overlay Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h5">Charger {id} Statistics</Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />

          {/* Overlay Content */}
            <Box
                sx={{
                    display: "flex", // Enables flexbox layout
                    justifyContent: "left", // Distributes space between items
                    alignItems: "center", // Aligns items vertically
                    gap: 2, // Adds spacing between the boxes (optional)
                    mt: 2, // Adds some margin to the top
                }}
            >
                <Box
                    sx={{
                        p: 2, // Padding inside the box
                        bgcolor: "grey.100", // Background color
                        borderRadius: 1, // Rounded corners
                        display: "inline-block", // Ensures the box size matches its content
                    }}
                >
                    <Typography variant="body1">
                        <strong>{sessions}</strong> sessions
                    </Typography>
                </Box>
                <Box
                    sx={{
                        p: 2, // Padding inside the box
                        bgcolor: "grey.100", // Background color
                        borderRadius: 1, // Rounded corners
                        display: "inline-block", // Ensures the box size matches its content
                    }}
                >
                    <Typography variant="body1">
                        Cumulative session time of <strong>{totalsessiontime}</strong>
                    </Typography>
                </Box>
                <span style={{ color: "grey", fontSize: "14px", marginLeft: "20px" }}>
                    Data up until <strong>{upuntil}</strong>.
                </span>
            </Box>
            {jdata.chartdata && (
                <HistoryChart
                    title={"Temperature (°C) over Time"}
                    unit={"°C"}
                    xData={jdata.chartdata.timestamp}
                    yDataSeries={[
                        { data: jdata.chartdata.pc_child_present_temperature, name: "PC_child", color: "#ff7300" },
                        { data: jdata.chartdata.pc_parent_present_temperature, name: "PC_parent", color: "#b53737" },
                        { data: jdata.chartdata.temperature_2m, name: "Outdoor", color: "#8884d8" },
                    ]}
                />
            )}
            {headers.length > 0 && tabledata.length > 0 && (
                <DataTable headers={headers} data={tabledata} columnOrder={columnOrder} />
            )}
        </Box>
      </Modal>
    </div>
  );
};

export default ExpandingCard;