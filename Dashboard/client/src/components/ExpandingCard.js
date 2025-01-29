import React, { useState, useEffect } from "react";
import axios from "../services/api";
import {
  Card,
  CardContent,
  Typography,
  Modal,
  Box,
  IconButton,
  Divider,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HistoryChart from "./HistoryChart";
import DataTable from "./DataTable";

const ExpandingCard = ({ cabid, jid, sessions, totalsessiontime, upuntil }) => {
  const [open, setOpen] = useState(false);
  const [jdata, setJdata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch `jdata` when the component is rendered
  useEffect(() => {
    setLoading(true);
    setError(null);

    axios
      .get(`/jdata?cabinetid=${cabid}&chargerid=${jid}`)
      .then((response) => {
        setJdata(response.data);
        console.log(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(`Error fetching jdata: ${err.message}`);
        setError("Failed to fetch data. Please try again later.");
        setLoading(false);
      });
  }, [cabid, jid]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const headers = Object.keys(jdata?.tabledata || {});
  const tabledata =
    headers.length > 0
      ? Array.from({ length: jdata.tabledata[headers[0]]?.length || 0 }, (_, index) => {
          const row = {};
          headers.forEach((header) => {
            row[header] = jdata.tabledata[header][index];
          });
          return row;
        })
      : [];
  const columnOrder = ['ID', 'Start Time', 'Total Session Duration (seconds)', 'Start SOC (%)', 'End SOC (%)', 'Average Power Delivered (kW)', 'Maximum Power Delivered (kW)'];

  let totsessdurlist = [];
  let avgpwrlist = [];
  let maxpwrlist = [];
  for (let i = 0; i < tabledata.length; i++) {
    totsessdurlist.push(tabledata[i]['Total Session Duration (seconds)']);
    avgpwrlist.push(tabledata[i]['Average Power Delivered (kW)']);
    maxpwrlist.push(tabledata[i]['Maximum Power Delivered (kW)']);
  }
  
  const calculateThresholds = (data) => {
    const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
    const stdDev = Math.sqrt(
      data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / data.length
    );

    const devFactor = 2
    const thresholdLow = mean - devFactor * stdDev; 
    const thresholdHigh = mean + devFactor * stdDev;

    return [Math.round(thresholdLow), Math.round(mean), Math.round(thresholdHigh)];
};


  const [lowtotsessdur, meantotsessdur, hightotsessdur] = calculateThresholds(totsessdurlist);
  const [lowavgpwr, meanavgpwr, highavgpwr] = calculateThresholds(avgpwrlist);
  const [lowmaxpwr, meanmaxpwr, highmaxpwr] = calculateThresholds(maxpwrlist);

  const thresholds = {
    'Total Session Duration (seconds)': {
      'low': lowtotsessdur,
      'high': hightotsessdur,
    },
    'Average Power Delivered (kW)': {
      'low': lowavgpwr,
      'high': highavgpwr,
    }, 
    'Maximum Power Delivered (kW)': {
      'low': lowmaxpwr,
      'high': highmaxpwr,
    },
  }




  return (
    <div>
      {/* Summary Card */}
      <Card
        sx={{
          maxWidth: 1100,
          margin: "16px auto",
          cursor: "pointer",
          boxShadow: 3,
          ":hover": { boxShadow: 6 },
        }}
        onClick={handleOpen}
      >
        <CardContent>
          <Typography variant="h5" component="div">
            Charger {jid}
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
            <Typography variant="h5">Charger {jid} Statistics <span style={{ color: "grey"}}> (Last 30 Days) </span></Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />

          {/* Overlay Content */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "left",
              alignItems: "center",
              gap: 2,
              mt: 2,
            }}
          >
            <Box
              sx={{
                p: 2,
                bgcolor: "grey.100",
                borderRadius: 1,
                display: "inline-block",
              }}
            >
              <Typography variant="body1">
                A total of <strong>{sessions} sessions</strong>
              </Typography>
            </Box>
            <Box
              sx={{
                p: 2,
                bgcolor: "grey.100",
                borderRadius: 1,
                display: "inline-block",
              }}
            >
              <Typography variant="body1">
                Cumulative session time of <strong>{totalsessiontime} seconds</strong>
              </Typography>
            </Box>
            <span style={{ color: "grey", fontSize: "14px", marginLeft: "20px" }}>
              Data up until <strong>{upuntil}</strong>.
            </span>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "left",
              alignItems: "center",
              gap: 2,
              mt: 2,
            }}
          >
            <Box
              sx={{
                p: 2,
                bgcolor: "grey.100",
                borderRadius: 1,
                display: "inline-block",
              }}
            >
              <Typography variant="body1">
                The mean total session duration was <strong>{meantotsessdur} seconds</strong>
              </Typography>
            </Box>
            <Box
              sx={{
                p: 2,
                bgcolor: "grey.100",
                borderRadius: 1,
                display: "inline-block",
              }}
            >
              <Typography variant="body1">
                The average power delivery of all sessions had a mean of <strong>{meanavgpwr} kW</strong>, while the max power delivery of all sessions had a mean of <strong>{meanmaxpwr} kW</strong>
              </Typography>
            </Box>
            <span style={{ color: "grey", fontSize: "14px", marginLeft: "20px" }}>
              The minimum and maximum thresholds for session values to be flagged are <strong>2 standard deviations</strong> above or below the mean. Values below the minimum threshold will be flagged in <strong>blue</strong>, and values above the maximum threshold will be flagged in <strong>red</strong>.
            </span>
          </Box>
          {loading && <CircularProgress sx={{ display: "block", margin: "auto", marginTop: '50px', width: 100, height: 100 }} />}
          {error && <Typography color="error">{error}</Typography>}
          {!loading && jdata && (
            <>
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
                <DataTable headers={headers} data={tabledata} columnOrder={columnOrder} thresholds={thresholds} />
              )}
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default ExpandingCard;