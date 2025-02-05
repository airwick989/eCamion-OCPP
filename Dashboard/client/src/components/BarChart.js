import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const BarChartComponent = ({ chartdata, ydata, ydatalabel, title, barcolour = "#82ca9d" }) => {
  // Transform object data into an array format suitable for recharts
  const data = Object.entries(chartdata).map(([date, values]) => ({
    date,
    ydata: values[ydata],
  }));

  return (
    <div>
      {title && <h3 style={{ textAlign: "center", marginBottom: "10px", fontWeight: "normal" }}>{title}</h3>}
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <XAxis dataKey="date" stroke="#8884d8" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="ydata" fill={barcolour} name={ydatalabel} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;