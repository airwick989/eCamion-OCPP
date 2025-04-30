import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Fade from "@mui/material/Fade";
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import TextField from "@mui/material/TextField";


const HistoryChart = ({ title, unit, xData, yDataSeries }) => {
  const [timeRange, setTimeRange] = useState("30d");
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [isCustomRange, setIsCustomRange] = useState(false);

  // Helper function to round values to the nearest tenth
  const roundToNearestTenth = (value) => Math.round(value * 10) / 10;

  // Function to downsample data
  const downsample = (data, maxPoints) => {
    const sampleRate = Math.max(1, Math.floor(data.length / maxPoints));
    return data.filter((_, index) => index % sampleRate === 0);
  };

  // Function to format timestamps for better readability
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    if (timeRange === "24h") {
      return `${date.getHours()}:00`; // Show hours only for 24-hour range
    }
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:00`; // MM/DD/YYYY format
  };

  // Filter and round data based on time range
  const filterDataByRange = (xData, yDataSeries, range) => {
    const latestTimestamp = new Date(
      Math.max(...xData.map((timestamp) => new Date(timestamp).getTime()))
    );
    let rangeStart;

    if (range === "custom") {
      if (!customStartDate || !customEndDate) return { filteredXData: [], filteredYDataSeries: [] };

      const customStart = new Date(customStartDate).getTime();
      const customEnd = new Date(customEndDate).getTime();
      if (customStart > customEnd) return { filteredXData: [], filteredYDataSeries: [] };

      const filteredIndices = xData
        .map((timestamp, index) => ({ timestamp, index }))
        .filter(
          ({ timestamp }) =>
            new Date(timestamp).getTime() >= customStart &&
            new Date(timestamp).getTime() <= customEnd
        )
        .map(({ index }) => index);

      const filteredXData = filteredIndices.map((i) => xData[i]);
      const filteredYDataSeries = yDataSeries.map(({ data, name, color }) => ({
        data: filteredIndices.map((i) => (data[i] !== null ? roundToNearestTenth(data[i]) : null)),
        name,
        color,
      }));

      return { filteredXData, filteredYDataSeries };
    }

    switch (range) {
      case "24h":
        rangeStart = latestTimestamp.getTime() - 24 * 60 * 60 * 1000;
        break;
      case "7d":
        rangeStart = latestTimestamp.getTime() - 7 * 24 * 60 * 60 * 1000;
        break;
      case "30d":
      default:
        rangeStart = latestTimestamp.getTime() - 30 * 24 * 60 * 60 * 1000;
        break;
    }

    const filteredIndices = xData
      .map((timestamp, index) => ({ timestamp, index }))
      .filter(({ timestamp }) => new Date(timestamp).getTime() >= rangeStart)
      .map(({ index }) => index);

    const filteredXData = filteredIndices.map((i) => xData[i]);
    const filteredYDataSeries = yDataSeries.map(({ data, name, color }) => ({
      data: filteredIndices.map((i) => data[i] !== null ? roundToNearestTenth(data[i]) : null),
      name,
      color,
    }));

    return { filteredXData, filteredYDataSeries };
  };

  const { filteredXData, filteredYDataSeries } = filterDataByRange(xData, yDataSeries, isCustomRange ? "custom" : timeRange);

  // Calculate statistics dynamically for each series
  const calculateStats = (yDataSeries) => {
    const stats = {};
  
    stats.Average = yDataSeries.map(({ name, data }) => {
      const validData = data.filter((val) => val !== null); // Exclude null values
      return {
        label: name,
        value: validData.length
          ? `${roundToNearestTenth(validData.reduce((sum, val) => sum + val, 0) / validData.length)} ${unit}`
          : "N/A", // Handle case where no valid data exists
      };
    });
  
    stats.Minimum = yDataSeries.map(({ name, data }) => {
      const validData = data.filter((val) => val !== null); // Exclude null values
      return {
        label: name,
        value: validData.length ? `${Math.min(...validData)} ${unit}` : "N/A",
      };
    });
  
    stats.Maximum = yDataSeries.map(({ name, data }) => {
      const validData = data.filter((val) => val !== null); // Exclude null values
      return {
        label: name,
        value: validData.length ? `${Math.max(...validData)} ${unit}` : "N/A",
      };
    });
  
    return stats;
  };
  

  const stats = useMemo(() => calculateStats(filteredYDataSeries), [filteredYDataSeries]);

  // Downsample xData and yDataSeries
  const maxPoints = 100;
  const sampledXData = downsample(filteredXData, maxPoints);
  const sampledYDataSeries = filteredYDataSeries.map(({ data, name, color }) => ({
    data: downsample(data, maxPoints),
    name,
    color,
  }));

  // Combine xData with yDataSeries into a single array of objects for Recharts
  const chartData = sampledXData.map((xValue, index) => {
    const dataPoint = { x: xValue };
    sampledYDataSeries.forEach(({ data, name }) => {
      dataPoint[name] = data[index]; // Add each series as a property
    });
    return dataPoint;
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const open = Boolean(anchorEl);
  const handleClickListItem = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuItemClick = (event, index, option) => {
    setSelectedIndex(index);
    setTimeRange(option);
    setIsCustomRange(option === "custom");
    setAnchorEl(null);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const options = [
    '30d',
    '7d',
    '24h',
    "custom"
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        marginTop: "20px",
      }}
    >
        <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <h2>{title}</h2>
                <div>
                    <List
                        component="nav"
                        aria-label="Device settings"
                        sx={{ bgcolor: 'background.paper' }}
                    >
                        <ListItemButton
                            id="lock-button"
                            aria-haspopup="listbox"
                            aria-controls="lock-menu"
                            aria-label="Select Time Range"
                            aria-expanded={open ? 'true' : undefined}
                            onClick={handleClickListItem}
                            style={{
                                width: "90px",
                                border: "1px solid #ccc",
                                borderRadius: "8px",
                            }}
                            >
                            <ListItemText
                                secondary={options[selectedIndex]}
                                style={{justifyContent: "center"}}
                            />
                        </ListItemButton>
                    </List>
                    <Menu
                        id="lock-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        MenuListProps={{
                        'aria-labelledby': 'lock-button',
                        role: 'listbox',
                        }}
                    >
                        {options.map((option, index) => (
                        <MenuItem
                            key={option}
                            selected={index === selectedIndex}
                            onClick={(event) => handleMenuItemClick(event, index, option)}
                        >
                            {option}
                        </MenuItem>
                        ))}
                    </Menu> 
                </div>
            </div>


            {isCustomRange && (
              <div style={{marginBottom: '20px'}}>
                <TextField
                  type="date"
                  label="Start Date"
                  value={customStartDate || ""}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  type="date"
                  label="End Date"
                  value={customEndDate || ""}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </div>
            )}


            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="x"
                        tickFormatter={formatTimestamp} // Condense timestamps
                        interval={Math.ceil(sampledXData.length / 8)} // Show labels at regular intervals, with a max of 8 labels on the X Axis
                    />
                    <YAxis />
                    <Tooltip labelFormatter={formatTimestamp} />
                    <Legend />
                    {sampledYDataSeries.map(({ name, color }, idx) => (
                    <Line
                        key={name}
                        type="monotone"
                        dataKey={name}
                        stroke={color || `hsl(${(idx * 360) / yDataSeries.length}, 70%, 50%)`}
                        activeDot={{ r: 8 }}
                    />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
        <div
        style={{
            width: "200px",
            marginLeft: "16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
        }}
        >
            {Object.entries(stats).map(([title, statList], idx) => (
            <div key={idx} style={{ marginBottom: "16px" }}>
                <div>
                  <strong style={{ display: 'inline' }}>{title} </strong>
                  <p style={{ display: 'inline', margin: 0 , color: 'grey'}}>({timeRange})</p>
                </div>
                <ul style={{ listStyleType: "none", padding: 0 }}>
                {statList.map((stat, index) => (
                    <li key={index} style={{ marginBottom: "8px" }}>
                    <span style={{ marginRight: "50px" }}>{stat.label}:</span>
                    <span>{stat.value}</span>
                    </li>
                ))}
                </ul>
            </div>
            ))}
        </div>
    </div>
  );
};

export default HistoryChart;