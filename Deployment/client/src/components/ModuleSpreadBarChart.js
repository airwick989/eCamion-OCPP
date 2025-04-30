import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const ModuleSpreadBarChart = ({ tabledata }) => {
  return (
    <ResponsiveContainer width="100%" height={500}>
      <BarChart data={tabledata} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="Module" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Average Cell Voltage" fill="#8884d8" />
        <Bar dataKey="Minimum Cell Voltage" fill="#d88484" />
        <Bar dataKey="Maximum Cell Voltage" fill="#82ca9d" />
        <Bar dataKey="Total Voltage" fill="#ff7300" />
        <Bar dataKey="Average Temperature" fill="#ffc658" />
        <Bar dataKey="Minimum Temperature" fill="#6495ED" />
        <Bar dataKey="Maximum Temperature" fill="#FF1493" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ModuleSpreadBarChart;