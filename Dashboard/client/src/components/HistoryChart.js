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


const HistoryChart = ({ title, unit, xData, yDataSeries }) => {
  const [timeRange, setTimeRange] = useState("30d");

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
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`; // MM/DD/YYYY format
  };

  // Filter and round data based on time range
  const filterDataByRange = (xData, yDataSeries, range) => {
    const latestTimestamp = new Date(
      Math.max(...xData.map((timestamp) => new Date(timestamp).getTime()))
    );
    let rangeStart;

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
      data: filteredIndices.map((i) => roundToNearestTenth(data[i])), // Round to nearest tenth
      name,
      color,
    }));

    return { filteredXData, filteredYDataSeries };
  };

  const { filteredXData, filteredYDataSeries } = filterDataByRange(xData, yDataSeries, timeRange);

  // Calculate statistics dynamically for each series
  const calculateStats = (yDataSeries) => {
    const stats = {};
    stats.Average = yDataSeries.map(({ name, data }) => ({
      label: name,
      value: `${roundToNearestTenth(data.reduce((sum, val) => sum + val, 0) / data.length)} ${unit}`,
    }));

    stats.Minimum = yDataSeries.map(({ name, data }) => ({
      label: name,
      value: `${Math.min(...data)} ${unit}`,
    }));

    stats.Maximum = yDataSeries.map(({ name, data }) => ({
      label: name,
      value: `${Math.max(...data)} ${unit}`,
    }));

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
    setAnchorEl(null);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const options = [
    '30d',
    '7d',
    '24h'
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
                                width: "60px",
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
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="x"
                        tickFormatter={formatTimestamp} // Condense timestamps
                        interval={Math.ceil(sampledXData.length / 10)} // Show labels at regular intervals
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
                <strong>{title}</strong>
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