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
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HistoryChart from "./HistoryChart";
import DataTable from "./DataTable";
import BarChartComponent from "./BarChart";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import TextField from "@mui/material/TextField";

const ExpandingCard = ({ cabid, jid, sessions, totalsessiontime, upuntil, summarychart }) => {
  const [open, setOpen] = useState(false);
  const [jdata, setJdata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [thresholds, setThresholds] = useState(null);
  const [meanValues, setMeanValues] = useState({
    meantotsessdur: null,
    meanavgpwr: null,
    meanmaxpwr: null
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const options = ["30d", "7d", "24h", "custom"];
  const [timeRange, setTimeRange] = useState("30d");
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);



  
  // Fetch `jdata` when the component is rendered
  useEffect(() => {
    setLoading(true);
    setError(null);

    axios
      .get(`/jdata?cabinetid=${cabid}&chargerid=${jid}`)
      .then((response) => {
        setJdata(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(`Error fetching jdata: ${err.message}`);
        setError("Failed to fetch data. Please try again later.");
        setLoading(false);
      });
  }, [cabid, jid]);




  const handleClickListItem = (event) => {
    event.stopPropagation(); // Prevents the click from reaching the card
    setAnchorEl(event.currentTarget);
  };

  const handleDateClick = (event) => {
    event.stopPropagation(); // Prevents the click from reaching the card
    setAnchorEl(null);
  };

  const handleMenuItemClick = (event, index, option) => {
    event.stopPropagation();
    setSelectedIndex(index);
    setTimeRange(option);
    setIsCustomRange(option === "custom");
    setAnchorEl(null);
  };

  const handleCloseListItem = () => {
    setAnchorEl(null);
  };




  const formatSeconds = (seconds) => {
    const days = Math.floor(seconds / (24 * 3600));
    seconds %= 24 * 3600;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    return parts.join(' ');
  };





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
  
  // const getThresholds = (data, header) => {
  //   const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
  //   // const stdDev = Math.sqrt(
  //   //   data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / data.length
  //   // );
  //   // const devFactor = 2
  //   // const thresholdLow = mean - devFactor * stdDev; 
  //   // const thresholdHigh = mean + devFactor * stdDev;

  //   if ((jdata['tablethresholds'] != null) && (header in jdata['tablethresholds'])){
  //     return [jdata['tablethresholds'][header]['low'], Math.round(mean), jdata['tablethresholds'][header]['low']];
  //   }
  //   else {
  //     return [null, Math.round(mean), null];
  //   };

  //   // return [Math.round(thresholdLow), Math.round(mean), Math.round(thresholdHigh)];
  // };





  // const getThresholds = (data, header) => {
  //   const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
  //   return jdata?.tablethresholds?.[header]
  //     ? [jdata.tablethresholds[header].low, Math.round(mean), jdata.tablethresholds[header].high]
  //     : [null, Math.round(mean), null];
  // };


  // const [lowtotsessdur, meantotsessdur, hightotsessdur] = getThresholds(totsessdurlist, 'Total Session Duration (seconds)');
  // const [lowavgpwr, meanavgpwr, highavgpwr] = getThresholds(avgpwrlist);
  // const [lowmaxpwr, meanmaxpwr, highmaxpwr] = getThresholds(maxpwrlist);

  // setThresholds({
  //   'Total Session Duration (seconds)': {
  //     'low': lowtotsessdur,
  //     'high': hightotsessdur,
  //   },
  //   'Average Power Delivered (kW)': {
  //     'low': lowavgpwr,
  //     'high': highavgpwr,
  //   }, 
  //   'Maximum Power Delivered (kW)': {
  //     'low': lowmaxpwr,
  //     'high': highmaxpwr,
  //   },
  // });

  useEffect(() => {
    if (!jdata) return; // Ensure jdata is available before processing
  
    const getThresholds = (data, header) => {
      const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
      return jdata?.tablethresholds?.[header]
        ? [jdata.tablethresholds[header].low, Math.round(mean), jdata.tablethresholds[header].high]
        : [null, Math.round(mean), null];
    };
  
    const [lowtotsessdur, meantotsessdur, hightotsessdur] = getThresholds(totsessdurlist, 'Total Session Duration (seconds)');
    const [lowavgpwr, meanavgpwr, highavgpwr] = getThresholds(avgpwrlist, 'Average Power Delivered (kW)');
    const [lowmaxpwr, meanmaxpwr, highmaxpwr] = getThresholds(maxpwrlist, 'Maximum Power Delivered (kW)');
  
    setMeanValues({ meantotsessdur, meanavgpwr, meanmaxpwr });

    setThresholds({
      'Total Session Duration (seconds)': { 'low': lowtotsessdur, 'high': hightotsessdur },
      'Average Power Delivered (kW)': { 'low': lowavgpwr, 'high': highavgpwr },
      'Maximum Power Delivered (kW)': { 'low': lowmaxpwr, 'high': highmaxpwr },
    });
  
  }, [jdata]); // Runs only when `jdata` is updated  




  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!jdata) return null; // Ensures component doesn't render before data is available




  return (
    <div>
      {/* Summary Card */}
      <Card
        sx={{
          maxWidth: 1800,
          margin: "16px auto",
          cursor: "pointer",
          boxShadow: 3,
          ":hover": { boxShadow: 6 },
        }}
        onClick={handleOpen}
      >
        <CardContent>

          <Box
            sx={{
              display: "flex",
              justifyContent: "left",
              alignItems: "center",
              gap: 2,
              mt: 2,
              marginBottom: '50px',
            }}
          >
            <Typography variant="h5" component="div">
              Charger {jid}
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: "grey.100",
                borderRadius: 1,
                display: "inline-block",
              }}
            >
              <Typography variant="body1" component="div">
                <strong>Number of Sessions:</strong><br/> {sessions}
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
              <Typography variant="body1" component="div">
                <strong>Cumulative Session Time:</strong><br/> {formatSeconds(totalsessiontime)}
              </Typography>
            </Box>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", justifyContent: "center", marginBottom: "10px" }}>
              <List component="nav" aria-label="Time Range">
                <ListItemButton
                  id="range-button"
                  aria-haspopup="listbox"
                  aria-controls="range-menu"
                  aria-label="Select Time Range"
                  aria-expanded={anchorEl ? "true" : undefined}
                  onClick={handleClickListItem}
                  style={{ width: "90px", border: "1px solid #ccc", borderRadius: "8px" }}
                >
                  <ListItemText secondary={options[selectedIndex]} style={{ justifyContent: "center" }} />
                </ListItemButton>
              </List>
              <Menu id="range-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseListItem}>
                {options.map((option, index) => (
                  <MenuItem key={option} selected={index === selectedIndex} onClick={(event) => handleMenuItemClick(event, index, option)}>
                    {option}
                  </MenuItem>
                ))}
              </Menu>
            </div>
            {isCustomRange && (
              <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "10px" }}>
                <TextField
                  type="date"
                  label="Start Date"
                  value={customStartDate || ""}
                  onClick={handleDateClick}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  type="date"
                  label="End Date"
                  value={customEndDate || ""}
                  onClick={handleDateClick}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </div>
            )}
          </Box>
  
          <BarChartComponent chartdata={summarychart} ydata={'totsessions'} ydatalabel={'Number of Sessions'} title={'Number of Charging Sessions Per Day'} isCustomRange={isCustomRange} customStartDate={customStartDate} customEndDate={customEndDate} timeRange={timeRange} />
          <BarChartComponent chartdata={summarychart} ydata={'totsessionsdur'} ydatalabel={'Total Duration of All Sessions'} title={'Total Duration of All Charging Sessions Per Day'} isCustomRange={isCustomRange} customStartDate={customStartDate} customEndDate={customEndDate} timeRange={timeRange} barcolour="#1976d2" />
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
                Cumulative session time of <strong>{formatSeconds(totalsessiontime)}</strong>
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
                The mean total session duration was <strong>{formatSeconds(meanValues.meantotsessdur) ?? "Loading..."}</strong>
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
                The average power delivery of all sessions had a mean of <strong>{meanValues.meanavgpwr ?? "Loading..."} kW</strong>, while the max power delivery of all sessions had a mean of <strong>{meanValues.meanmaxpwr ?? "Loading..."} kW</strong>
              </Typography>
            </Box>
            <span style={{ color: "grey", fontSize: "14px", marginLeft: "20px" }}>
              The minimum and maximum thresholds for session values to be flagged may be set and cleared by selecting the <strong>header</strong> of the correspondent column.
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
                <DataTable cabid={cabid} jid={jid} headers={headers} data={tabledata} columnOrder={columnOrder} thresholds={thresholds} setThresholds={setThresholds} />
              )}
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default ExpandingCard;