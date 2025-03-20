import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const BarChartComponent = ({ chartdata, ydata, ydatalabel, title, isCustomRange, timeRange, customStartDate, customEndDate, barcolour = "#82ca9d" }) => {

  const filterDataByRange = (data, range) => {
    const latestTimestamp = new Date(Math.max(...Object.keys(data).map((date) => new Date(date).getTime())));
    let rangeStart;

    if (range === "custom") {
      if (!customStartDate || !customEndDate) return {};

      const customStart = new Date(customStartDate).getTime();
      const customEnd = new Date(customEndDate).getTime();
      if (customStart > customEnd) return {};

      return Object.fromEntries(
        Object.entries(data).filter(([date]) => {
          const timestamp = new Date(date).getTime();
          return timestamp >= customStart && timestamp <= customEnd;
        })
      );
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

    return Object.fromEntries(
      Object.entries(data).filter(([date]) => new Date(date).getTime() >= rangeStart)
    );
  };

  const filteredData = filterDataByRange(chartdata, isCustomRange ? "custom" : timeRange);
  const transformedData = Object.entries(filteredData).map(([date, values]) => ({
    date,
    ydata: values[ydata],
  }));

  return (
    <div>
      {title && <h3 style={{ textAlign: "center", marginBottom: "10px", fontWeight: "normal" }}>{title}</h3>}
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={transformedData}>
          <XAxis dataKey="date" stroke="#8884d8" tick={{ fontSize: 12 }} interval={Math.ceil(transformedData.length / 8)} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="ydata" fill={barcolour} name={ydatalabel} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;